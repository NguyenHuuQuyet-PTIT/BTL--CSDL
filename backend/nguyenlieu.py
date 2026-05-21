from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi, cap_nhat_trang_thai_nguyen_lieu
from xacthuc import nguoi_dung_hien_tai, chi_quan_ly

router = APIRouter(prefix="/api/nguyenlieu", tags=["nguyenlieu"])

class NguyenLieuVao(BaseModel):
    ten_nl: str
    don_vi: str
    so_luong_ton: float = Field(ge=0)
    muc_canh_bao: float = Field(ge=0)
    gia_nhap_tb: int = Field(ge=0)

@router.get("")
def danh_sach(_: dict = Depends(nguoi_dung_hien_tai)):
    return lay_tat_ca("SELECT * FROM nguyenlieu ORDER BY ma_nl")

@router.post("")
def them(data: NguyenLieuVao, _: dict = Depends(chi_quan_ly)):
    conn = ket_noi()
    try:
        ma_nl = tao_ma_moi(conn, "nguyenlieu", "ma_nl", "NL")
        conn.execute(
            "INSERT INTO nguyenlieu(ma_nl, ten_nl, don_vi, so_luong_ton, muc_canh_bao, gia_nhap_tb, trang_thai) VALUES (?, ?, ?, ?, ?, ?, 'con_hang')",
            (ma_nl, data.ten_nl, data.don_vi, data.so_luong_ton, data.muc_canh_bao, data.gia_nhap_tb),
        )
        cap_nhat_trang_thai_nguyen_lieu(conn, ma_nl)
        conn.commit()
        return {"message": "Đã thêm nguyên liệu", "ma_nl": ma_nl}
    finally:
        conn.close()

@router.put("/{ma_nl}")
def sua(ma_nl: str, data: NguyenLieuVao, _: dict = Depends(chi_quan_ly)):
    conn = ket_noi()
    try:
        if not conn.execute("SELECT ma_nl FROM nguyenlieu WHERE ma_nl=?", (ma_nl,)).fetchone():
            raise HTTPException(status_code=404, detail="Không tìm thấy nguyên liệu")
        conn.execute(
            "UPDATE nguyenlieu SET ten_nl=?, don_vi=?, so_luong_ton=?, muc_canh_bao=?, gia_nhap_tb=? WHERE ma_nl=?",
            (data.ten_nl, data.don_vi, data.so_luong_ton, data.muc_canh_bao, data.gia_nhap_tb, ma_nl),
        )
        cap_nhat_trang_thai_nguyen_lieu(conn, ma_nl)
        conn.commit()
        return {"message": "Đã sửa nguyên liệu"}
    finally:
        conn.close()

@router.delete("/{ma_nl}")
def xoa(ma_nl: str, _: dict = Depends(chi_quan_ly)):
    dang_dung = lay_mot("SELECT ma_sp FROM congthuc WHERE ma_nl=? LIMIT 1", (ma_nl,))
    if dang_dung:
        raise HTTPException(status_code=400, detail="Nguyên liệu đang nằm trong công thức sản phẩm, không thể xóa")
    conn = ket_noi()
    try:
        conn.execute("DELETE FROM nguyenlieu WHERE ma_nl=?", (ma_nl,))
        conn.commit()
        return {"message": "Đã xóa nguyên liệu"}
    finally:
        conn.close()
