from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi, thoi_gian_hien_tai, cap_nhat_cap_bac_khach
from xacthuc import nguoi_dung_hien_tai

router = APIRouter(prefix="/api/khachhang", tags=["khachhang"])

class KhachHangVao(BaseModel):
    ten_kh: str
    sdt: str
    email: str = ""
    dia_chi: str = ""
    ngay_sinh: str = ""
    gioi_tinh: str = ""
    diem: int = Field(default=0, ge=0)
    ghi_chu: str = ""
    trang_thai: str = "dang_hoat_dong"

@router.get("")
def danh_sach(_: dict = Depends(nguoi_dung_hien_tai)):
    return lay_tat_ca("SELECT * FROM khachhang ORDER BY trang_thai, cap_bac DESC, ma_kh")

@router.get("/thongke/tongquan")
def thong_ke(_: dict = Depends(nguoi_dung_hien_tai)):
    return {
        "tong_khach": lay_mot("SELECT COUNT(*) AS gt FROM khachhang")["gt"],
        "dang_hoat_dong": lay_mot("SELECT COUNT(*) AS gt FROM khachhang WHERE trang_thai='dang_hoat_dong'")["gt"],
        "khach_vip": lay_mot("SELECT COUNT(*) AS gt FROM khachhang WHERE cap_bac='vip' AND trang_thai='dang_hoat_dong'")["gt"],
        "tong_diem": lay_mot("SELECT COALESCE(SUM(diem),0) AS gt FROM khachhang WHERE trang_thai='dang_hoat_dong'")["gt"],
    }

@router.get("/{ma_kh}/lichsu")
def lich_su(ma_kh: str, _: dict = Depends(nguoi_dung_hien_tai)):
    khach = lay_mot("SELECT * FROM khachhang WHERE ma_kh=?", (ma_kh,))
    if not khach:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
    don_hang = lay_tat_ca("SELECT * FROM donhang WHERE ma_kh=? ORDER BY thoi_diem DESC, ma_hd DESC", (ma_kh,))
    for dh in don_hang:
        dh["chi_tiet"] = lay_tat_ca("SELECT * FROM chitietdonhang WHERE ma_hd=? ORDER BY id", (dh["ma_hd"],))
    return {"khach_hang": khach, "don_hang": don_hang}

@router.post("")
def them(data: KhachHangVao, _: dict = Depends(nguoi_dung_hien_tai)):
    conn = ket_noi()
    try:
        ma_kh = tao_ma_moi(conn, "khachhang", "ma_kh", "KH")
        conn.execute(
            """
            INSERT INTO khachhang(ma_kh, ten_kh, sdt, email, dia_chi, ngay_sinh, gioi_tinh, diem, cap_bac, tong_chi_tieu, so_lan_mua, ngay_tao, lan_mua_cuoi, trang_thai, ghi_chu)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'thuong', 0, 0, ?, '', ?, ?)
            """,
            (ma_kh, data.ten_kh, data.sdt, data.email, data.dia_chi, data.ngay_sinh, data.gioi_tinh, data.diem, thoi_gian_hien_tai(), data.trang_thai, data.ghi_chu),
        )
        cap_nhat_cap_bac_khach(conn, ma_kh)
        conn.commit()
        return {"message": "Đã thêm khách hàng", "ma_kh": ma_kh}
    except Exception as e:
        if "UNIQUE" in str(e):
            raise HTTPException(status_code=400, detail="Số điện thoại đã tồn tại")
        raise
    finally:
        conn.close()

@router.put("/{ma_kh}")
def sua(ma_kh: str, data: KhachHangVao, _: dict = Depends(nguoi_dung_hien_tai)):
    conn = ket_noi()
    try:
        ton_tai = conn.execute("SELECT ma_kh FROM khachhang WHERE ma_kh=?", (ma_kh,)).fetchone()
        if not ton_tai:
            raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        conn.execute(
            """
            UPDATE khachhang
            SET ten_kh=?, sdt=?, email=?, dia_chi=?, ngay_sinh=?, gioi_tinh=?, diem=?, ghi_chu=?, trang_thai=?
            WHERE ma_kh=?
            """,
            (data.ten_kh, data.sdt, data.email, data.dia_chi, data.ngay_sinh, data.gioi_tinh, data.diem, data.ghi_chu, data.trang_thai, ma_kh),
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
    da_mua = lay_mot("SELECT ma_hd FROM donhang WHERE ma_kh=? LIMIT 1", (ma_kh,))
    conn = ket_noi()
    try:
        ton_tai = conn.execute("SELECT ma_kh FROM khachhang WHERE ma_kh=?", (ma_kh,)).fetchone()
        if not ton_tai:
            raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        if da_mua:
            conn.execute("UPDATE khachhang SET trang_thai='ngung_hoat_dong' WHERE ma_kh=?", (ma_kh,))
            msg = "Khách hàng đã có lịch sử mua nên đã chuyển sang trạng thái ngừng hoạt động"
        else:
            conn.execute("DELETE FROM khachhang WHERE ma_kh=?", (ma_kh,))
            msg = "Đã xóa khách hàng"
        conn.commit()
        return {"message": msg}
    finally:
        conn.close()
