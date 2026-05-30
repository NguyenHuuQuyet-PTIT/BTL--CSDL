from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..SQL.cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi, thoi_gian_hien_tai, cap_nhat_cap_bac_khach
from .xacthuc import nguoi_dung_hien_tai

router = APIRouter(prefix="/api/khachhang", tags=["khachhang"])


class KhachHangVao(BaseModel):
    TenKH: str
    SoDienThoai: str
    Email: str = ""
    DiaChi: str = ""
    NgaySinh: str = ""
    GioiTinh: str = ""
    DiemTichLuy: int = Field(default=0, ge=0)
    GhiChu: str = ""
    TrangThai: str = "dang_hoat_dong"


@router.get("")
def danh_sach(_: dict = Depends(nguoi_dung_hien_tai)):
    return lay_tat_ca("SELECT * FROM KhachHang ORDER BY TrangThai, CapBac DESC, MaKH")


@router.get("/thongke/tongquan")
def thong_ke(_: dict = Depends(nguoi_dung_hien_tai)):
    tong_khach = lay_mot("SELECT COUNT(*) AS gt FROM KhachHang")
    dang_hoat_dong = lay_mot("SELECT COUNT(*) AS gt FROM KhachHang WHERE TrangThai='dang_hoat_dong'")
    khach_vip = lay_mot("SELECT COUNT(*) AS gt FROM KhachHang WHERE CapBac='vip' AND TrangThai='dang_hoat_dong'")
    tong_diem = lay_mot("SELECT COALESCE(SUM(DiemTichLuy),0) AS gt FROM KhachHang WHERE TrangThai='dang_hoat_dong'")

    return {
        "TongKhach": tong_khach["gt"],
        "DangHoatDong": dang_hoat_dong["gt"],
        "KhachVIP": khach_vip["gt"],
        "TongDiem": tong_diem["gt"],
    }


@router.get("/{ma_kh}/lichsu")
def lich_su(ma_kh: str, _: dict = Depends(nguoi_dung_hien_tai)):
    khach = lay_mot("SELECT * FROM KhachHang WHERE MaKH=?", (ma_kh,))
    if not khach:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
    don_hang = lay_tat_ca("SELECT * FROM HoaDon WHERE MaKH=? ORDER BY ThoiDiemLap DESC, MaHD DESC", (ma_kh,))
    for dh in don_hang:
        dh["ChiTiet"] = lay_tat_ca("SELECT * FROM ChiTietHoaDon WHERE MaHD=? ORDER BY MaSP", (dh["MaHD"],))

    return {"KhachHang": khach, "DonHang": don_hang}


@router.post("")
def them(data: KhachHangVao, _: dict = Depends(nguoi_dung_hien_tai)):
    conn = ket_noi()
    try:
        ma_kh = tao_ma_moi(conn, "KhachHang", "MaKH", "KH")
        conn.execute(
            """
            INSERT INTO KhachHang(MaKH, TenKH, SoDienThoai, Email, DiaChi, NgaySinh, GioiTinh, DiemTichLuy, CapBac, TongChiTieu, SoLanMua, NgayTao, LanMuaCuoi, TrangThai, GhiChu)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'thuong', 0, 0, ?, '', ?, ?)
            """,
            (ma_kh, data.TenKH, data.SoDienThoai, data.Email, data.DiaChi, data.NgaySinh, data.GioiTinh, data.DiemTichLuy, thoi_gian_hien_tai(), data.TrangThai, data.GhiChu),
        )
        cap_nhat_cap_bac_khach(conn, ma_kh)
        conn.commit()
        return {"message": "Đã thêm khách hàng", "MaKH": ma_kh}
    except Exception as e:
        if "UNIQUE" in str(e):
            raise HTTPException(status_code=400, detail="Số điện thoại đã tồn tại")

        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.put("/{ma_kh}")
def sua(ma_kh: str, data: KhachHangVao, _: dict = Depends(nguoi_dung_hien_tai)):
    conn = ket_noi()
    try:
        ton_tai = conn.execute("SELECT MaKH FROM KhachHang WHERE MaKH=?", (ma_kh,)).fetchone()
        if not ton_tai:
            raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        conn.execute(
            """
            UPDATE KhachHang
            SET TenKH=?, SoDienThoai=?, Email=?, DiaChi=?, NgaySinh=?, GioiTinh=?, DiemTichLuy=?, GhiChu=?, TrangThai=?
            WHERE MaKH=?
            """,
            (data.TenKH, data.SoDienThoai, data.Email, data.DiaChi, data.NgaySinh, data.GioiTinh, data.DiemTichLuy, data.GhiChu, data.TrangThai, ma_kh),
        )
        cap_nhat_cap_bac_khach(conn, ma_kh)
        conn.commit()
        return {"message": "Đã sửa khách hàng"}
    except Exception as e:
        if "UNIQUE" in str(e):
            raise HTTPException(status_code=400, detail="Số điện thoại đã tồn tại")

        raise
    finally:
        conn.close()


@router.delete("/{ma_kh}")
def xoa(ma_kh: str, _: dict = Depends(nguoi_dung_hien_tai)):
    da_mua = lay_mot("SELECT MaHD FROM HoaDon WHERE MaKH=? LIMIT 1", (ma_kh,))
    conn = ket_noi()
    try:
        ton_tai = conn.execute("SELECT MaKH FROM KhachHang WHERE MaKH=?", (ma_kh,)).fetchone()
        if not ton_tai:
            raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        if da_mua:
            conn.execute("UPDATE KhachHang SET TrangThai='ngung_hoat_dong' WHERE MaKH=?", (ma_kh,))
            msg = "Khách hàng đã có lịch sử mua nên đã chuyển sang trạng thái ngừng hoạt động"
        else:
            conn.execute("DELETE FROM KhachHang WHERE MaKH=?", (ma_kh,))
            msg = "Đã xóa khách hàng"
        conn.commit()
        return {"message": msg}
    finally:
        conn.close()
