from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..SQL.cosodulieu import lay_mot
from .xacthuc import tao_token, nguoi_dung_hien_tai

router = APIRouter(prefix="/api", tags=["dangnhap"])


class DuLieuDangNhap(BaseModel):
    username: str
    mat_khau: str


@router.post("/dangnhap")
def dang_nhap(data: DuLieuDangNhap):
    user = lay_mot(
        "SELECT MaNV, TenNV, ChucVu, SoDienThoai, Username, MatKhau, TrangThai FROM NhanVien WHERE Username=?",
        (data.username,),
    )
    if not user:
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")

    mat_khau_luu_trong_db = str(user["MatKhau"] or "")

    if mat_khau_luu_trong_db != data.mat_khau:
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")

    if user["TrangThai"] != "dang_lam":
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")

    user.pop("MatKhau", None)

    # Trường VaiTro để frontend đổi sang vai_tro.
    if "ChucVu" in user:
        import unicodedata
        cv_raw = (user.get("ChucVu") or "").strip()
        folded = ''.join(c for c in unicodedata.normalize('NFKD', cv_raw) if not unicodedata.combining(c)).lower()
        if 'quan' in folded:
            user["VaiTro"] = "quan_ly"
        elif 'nhan' in folded or 'staff' in folded or folded == 'nv':
            user["VaiTro"] = "nhan_vien"
        else:
            user["VaiTro"] = folded.replace(" ", "_")

    return {"token": tao_token(user), "nguoi_dung": user}


@router.get("/toi")
def thong_tin_toi(user: dict = Depends(nguoi_dung_hien_tai)):
    return user
