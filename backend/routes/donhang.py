from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List

from ..SQL.cosodulieu import (
    ket_noi,
    lay_tat_ca,
    lay_mot,
    tao_ma_moi,
    cap_nhat_trang_thai_nguyen_lieu,
    thoi_gian_hien_tai,
    phan_tram_giam_theo_cap,
    cap_nhat_cap_bac_khach,
)
from .xacthuc import nguoi_dung_hien_tai, chi_quan_ly

router = APIRouter(prefix="/api/donhang", tags=["donhang"])


class MatHang(BaseModel):
    MaSP: str
    SoLuong: int = Field(gt=0)
    Size: str = "M"
    GhiChu: str = ""


class DonHangVao(BaseModel):
    MaKH: str | None = None
    DiemSuDung: int = Field(default=0, ge=0)
    PhuongThucThanhToan: str = "tien_mat"
    SoTienKhachDua: int = Field(default=0, ge=0)
    GhiChu: str = ""
    ChiTiet: List[MatHang]


PHU_THU_SIZE = {"S": -2000, "M": 0, "L": 5000}
GIA_TRI_MOT_DIEM = 1000
CAC_PHUONG_THUC_THANH_TOAN = {"tien_mat", "chuyen_khoan", "the", "vi_dien_tu"}


@router.get("")
def danh_sach(_: dict = Depends(nguoi_dung_hien_tai)):
    return lay_tat_ca("SELECT * FROM HoaDon ORDER BY ThoiDiemLap DESC, MaHD DESC")


@router.get("/{ma_hd}")
def chi_tiet(ma_hd: str, _: dict = Depends(nguoi_dung_hien_tai)):
    hd = lay_mot("SELECT * FROM HoaDon WHERE MaHD=?", (ma_hd,))
    if not hd:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    hd["ChiTiet"] = lay_tat_ca("SELECT * FROM ChiTietHoaDon WHERE MaHD=? ORDER BY MaSP", (ma_hd,))
    return hd


@router.post("")
def tao(data: DonHangVao, user: dict = Depends(nguoi_dung_hien_tai)):
    try:
        if not data.ChiTiet:
            raise HTTPException(status_code=400, detail="Giỏ hàng đang trống")

        conn = ket_noi()
        # tính tổng tạm từ chi tiết (không áp dụng điểm, không trừ kho ở bước tạo đơn)
        tong_tam = 0
        chi_tiet_luu = []
        for item in data.ChiTiet:
            sp = conn.execute("SELECT * FROM SanPham WHERE MaSP=? AND TrangThai='dang_ban'", (item.MaSP,)).fetchone()
            if not sp:
                raise HTTPException(status_code=400, detail=f"Sản phẩm {item.MaSP} không bán hoặc không tồn tại")
            phu_thu = PHU_THU_SIZE.get(item.Size, 0)
            don_gia = int(sp["GiaBan"]) + phu_thu
            tong_tam += don_gia * item.SoLuong
            chi_tiet_luu.append((sp, item, don_gia))

        ma_hd = tao_ma_moi(conn, "HoaDon", "MaHD", "HD")
        thoi_diem = thoi_gian_hien_tai()

        # lưu donhang với trạng thái chờ thanh toán
        ten_kh = ''
        cap_bac_kh = None
        if data.MaKH:
            kh = conn.execute("SELECT TenKH, CapBac FROM KhachHang WHERE MaKH=?", (data.MaKH,)).fetchone()
            if kh:
                ten_kh = kh.get('TenKH') or ''
                cap_bac_kh = kh.get('CapBac')

        conn.execute(
            "INSERT INTO HoaDon(MaHD, ThoiDiemLap, MaKH, TenKH, CapBacKhach, MaNV, TenNV, TongTien, TrangThai, GhiChu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'cho_thanh_toan', ?)",
            (ma_hd, thoi_diem, data.MaKH, ten_kh, cap_bac_kh, user["MaNV"], user["TenNV"], int(tong_tam), data.GhiChu.strip()),
        )

        # lưu chi tiết đơn (không trừ kho tại bước này)
        for sp, item, don_gia in chi_tiet_luu:
            conn.execute(
                "INSERT INTO ChiTietHoaDon(MaHD, MaSP, TenSP, SoLuong, DonGia, Size, GhiChu) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (ma_hd, sp["MaSP"], sp["TenSP"], item.SoLuong, don_gia, item.Size, item.GhiChu),
            )

        conn.commit()
        return {"message": "Đã tạo đơn (chờ thanh toán)", "MaHD": ma_hd, "TongTien": int(tong_tam)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            conn.close()
        except Exception:
            pass


class ThanhToanVao(BaseModel):
    SoTienKhachDua: int
    HinhThuc: str = "tien_mat"


@router.post("/{ma_hd}/thanhtoan")
def thanh_toan(ma_hd: str, data: ThanhToanVao, user: dict = Depends(nguoi_dung_hien_tai)):
    conn = ket_noi()
    try:
        hd = conn.execute("SELECT * FROM HoaDon WHERE MaHD=?", (ma_hd,)).fetchone()
        if not hd:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
        if hd["TrangThai"] == "da_thanh_toan":
            raise HTTPException(status_code=400, detail="Đơn hàng đã được thanh toán")

        # tính lại tổng từ chi tiết để tránh giả mạo
        chi = conn.execute("SELECT * FROM ChiTietHoaDon WHERE MaHD=?", (ma_hd,)).fetchall()
        if not chi:
            raise HTTPException(status_code=400, detail="Đơn hàng không có chi tiết")
        tong = 0
        can_dung = {}
        for it in chi:
            tong += int(it["DonGia"]) * int(it["SoLuong"])
            cong_thuc = conn.execute("SELECT MaNL, DinhLuong FROM CongThuc WHERE MaSP=?", (it["MaSP"],)).fetchall()
            if not cong_thuc:
                raise HTTPException(status_code=400, detail=f"Sản phẩm {it['MaSP']} chưa có công thức")
            for ct in cong_thuc:
                can_dung[ct["MaNL"]] = can_dung.get(ct["MaNL"], 0) + float(ct["DinhLuong"]) * int(it["SoLuong"])
        # kiểm tra tiền khách đưa
        if data.SoTienKhachDua < tong:
            raise HTTPException(status_code=400, detail="Số tiền khách đưa không đủ")

        # kiểm tra tồn kho theo công thức (không trừ ngay, chỉ verify)
        for ma_nl, need in can_dung.items():
            nl = conn.execute("SELECT SoLuongTon, TenNL FROM NguyenLieu WHERE MaNL=?", (ma_nl,)).fetchone()
            ten = nl["TenNL"] if nl else ma_nl
            if not nl or float(nl.get("SoLuongTon", 0) or 0) < float(need):
                raise HTTPException(status_code=400, detail=f"Nguyên liệu {ten} không đủ: cần {need}, còn {nl['SoLuongTon'] if nl else 0}")

        # tính tiền thừa và ghi nhận giao dịch thanh toán
        tien_thua = int(data.SoTienKhachDua - tong)

        ma_tt = tao_ma_moi(conn, "ThanhToan", "MaTT", "TT")
        conn.execute(
            "INSERT INTO ThanhToan(MaTT, MaHD, SoTienKhachDua, SoTienThoi, HinhThuc, ThoiDiemThanhToan) VALUES (?, ?, ?, ?, ?, ?)",
            (ma_tt, ma_hd, int(data.SoTienKhachDua), tien_thua, data.HinhThuc, thoi_gian_hien_tai()),
        )

        # trừ kho
        for ma_nl, need in can_dung.items():
            conn.execute("UPDATE NguyenLieu SET SoLuongTon = SoLuongTon - ? WHERE MaNL=?", (need, ma_nl))
            cap_nhat_trang_thai_nguyen_lieu(conn, ma_nl)

        # cập nhật donhang
        conn.execute("UPDATE HoaDon SET TrangThai='da_thanh_toan', TienKhachDua=?, TienThua=?, PhuongThucThanhToan=? WHERE MaHD=?",
             (int(data.SoTienKhachDua), tien_thua, data.HinhThuc, ma_hd))

        # cập nhật khách hàng điểm
        if hd.get("MaKH"):
            diem_cong = int(tong // 10000)
            conn.execute(
                "UPDATE KhachHang SET DiemTichLuy = DiemTichLuy + ?, TongChiTieu = TongChiTieu + ?, SoLanMua = SoLanMua + 1, LanMuaCuoi=? WHERE MaKH=?",
                (diem_cong, tong, thoi_gian_hien_tai(), hd["MaKH"]),
            )
            cap_nhat_cap_bac_khach(conn, hd["MaKH"])

        conn.commit()
        return {"message": "Thanh toán hoàn tất", "MaTT": ma_tt, "TienThua": tien_thua, "TongTien": tong}
    finally:
        conn.close()


@router.post("/{ma_hd}/huy")
def huy_don(ma_hd: str, user: dict = Depends(chi_quan_ly)):
    conn = ket_noi()
    try:
        hd = conn.execute("SELECT * FROM HoaDon WHERE MaHD=?", (ma_hd,)).fetchone()
        if not hd:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
        if hd["TrangThai"] == "da_huy":
            raise HTTPException(status_code=400, detail="Đơn hàng đã bị hủy trước đó")

        chi_tiet = conn.execute("SELECT * FROM ChiTietHoaDon WHERE MaHD=?", (ma_hd,)).fetchall()
        can_hoan = {}
        for item in chi_tiet:
            cong_thuc = conn.execute("SELECT MaNL, DinhLuong FROM CongThuc WHERE MaSP=?", (item["MaSP"],)).fetchall()
            for ct in cong_thuc:
                can_hoan[ct["MaNL"]] = can_hoan.get(ct["MaNL"], 0) + float(ct["DinhLuong"]) * int(item["SoLuong"])

        for ma_nl, so_luong in can_hoan.items():
            conn.execute("UPDATE NguyenLieu SET SoLuongTon = SoLuongTon + ? WHERE MaNL=?", (so_luong, ma_nl))
            cap_nhat_trang_thai_nguyen_lieu(conn, ma_nl)

        if hd.get("MaKH"):
            kh = conn.execute("SELECT * FROM KhachHang WHERE MaKH=?", (hd["MaKH"],)).fetchone()
            if kh:
                diem_moi = max(0, int(kh.get("DiemTichLuy", 0) or 0) + int(hd.get("DiemSuDung", 0) or 0) - int(hd.get("DiemCong", 0) or 0))
                tong_chi = max(0, int(kh.get("TongChiTieu", 0) or 0) - int(hd.get("TongTien", 0) or 0))
                so_lan = max(0, int(kh.get("SoLanMua", 0) or 0) - 1)
                conn.execute(
                    "UPDATE KhachHang SET DiemTichLuy=?, TongChiTieu=?, SoLanMua=? WHERE MaKH=?",
                    (diem_moi, tong_chi, so_lan, hd["MaKH"]),
                )
                cap_nhat_cap_bac_khach(conn, hd["MaKH"])

        ghi_chu_huy = f"Đã hủy bởi {user.get('TenNV', user.get('ten_nv'))} lúc {thoi_gian_hien_tai()}"
        ghi_chu_moi = ((hd.get("GhiChu") or "") + " | " + ghi_chu_huy).strip(" |")
        conn.execute("UPDATE HoaDon SET TrangThai='da_huy', GhiChu=? WHERE MaHD=?", (ghi_chu_moi, ma_hd))
        conn.commit()
        return {"message": "Đã hủy đơn, hoàn kho và cập nhật lại điểm khách hàng"}
    finally:
        conn.close()
