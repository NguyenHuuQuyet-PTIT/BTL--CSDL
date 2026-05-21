from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List
from cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi, cap_nhat_trang_thai_nguyen_lieu, thoi_gian_hien_tai
from xacthuc import chi_quan_ly

router = APIRouter(prefix="/api/nhaphang", tags=["nhaphang"])

class MatHangNhap(BaseModel):
    ma_nl: str
    so_luong: float = Field(gt=0)
    don_gia: int = Field(gt=0)

class PhieuNhapVao(BaseModel):
    ma_ncc: str
    ghi_chu: str = ""
    chi_tiet: List[MatHangNhap]

@router.get("")
def danh_sach(_: dict = Depends(chi_quan_ly)):
    ds = lay_tat_ca("SELECT * FROM phieunhap ORDER BY ngay_nhap DESC, ma_pn DESC")
    for pn in ds:
        pn["chi_tiet"] = lay_tat_ca("SELECT * FROM chitietphieunhap WHERE ma_pn=?", (pn["ma_pn"],))
    return ds


@router.get("/{ma_pn}")
def chi_tiet(ma_pn: str, _: dict = Depends(chi_quan_ly)):
    phieu = lay_mot("SELECT * FROM phieunhap WHERE ma_pn=?", (ma_pn,))
    if not phieu:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu nhập")
    phieu["chi_tiet"] = lay_tat_ca("SELECT * FROM chitietphieunhap WHERE ma_pn=? ORDER BY id", (ma_pn,))
    return phieu

@router.post("")
def tao(data: PhieuNhapVao, user: dict = Depends(chi_quan_ly)):
    if not data.chi_tiet:
        raise HTTPException(status_code=400, detail="Phiếu nhập chưa có nguyên liệu")
    conn = ket_noi()
    try:
        ncc = conn.execute("SELECT * FROM nhacungcap WHERE ma_ncc=?", (data.ma_ncc,)).fetchone()
        if not ncc:
            raise HTTPException(status_code=400, detail="Không tìm thấy nhà cung cấp")

        tong = 0
        ds_luu = []
        for item in data.chi_tiet:
            nl = conn.execute("SELECT * FROM nguyenlieu WHERE ma_nl=?", (item.ma_nl,)).fetchone()
            if not nl:
                raise HTTPException(status_code=400, detail=f"Không tìm thấy nguyên liệu {item.ma_nl}")
            tong += int(item.so_luong * item.don_gia)
            ds_luu.append((nl, item))

        ma_pn = tao_ma_moi(conn, "phieunhap", "ma_pn", "PN")
        conn.execute(
            "INSERT INTO phieunhap(ma_pn, ngay_nhap, ma_ncc, ten_ncc, ma_nv, ten_nv, tong_tien, ghi_chu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (ma_pn, thoi_gian_hien_tai(), data.ma_ncc, ncc["ten_ncc"], user["ma_nv"], user["ten_nv"], tong, data.ghi_chu),
        )
        for nl, item in ds_luu:
            conn.execute(
                "INSERT INTO chitietphieunhap(ma_pn, ma_nl, ten_nl, so_luong, don_gia) VALUES (?, ?, ?, ?, ?)",
                (ma_pn, nl["ma_nl"], nl["ten_nl"], item.so_luong, item.don_gia),
            )
            # Cập nhật tồn kho và giá nhập trung bình đơn giản.
            ton_cu = float(nl["so_luong_ton"])
            gia_cu = int(nl["gia_nhap_tb"])
            ton_moi = ton_cu + item.so_luong
            gia_tb = int(((ton_cu * gia_cu) + (item.so_luong * item.don_gia)) / ton_moi) if ton_moi else item.don_gia
            conn.execute("UPDATE nguyenlieu SET so_luong_ton=?, gia_nhap_tb=? WHERE ma_nl=?", (ton_moi, gia_tb, nl["ma_nl"]))
            cap_nhat_trang_thai_nguyen_lieu(conn, nl["ma_nl"])
        conn.commit()
        return {"message": "Đã tạo phiếu nhập", "ma_pn": ma_pn, "tong_tien": tong}
    finally:
        conn.close()
