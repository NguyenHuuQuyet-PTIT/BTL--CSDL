from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List
from cosodulieu import (
    ket_noi,
    lay_tat_ca,
    lay_mot,
    tao_ma_moi,
    cap_nhat_trang_thai_nguyen_lieu,
    thoi_gian_hien_tai,
    phan_tram_giam_theo_cap,
    cap_nhat_cap_bac_khach,
)
from xacthuc import nguoi_dung_hien_tai, chi_quan_ly

router = APIRouter(prefix="/api/donhang", tags=["donhang"])

class MatHang(BaseModel):
    ma_sp: str
    so_luong: int = Field(gt=0)
    size: str = "M"
    ghi_chu: str = ""

class DonHangVao(BaseModel):
    ma_kh: str | None = None
    diem_su_dung: int = Field(default=0, ge=0)
    phuong_thuc_thanh_toan: str = "tien_mat"
    tien_khach_dua: int = Field(default=0, ge=0)
    ghi_chu: str = ""
    chi_tiet: List[MatHang]

PHU_THU_SIZE = {"S": -2000, "M": 0, "L": 5000}
GIA_TRI_MOT_DIEM = 1000
CAC_PHUONG_THUC_THANH_TOAN = {"tien_mat", "chuyen_khoan", "the", "vi_dien_tu"}

@router.get("")
def danh_sach(_: dict = Depends(nguoi_dung_hien_tai)):
    return lay_tat_ca("SELECT * FROM donhang ORDER BY thoi_diem DESC, ma_hd DESC")

@router.get("/{ma_hd}")
def chi_tiet(ma_hd: str, _: dict = Depends(nguoi_dung_hien_tai)):
    hd = lay_mot("SELECT * FROM donhang WHERE ma_hd=?", (ma_hd,))
    if not hd:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    hd["chi_tiet"] = lay_tat_ca("SELECT * FROM chitietdonhang WHERE ma_hd=? ORDER BY id", (ma_hd,))
    return hd

@router.post("")
def tao(data: DonHangVao, user: dict = Depends(nguoi_dung_hien_tai)):
    if not data.chi_tiet:
        raise HTTPException(status_code=400, detail="Giỏ hàng đang trống")

    phuong_thuc = data.phuong_thuc_thanh_toan or "tien_mat"
    if phuong_thuc not in CAC_PHUONG_THUC_THANH_TOAN:
        raise HTTPException(status_code=400, detail="Phương thức thanh toán không hợp lệ")

    conn = ket_noi()
    try:
        khach = None
        ten_kh = "Khách lẻ"
        cap_bac_khach = "thuong"
        phan_tram_giam = 0
        if data.ma_kh:
            khach = conn.execute("SELECT * FROM khachhang WHERE ma_kh=?", (data.ma_kh,)).fetchone()
            if not khach:
                raise HTTPException(status_code=400, detail="Không tìm thấy khách hàng")
            if khach["trang_thai"] != "dang_hoat_dong":
                raise HTTPException(status_code=400, detail="Khách hàng đang ngừng hoạt động, không thể thanh toán")
            ten_kh = khach["ten_kh"]
            cap_bac_khach = khach["cap_bac"] or "thuong"
            phan_tram_giam = phan_tram_giam_theo_cap(cap_bac_khach)
        elif data.diem_su_dung:
            raise HTTPException(status_code=400, detail="Khách lẻ không có điểm để sử dụng")

        can_dung = {}
        chi_tiet_luu = []
        tong_truoc_giam = 0
        for item in data.chi_tiet:
            sp = conn.execute("SELECT * FROM sanpham WHERE ma_sp=? AND trang_thai='dang_ban'", (item.ma_sp,)).fetchone()
            if not sp:
                raise HTTPException(status_code=400, detail=f"Sản phẩm {item.ma_sp} không bán hoặc không tồn tại")
            if (sp["trang_thai_kho_chinh_tay"] or "tu_dong") == "het_hang":
                raise HTTPException(status_code=400, detail=f"Quản lý đã đặt sản phẩm {sp['ten_sp']} là hết hàng")
            phu_thu = PHU_THU_SIZE.get(item.size, 0)
            don_gia = int(sp["gia_ban"]) + phu_thu
            if don_gia < 0:
                don_gia = int(sp["gia_ban"])
            tong_truoc_giam += don_gia * item.so_luong
            chi_tiet_luu.append((sp, item, don_gia))

            cong_thuc = conn.execute("SELECT ma_nl, dinh_luong FROM congthuc WHERE ma_sp=?", (item.ma_sp,)).fetchall()
            if not cong_thuc:
                raise HTTPException(status_code=400, detail=f"Sản phẩm {sp['ten_sp']} chưa có công thức nguyên liệu nên chưa thể bán")
            for ct in cong_thuc:
                can_dung[ct["ma_nl"]] = can_dung.get(ct["ma_nl"], 0) + float(ct["dinh_luong"]) * item.so_luong

        for ma_nl, so_luong_can in can_dung.items():
            nl = conn.execute("SELECT ten_nl, so_luong_ton FROM nguyenlieu WHERE ma_nl=?", (ma_nl,)).fetchone()
            if not nl or float(nl["so_luong_ton"]) < so_luong_can:
                ten = nl["ten_nl"] if nl else ma_nl
                raise HTTPException(status_code=400, detail=f"Không đủ nguyên liệu: {ten}")

        giam_gia_cap_bac = int(tong_truoc_giam * phan_tram_giam / 100)
        sau_giam_cap_bac = max(0, tong_truoc_giam - giam_gia_cap_bac)
        diem_su_dung = int(data.diem_su_dung or 0)
        if khach:
            diem_hien_co = int(khach["diem"] or 0)
            if diem_su_dung > diem_hien_co:
                raise HTTPException(status_code=400, detail=f"Khách chỉ có {diem_hien_co} điểm")
            giam_gia_diem_toi_da = int(sau_giam_cap_bac * 0.5)
            giam_gia_diem = min(diem_su_dung * GIA_TRI_MOT_DIEM, giam_gia_diem_toi_da)
            diem_su_dung = int(giam_gia_diem / GIA_TRI_MOT_DIEM)
        else:
            diem_su_dung = 0
            giam_gia_diem = 0

        tong_tien = max(0, sau_giam_cap_bac - giam_gia_diem)
        if phuong_thuc == "tien_mat":
            if int(data.tien_khach_dua or 0) < tong_tien:
                raise HTTPException(status_code=400, detail="Tiền khách đưa chưa đủ")
            tien_khach_dua = int(data.tien_khach_dua or 0)
        else:
            tien_khach_dua = tong_tien
        tien_thua = max(0, tien_khach_dua - tong_tien)
        diem_cong = int(tong_tien // 10000)
        ma_hd = tao_ma_moi(conn, "donhang", "ma_hd", "HD")
        thoi_diem = thoi_gian_hien_tai()

        conn.execute(
            """
            INSERT INTO donhang(ma_hd, thoi_diem, ma_kh, ten_kh, cap_bac_khach, ma_nv, ten_nv,
                                tong_truoc_giam, giam_gia_cap_bac, diem_su_dung, giam_gia_diem,
                                tong_tien, diem_cong, trang_thai, phuong_thuc_thanh_toan,
                                tien_khach_dua, tien_thua, ghi_chu)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'da_thanh_toan', ?, ?, ?, ?)
            """,
            (ma_hd, thoi_diem, data.ma_kh, ten_kh, cap_bac_khach, user["ma_nv"], user["ten_nv"],
             tong_truoc_giam, giam_gia_cap_bac, diem_su_dung, giam_gia_diem, tong_tien, diem_cong,
             phuong_thuc, tien_khach_dua, tien_thua, data.ghi_chu.strip()),
        )

        for sp, item, don_gia in chi_tiet_luu:
            conn.execute(
                "INSERT INTO chitietdonhang(ma_hd, ma_sp, ten_sp, so_luong, don_gia, size, ghi_chu) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (ma_hd, sp["ma_sp"], sp["ten_sp"], item.so_luong, don_gia, item.size, item.ghi_chu),
            )

        for ma_nl, so_luong_can in can_dung.items():
            conn.execute("UPDATE nguyenlieu SET so_luong_ton = so_luong_ton - ? WHERE ma_nl=?", (so_luong_can, ma_nl))
            cap_nhat_trang_thai_nguyen_lieu(conn, ma_nl)

        if data.ma_kh:
            conn.execute(
                """
                UPDATE khachhang
                SET diem = diem - ? + ?, tong_chi_tieu = tong_chi_tieu + ?, so_lan_mua = so_lan_mua + 1, lan_mua_cuoi=?
                WHERE ma_kh=?
                """,
                (diem_su_dung, diem_cong, tong_tien, thoi_diem, data.ma_kh),
            )
            cap_nhat_cap_bac_khach(conn, data.ma_kh)

        conn.commit()
        return {
            "message": "Thanh toán thành công",
            "ma_hd": ma_hd,
            "tong_truoc_giam": tong_truoc_giam,
            "giam_gia_cap_bac": giam_gia_cap_bac,
            "diem_su_dung": diem_su_dung,
            "giam_gia_diem": giam_gia_diem,
            "tong_tien": tong_tien,
            "diem_cong": diem_cong,
            "cap_bac_khach": cap_bac_khach,
            "phuong_thuc_thanh_toan": phuong_thuc,
            "tien_khach_dua": tien_khach_dua,
            "tien_thua": tien_thua,
        }
    finally:
        conn.close()

@router.post("/{ma_hd}/huy")
def huy_don(ma_hd: str, user: dict = Depends(chi_quan_ly)):
    conn = ket_noi()
    try:
        hd = conn.execute("SELECT * FROM donhang WHERE ma_hd=?", (ma_hd,)).fetchone()
        if not hd:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
        if hd["trang_thai"] == "da_huy":
            raise HTTPException(status_code=400, detail="Đơn hàng đã bị hủy trước đó")

        chi_tiet = conn.execute("SELECT * FROM chitietdonhang WHERE ma_hd=?", (ma_hd,)).fetchall()
        can_hoan = {}
        for item in chi_tiet:
            cong_thuc = conn.execute("SELECT ma_nl, dinh_luong FROM congthuc WHERE ma_sp=?", (item["ma_sp"],)).fetchall()
            for ct in cong_thuc:
                can_hoan[ct["ma_nl"]] = can_hoan.get(ct["ma_nl"], 0) + float(ct["dinh_luong"]) * int(item["so_luong"])

        for ma_nl, so_luong in can_hoan.items():
            conn.execute("UPDATE nguyenlieu SET so_luong_ton = so_luong_ton + ? WHERE ma_nl=?", (so_luong, ma_nl))
            cap_nhat_trang_thai_nguyen_lieu(conn, ma_nl)

        if hd["ma_kh"]:
            kh = conn.execute("SELECT * FROM khachhang WHERE ma_kh=?", (hd["ma_kh"],)).fetchone()
            if kh:
                diem_moi = max(0, int(kh["diem"] or 0) + int(hd["diem_su_dung"] or 0) - int(hd["diem_cong"] or 0))
                tong_chi = max(0, int(kh["tong_chi_tieu"] or 0) - int(hd["tong_tien"] or 0))
                so_lan = max(0, int(kh["so_lan_mua"] or 0) - 1)
                conn.execute(
                    "UPDATE khachhang SET diem=?, tong_chi_tieu=?, so_lan_mua=? WHERE ma_kh=?",
                    (diem_moi, tong_chi, so_lan, hd["ma_kh"]),
                )
                cap_nhat_cap_bac_khach(conn, hd["ma_kh"])

        ghi_chu_huy = f"Đã hủy bởi {user['ten_nv']} lúc {thoi_gian_hien_tai()}"
        ghi_chu_moi = ((hd["ghi_chu"] or "") + " | " + ghi_chu_huy).strip(" |")
        conn.execute("UPDATE donhang SET trang_thai='da_huy', ghi_chu=? WHERE ma_hd=?", (ghi_chu_moi, ma_hd))
        conn.commit()
        return {"message": "Đã hủy đơn, hoàn kho và cập nhật lại điểm khách hàng"}
    finally:
        conn.close()
