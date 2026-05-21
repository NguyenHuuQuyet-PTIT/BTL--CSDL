from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from cosodulieu import bam_mat_khau, ket_noi, lay_tat_ca, lay_mot, tao_ma_moi
from xacthuc import chi_quan_ly

router = APIRouter(prefix="/api/nhanvien", tags=["nhanvien"])

class NhanVienVao(BaseModel):
    ten_nv: str
    vai_tro: str
    sdt: str = ""
    username: str
    mat_khau: str = ""
    trang_thai: str = "dang_lam"

@router.get("")
def danh_sach(_: dict = Depends(chi_quan_ly)):
    return lay_tat_ca("SELECT ma_nv, ten_nv, vai_tro, sdt, username, trang_thai FROM nhanvien ORDER BY ma_nv")

@router.post("")
def them(data: NhanVienVao, _: dict = Depends(chi_quan_ly)):
    if not data.mat_khau:
        raise HTTPException(status_code=400, detail="Mật khẩu không được để trống")
    conn = ket_noi()
    try:
        ma_nv = tao_ma_moi(conn, "nhanvien", "ma_nv", "NV")
        conn.execute(
            "INSERT INTO nhanvien(ma_nv, ten_nv, vai_tro, sdt, username, password_hash, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (ma_nv, data.ten_nv, data.vai_tro, data.sdt, data.username, bam_mat_khau(data.mat_khau), data.trang_thai),
        )
        conn.commit()
        return {"message": "Đã thêm nhân viên", "ma_nv": ma_nv}
    except Exception as e:
        if "UNIQUE" in str(e):
            raise HTTPException(status_code=400, detail="Username đã tồn tại")
        raise
    finally:
        conn.close()

@router.put("/{ma_nv}")
def sua(ma_nv: str, data: NhanVienVao, _: dict = Depends(chi_quan_ly)):
    conn = ket_noi()
    try:
        if data.mat_khau:
            conn.execute(
                "UPDATE nhanvien SET ten_nv=?, vai_tro=?, sdt=?, username=?, password_hash=?, trang_thai=? WHERE ma_nv=?",
                (data.ten_nv, data.vai_tro, data.sdt, data.username, bam_mat_khau(data.mat_khau), data.trang_thai, ma_nv),
            )
        else:
            conn.execute(
                "UPDATE nhanvien SET ten_nv=?, vai_tro=?, sdt=?, username=?, trang_thai=? WHERE ma_nv=?",
                (data.ten_nv, data.vai_tro, data.sdt, data.username, data.trang_thai, ma_nv),
            )
        conn.commit()
        return {"message": "Đã sửa nhân viên"}
    except Exception as e:
        if "UNIQUE" in str(e):
            raise HTTPException(status_code=400, detail="Username đã tồn tại")
        raise
    finally:
        conn.close()

@router.delete("/{ma_nv}")
def xoa(ma_nv: str, _: dict = Depends(chi_quan_ly)):
    if ma_nv == "NV001":
        raise HTTPException(status_code=400, detail="Không xóa tài khoản quản lý mẫu")
    da_ban = lay_mot("SELECT ma_hd FROM donhang WHERE ma_nv=? LIMIT 1", (ma_nv,))
    conn = ket_noi()
    try:
        if da_ban:
            conn.execute("UPDATE nhanvien SET trang_thai='nghi_lam' WHERE ma_nv=?", (ma_nv,))
            msg = "Nhân viên đã có đơn hàng nên chuyển sang trạng thái nghỉ làm"
        else:
            conn.execute("DELETE FROM nhanvien WHERE ma_nv=?", (ma_nv,))
            msg = "Đã xóa nhân viên"
        conn.commit()
        return {"message": msg}
    finally:
        conn.close()
