from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..SQL.cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi, cap_nhat_trang_thai_nguyen_lieu
from .xacthuc import nguoi_dung_hien_tai, chi_quan_ly

router = APIRouter(prefix="/api/nguyenlieu", tags=["nguyenlieu"])


class NguyenLieuVao(BaseModel):
	TenNL: str
	DonViTinh: str
	SoLuongTon: float = Field(ge=0)
	MucCanhBao: float = Field(ge=0)
	GiaNhapTB: int = Field(ge=0)


@router.get("")
def danh_sach(_: dict = Depends(nguoi_dung_hien_tai)):
	return lay_tat_ca("SELECT * FROM NguyenLieu ORDER BY MaNL")


@router.post("")
def them(data: NguyenLieuVao, _: dict = Depends(chi_quan_ly)):
	conn = ket_noi()
	try:
		ma_nl = tao_ma_moi(conn, "NguyenLieu", "MaNL", "NL")
		conn.execute(
			"INSERT INTO NguyenLieu(MaNL, TenNL, DonViTinh, SoLuongTon, MucCanhBao, GiaNhapTB, TrangThai) VALUES (?, ?, ?, ?, ?, ?, 'con_hang')",
			(ma_nl, data.TenNL, data.DonViTinh, data.SoLuongTon, data.MucCanhBao, data.GiaNhapTB),
		)
		cap_nhat_trang_thai_nguyen_lieu(conn, ma_nl)
		conn.commit()
		return {"message": "Đã thêm nguyên liệu", "MaNL": ma_nl}
	finally:
		conn.close()


@router.put("/{ma_nl}")
def sua(ma_nl: str, data: NguyenLieuVao, _: dict = Depends(chi_quan_ly)):
	conn = ket_noi()
	try:
		if not conn.execute("SELECT MaNL FROM NguyenLieu WHERE MaNL=?", (ma_nl,)).fetchone():
			raise HTTPException(status_code=404, detail="Không tìm thấy nguyên liệu")
		conn.execute(
			"UPDATE NguyenLieu SET TenNL=?, DonViTinh=?, SoLuongTon=?, MucCanhBao=?, GiaNhapTB=? WHERE MaNL= ?",
			(data.TenNL, data.DonViTinh, data.SoLuongTon, data.MucCanhBao, data.GiaNhapTB, ma_nl),
		)
		cap_nhat_trang_thai_nguyen_lieu(conn, ma_nl)
		conn.commit()
		return {"message": "Đã sửa nguyên liệu"}
	finally:
		conn.close()


@router.delete("/{ma_nl}")
def xoa(ma_nl: str, _: dict = Depends(chi_quan_ly)):
	dang_dung = lay_mot("SELECT MaSP FROM CongThuc WHERE MaNL=? LIMIT 1", (ma_nl,))
	if dang_dung:
		raise HTTPException(status_code=400, detail="Nguyên liệu đang nằm trong công thức sản phẩm, không thể xóa")
	conn = ket_noi()
	try:
		conn.execute("DELETE FROM NguyenLieu WHERE MaNL=?", (ma_nl,))
		conn.commit()
		return {"message": "Đã xóa nguyên liệu"}
	finally:
		conn.close()


