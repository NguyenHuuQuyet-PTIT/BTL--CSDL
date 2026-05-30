from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..SQL.cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi
from .xacthuc import chi_quan_ly

router = APIRouter(prefix="/api/nhanvien", tags=["nhanvien"])

class NhanVienVao(BaseModel):
    TenNV: str
    ChucVu: str
    SoDienThoai: str = ""
    Username: str
    MatKhau: str = ""
    TrangThai: str = "dang_lam"


@router.get("")
def danh_sach(_: dict = Depends(chi_quan_ly)):
    rows = lay_tat_ca("SELECT MaNV, TenNV, ChucVu, SoDienThoai, Username, TrangThai FROM NhanVien ORDER BY MaNV")
    # Thêm trường VaiTro (chuẩn hoá) để frontend nhận `vai_tro` (snake_case)
    def _normalize_vaitro(chucvu: str) -> str:
        if not chucvu:
            return ""
        import unicodedata
        cu = str(chucvu).strip()
        # fold accents for reliable matching
        folded = ''.join(c for c in unicodedata.normalize('NFKD', cu) if not unicodedata.combining(c)).lower()
        if 'quan' in folded:
            return 'quan_ly'
        if 'nhan' in folded or 'staff' in folded or folded == 'nv':
            return 'nhan_vien'
        return cu.replace(' ', '_')

    for r in rows:
        if 'ChucVu' in r:
            r['VaiTro'] = _normalize_vaitro(r.get('ChucVu'))
    return rows


@router.post("")
def them(data: NhanVienVao, _: dict = Depends(chi_quan_ly)):
    if not data.MatKhau:
        raise HTTPException(status_code=400, detail="Mật khẩu không được để trống")
    conn = ket_noi()
    try:
        ma_nv = tao_ma_moi(conn, "NhanVien", "MaNV", "NV")
        # Lưu `ChucVu` dưới dạng có dấu (tiếng Việt) theo chuẩn hiển thị
        def _to_db_chucvu(v: str) -> str:
            if not v:
                return ''
            vv = str(v).strip().lower()
            if vv in ('quan_ly', 'quanly', 'ql', 'quan ly', 'quan'):
                return 'Quản lý'
            if vv in ('nhan_vien', 'nhanvien', 'nv', 'nhân viên', 'nhan vien', 'staff'):
                return 'Nhân viên'
            # giữ nguyên (hoặc capital hóa đầu)
            return v

        db_chucvu = _to_db_chucvu(data.ChucVu)
        # Ngăn không cho thêm tài khoản quản lý từ giao diện
        if db_chucvu == 'Quản lý':
            raise HTTPException(status_code=400, detail="Không được phép thêm tài khoản quản lý")
        conn.execute(
            "INSERT INTO NhanVien(MaNV, TenNV, ChucVu, SoDienThoai, Username, MatKhau, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (ma_nv, data.TenNV, db_chucvu, data.SoDienThoai, data.Username, data.MatKhau, data.TrangThai),
        )
        conn.commit()
        return {"message": "Đã thêm nhân viên", "MaNV": ma_nv}
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
        def _to_db_chucvu(v: str) -> str:
            if not v:
                return ''
            vv = str(v).strip().lower()
            if vv in ('quan_ly', 'quanly', 'ql', 'quan ly', 'quan'):
                return 'Quản lý'
            if vv in ('nhan_vien', 'nhanvien', 'nv', 'nhân viên', 'nhan vien', 'staff'):
                return 'Nhân viên'
            return v

        db_chucvu = _to_db_chucvu(data.ChucVu)
        if db_chucvu == 'Quản lý':
            raise HTTPException(status_code=400, detail="Không được phép gán vai trò quản lý")
        if data.MatKhau:
            mat_khau_moi = data.MatKhau
            conn.execute(
                "UPDATE NhanVien SET TenNV=?, ChucVu=?, SoDienThoai=?, Username=?, MatKhau=?, TrangThai=? WHERE MaNV= ?",
                (data.TenNV, db_chucvu, data.SoDienThoai, data.Username, mat_khau_moi, data.TrangThai, ma_nv),
            )
        else:
            conn.execute(
                "UPDATE NhanVien SET TenNV=?, ChucVu=?, SoDienThoai=?, Username=?, TrangThai=? WHERE MaNV=?",
                (data.TenNV, db_chucvu, data.SoDienThoai, data.Username, data.TrangThai, ma_nv),
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
    tai_khoan = lay_mot("SELECT ChucVu FROM NhanVien WHERE MaNV=?", (ma_nv,))
    # Chuẩn hoá giá trị ChucVu để kiểm tra
    def _is_quan_ly(chucvu: str) -> bool:
        if not chucvu:
            return False
        cu = str(chucvu).strip().lower()
        return 'quan' in cu

    if tai_khoan and _is_quan_ly(tai_khoan.get("ChucVu")):
        raise HTTPException(status_code=400, detail="Không xóa tài khoản quản lý")
    da_ban = lay_mot("SELECT MaHD FROM HoaDon WHERE MaNV=? LIMIT 1", (ma_nv,))
    conn = ket_noi()
    try:
        if da_ban:
            conn.execute("UPDATE NhanVien SET TrangThai='nghi_lam' WHERE MaNV=?", (ma_nv,))
            msg = "Nhân viên đã có đơn hàng nên chuyển sang trạng thái nghỉ làm"
        else:
            conn.execute("DELETE FROM NhanVien WHERE MaNV=?", (ma_nv,))
            msg = "Đã xóa nhân viên"
        conn.commit()
        return {"message": msg}
    finally:
        conn.close()
