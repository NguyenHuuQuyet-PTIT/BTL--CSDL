from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List

from ..SQL.cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi, cap_nhat_trang_thai_nguyen_lieu, thoi_gian_hien_tai
from .xacthuc import chi_quan_ly

router = APIRouter(prefix="/api/nhaphang", tags=["nhaphang"])


class MatHangNhap(BaseModel):
    MaNL: str
    SoLuongNhap: float = Field(gt=0)
    DonGiaNhap: int = Field(gt=0)


class PhieuNhapVao(BaseModel):
    MaNCC: str
    GhiChu: str = ""
    ChiTiet: List[MatHangNhap]


@router.get("")
def danh_sach(_: dict = Depends(chi_quan_ly)):
    ds = lay_tat_ca("SELECT * FROM PhieuNhap ORDER BY NgayNhap DESC, MaPN DESC")
    for pn in ds:
        pn["ChiTiet"] = lay_tat_ca("SELECT * FROM ChiTietPhieuNhap WHERE MaPN=?", (pn["MaPN"],))
    return ds


@router.get("/{ma_pn}")
def chi_tiet(ma_pn: str, _: dict = Depends(chi_quan_ly)):
    phieu = lay_mot("SELECT * FROM PhieuNhap WHERE MaPN=?", (ma_pn,))
    if not phieu:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu nhập")
    phieu["ChiTiet"] = lay_tat_ca("SELECT * FROM ChiTietPhieuNhap WHERE MaPN=? ORDER BY MaNL", (ma_pn,))
    return phieu


@router.post("")
def tao(data: PhieuNhapVao, user: dict = Depends(chi_quan_ly)):
    try:
        if not data.ChiTiet:
            raise HTTPException(status_code=400, detail="Phiếu nhập chưa có nguyên liệu")
        conn = ket_noi()
        ncc = conn.execute("SELECT * FROM NhaCungCap WHERE MaNCC=?", (data.MaNCC,)).fetchone()
        if not ncc:
            raise HTTPException(status_code=400, detail="Không tìm thấy nhà cung cấp")

        tong = 0
        ds_luu = []
        for item in data.ChiTiet:
            nl = conn.execute("SELECT * FROM NguyenLieu WHERE MaNL=?", (item.MaNL,)).fetchone()
            if not nl:
                raise HTTPException(status_code=400, detail=f"Không tìm thấy nguyên liệu {item.MaNL}")
            tong += int(item.SoLuongNhap * item.DonGiaNhap)
            ds_luu.append((nl, item))

        ma_pn = tao_ma_moi(conn, "PhieuNhap", "MaPN", "PN")
        conn.execute(
            "INSERT INTO PhieuNhap(MaPN, NgayNhap, MaNCC, TenNCC, MaNV, TenNV, TongTienNhap, GhiChu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (ma_pn, thoi_gian_hien_tai(), data.MaNCC, ncc["TenNCC"], user.get("MaNV", user.get("ma_nv")), user.get("TenNV", user.get("ten_nv")), tong, data.GhiChu),
        )
        for nl, item in ds_luu:
            thanh_tien = int(item.SoLuongNhap * item.DonGiaNhap)
            conn.execute(
                "INSERT INTO ChiTietPhieuNhap(MaPN, MaNL, TenNL, SoLuongNhap, DonGiaNhap, ThanhTien) VALUES (?, ?, ?, ?, ?, ?)",
                (ma_pn, nl["MaNL"], nl["TenNL"], item.SoLuongNhap, item.DonGiaNhap, thanh_tien),
            )
            # Cập nhật tồn kho và giá nhập trung bình đơn giản.
            ton_cu = float(nl["SoLuongTon"])
            gia_cu = int(nl["GiaNhapTB"])
            ton_moi = ton_cu + item.SoLuongNhap
            gia_tb = int(((ton_cu * gia_cu) + (item.SoLuongNhap * item.DonGiaNhap)) / ton_moi) if ton_moi else item.DonGiaNhap
            conn.execute("UPDATE NguyenLieu SET SoLuongTon=?, GiaNhapTB=? WHERE MaNL=?", (ton_moi, gia_tb, nl["MaNL"]))
            cap_nhat_trang_thai_nguyen_lieu(conn, nl["MaNL"])
        conn.commit()
        return {"message": "Đã tạo phiếu nhập", "MaPN": ma_pn, "TongTienNhap": tong}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            conn.close()
        except Exception:
            pass
