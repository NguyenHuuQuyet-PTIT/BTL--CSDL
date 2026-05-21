from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from cosodulieu import bam_mat_khau, lay_mot
from xacthuc import tao_token, nguoi_dung_hien_tai

router = APIRouter(prefix="/api", tags=["dangnhap"])

class DuLieuDangNhap(BaseModel):
    username: str
    mat_khau: str

@router.post("/dangnhap")
def dang_nhap(data: DuLieuDangNhap):
    user = lay_mot(
        "SELECT ma_nv, ten_nv, vai_tro, sdt, username, password_hash, trang_thai FROM nhanvien WHERE username=?",
        (data.username,),
    )
    if not user or user["password_hash"] != bam_mat_khau(data.mat_khau) or user["trang_thai"] != "dang_lam":
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")
    user.pop("password_hash", None)
    return {"token": tao_token(user), "nguoi_dung": user}

@router.get("/toi")
def thong_tin_toi(user: dict = Depends(nguoi_dung_hien_tai)):
    return user
