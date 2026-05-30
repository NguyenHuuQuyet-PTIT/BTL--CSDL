from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..SQL.cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi
from .xacthuc import nguoi_dung_hien_tai, chi_quan_ly

router = APIRouter(prefix="/api/nhacungcap", tags=["nhacungcap"])


class NhaCungCapVao(BaseModel):
    TenNCC: str
    SoDienThoai: str = ""
    DiaChi: str = ""
    GhiChu: str = ""


@router.get("")
def danh_sach(_: dict = Depends(nguoi_dung_hien_tai)):
    return lay_tat_ca("SELECT * FROM NhaCungCap ORDER BY MaNCC")


@router.post("")
def them(data: NhaCungCapVao, _: dict = Depends(chi_quan_ly)):
    conn = ket_noi()
    try:
        ma_ncc = tao_ma_moi(conn, "NhaCungCap", "MaNCC", "NCC")
        conn.execute("INSERT INTO NhaCungCap(MaNCC, TenNCC, SoDienThoai, DiaChi, GhiChu) VALUES (?, ?, ?, ?, ?)", (ma_ncc, data.TenNCC, data.SoDienThoai, data.DiaChi, data.GhiChu))
        conn.commit()
        return {"message": "Đã thêm nhà cung cấp", "MaNCC": ma_ncc}
    finally:
        conn.close()


@router.put("/{ma_ncc}")
def sua(ma_ncc: str, data: NhaCungCapVao, _: dict = Depends(chi_quan_ly)):
    conn = ket_noi()
    try:
        conn.execute("UPDATE NhaCungCap SET TenNCC=?, SoDienThoai=?, DiaChi=?, GhiChu=? WHERE MaNCC=?", (data.TenNCC, data.SoDienThoai, data.DiaChi, data.GhiChu, ma_ncc))
        conn.commit()
        return {"message": "Đã sửa nhà cung cấp"}
    finally:
        conn.close()


@router.delete("/{ma_ncc}")
def xoa(ma_ncc: str, _: dict = Depends(chi_quan_ly)):
    da_nhap = lay_mot("SELECT MaPN FROM PhieuNhap WHERE MaNCC=? LIMIT 1", (ma_ncc,))
    if da_nhap:
        raise HTTPException(status_code=400, detail="Nhà cung cấp đã có phiếu nhập, không thể xóa")
    conn = ket_noi()
    try:
        conn.execute("DELETE FROM NhaCungCap WHERE MaNCC=?", (ma_ncc,))
        conn.commit()
        return {"message": "Đã xóa nhà cung cấp"}
    finally:
        conn.close()
