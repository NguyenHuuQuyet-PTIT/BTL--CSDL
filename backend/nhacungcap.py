from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi
from xacthuc import nguoi_dung_hien_tai, chi_quan_ly

router = APIRouter(prefix="/api/nhacungcap", tags=["nhacungcap"])

class NhaCungCapVao(BaseModel):
    ten_ncc: str
    sdt: str = ""
    dia_chi: str = ""
    ghi_chu: str = ""

@router.get("")
def danh_sach(_: dict = Depends(nguoi_dung_hien_tai)):
    return lay_tat_ca("SELECT * FROM nhacungcap ORDER BY ma_ncc")

@router.post("")
def them(data: NhaCungCapVao, _: dict = Depends(chi_quan_ly)):
    conn = ket_noi()
    try:
        ma_ncc = tao_ma_moi(conn, "nhacungcap", "ma_ncc", "NCC")
        conn.execute("INSERT INTO nhacungcap(ma_ncc, ten_ncc, sdt, dia_chi, ghi_chu) VALUES (?, ?, ?, ?, ?)", (ma_ncc, data.ten_ncc, data.sdt, data.dia_chi, data.ghi_chu))
        conn.commit()
        return {"message": "Đã thêm nhà cung cấp", "ma_ncc": ma_ncc}
    finally:
        conn.close()

@router.put("/{ma_ncc}")
def sua(ma_ncc: str, data: NhaCungCapVao, _: dict = Depends(chi_quan_ly)):
    conn = ket_noi()
    try:
        conn.execute("UPDATE nhacungcap SET ten_ncc=?, sdt=?, dia_chi=?, ghi_chu=? WHERE ma_ncc=?", (data.ten_ncc, data.sdt, data.dia_chi, data.ghi_chu, ma_ncc))
        conn.commit()
        return {"message": "Đã sửa nhà cung cấp"}
    finally:
        conn.close()

@router.delete("/{ma_ncc}")
def xoa(ma_ncc: str, _: dict = Depends(chi_quan_ly)):
    da_nhap = lay_mot("SELECT ma_pn FROM phieunhap WHERE ma_ncc=? LIMIT 1", (ma_ncc,))
    if da_nhap:
        raise HTTPException(status_code=400, detail="Nhà cung cấp đã có phiếu nhập, không thể xóa")
    conn = ket_noi()
    try:
        conn.execute("DELETE FROM nhacungcap WHERE ma_ncc=?", (ma_ncc,))
        conn.commit()
        return {"message": "Đã xóa nhà cung cấp"}
    finally:
        conn.close()
