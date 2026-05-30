import math
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..SQL.cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi
from .xacthuc import nguoi_dung_hien_tai, chi_quan_ly

router = APIRouter(prefix="/api/sanpham", tags=["sanpham"])

CAC_TRANG_THAI_BAN = {"dang_ban", "ngung_ban"}
CAC_TRANG_THAI_KHO_CHINH_TAY = {"tu_dong", "con_hang", "sap_het", "het_hang"}
TEN_TRANG_THAI_KHO = {"con_hang": "Còn hàng", "sap_het": "Sắp hết", "het_hang": "Hết hàng", "chua_co_cong_thuc": "Chưa có công thức"}


def kiem_tra_trang_thai(data: "SanPhamVao"):
    if data.TrangThai not in CAC_TRANG_THAI_BAN:
        raise HTTPException(status_code=400, detail="Trạng thái bán không hợp lệ")
    if data.TrangThaiKhoChinhTay not in CAC_TRANG_THAI_KHO_CHINH_TAY:
        raise HTTPException(status_code=400, detail="Trạng thái kho chỉnh tay không hợp lệ")


class CongThuc(BaseModel):
    MaNL: str
    DinhLuong: float = Field(gt=0)
    model_config = {"arbitrary_types_allowed": True}


class SanPhamVao(BaseModel):
    TenSP: str
    LoaiSP: str
    GiaBan: int = Field(gt=0)
    HinhAnh: str = ""
    TrangThai: str = "dang_ban"
    # tu_dong: hệ thống tự tính theo kho; con_hang/sap_het/het_hang: quản lý chỉnh thủ công
    TrangThaiKhoChinhTay: str = "tu_dong"
    GhiChuKho: str = ""
    MoTa: str = ""
    CongThuc: list[CongThuc] = Field(default_factory=list)
    model_config = {"arbitrary_types_allowed": True}


class TrangThaiKhoVao(BaseModel):
    TrangThaiKhoChinhTay: str = "tu_dong"
    GhiChuKho: str = ""


def gan_cong_thuc(conn, ma_sp: str, cong_thuc: list[CongThuc]):
    conn.execute("DELETE FROM CongThuc WHERE MaSP=?", (ma_sp,))
    for ct in cong_thuc:
        ma_nl = getattr(ct, "MaNL", None)
        if ma_nl is None and isinstance(ct, dict):
            ma_nl = ct.get("MaNL")

        dinh_luong = getattr(ct, "DinhLuong", None)
        if dinh_luong is None and isinstance(ct, dict):
            dinh_luong = ct.get("DinhLuong")

        nl = conn.execute("SELECT MaNL FROM NguyenLieu WHERE MaNL=?", (ma_nl,)).fetchone()
        if not nl:
            raise HTTPException(status_code=400, detail=f"Không tồn tại nguyên liệu {ma_nl}")

        conn.execute("INSERT INTO CongThuc(MaSP, MaNL, DinhLuong) VALUES (?, ?, ?)", (ma_sp, ma_nl, dinh_luong))

def lay_cong_thuc(ma_sp: str):
    return lay_tat_ca(
        """
        SELECT ct.MaNL, nl.TenNL, nl.DonViTinh, nl.SoLuongTon, nl.MucCanhBao, ct.DinhLuong
        FROM CongThuc ct JOIN NguyenLieu nl ON nl.MaNL = ct.MaNL
        WHERE ct.MaSP=? ORDER BY nl.TenNL
        """,
        (ma_sp,),
    )


def tinh_trang_thai_kho(conn, ma_sp: str) -> dict:
    """Tính số ly còn bán được dựa trên công thức sản phẩm và tồn kho nguyên liệu."""
    cong_thuc = conn.execute(
        """
        SELECT ct.MaNL, nl.TenNL, nl.DonViTinh, nl.SoLuongTon, nl.MucCanhBao, ct.DinhLuong
        FROM CongThuc ct JOIN NguyenLieu nl ON nl.MaNL = ct.MaNL
        WHERE ct.MaSP=?
        """,
        (ma_sp,),
    ).fetchall()

    if not cong_thuc:
        return {
            "SoLyCoTheBan": 0,
            "TrangThaiKho": "chua_co_cong_thuc",
            "TenTrangThaiKho": "Chưa có công thức",
            "CoTheBan": False,
            "NguyenLieuThieu": [],
            "CanhBaoKho": "Sản phẩm chưa có công thức nguyên liệu nên chưa thể bán.",
        }

    so_ly_nho_nhat = None
    nguyen_lieu_thieu = []
    co_nguyen_lieu_sap_het = False

    for ct in cong_thuc:
        dinh_luong = float(ct["DinhLuong"] or 0)
        so_luong_ton = float(ct["SoLuongTon"] or 0)
        muc_canh_bao = float(ct["MucCanhBao"] or 0)

        if dinh_luong <= 0:
            so_ly = 0
        else:
            so_ly = math.floor(so_luong_ton / dinh_luong)

        if so_ly_nho_nhat is None or so_ly < so_ly_nho_nhat:
            so_ly_nho_nhat = so_ly

        if so_luong_ton <= muc_canh_bao:
            co_nguyen_lieu_sap_het = True

        if so_ly <= 0:
            nguyen_lieu_thieu.append(
                {
                    "MaNL": ct["MaNL"],
                    "TenNL": ct["TenNL"],
                    "DonViTinh": ct["DonViTinh"],
                    "SoLuongTon": so_luong_ton,
                    "DinhLuongCan": dinh_luong,
                }
            )

    so_ly_co_the_ban = max(0, int(so_ly_nho_nhat or 0))
    if so_ly_co_the_ban <= 0:
        trang_thai = "het_hang"
        ten = "Hết hàng"
    elif so_ly_co_the_ban <= 5 or co_nguyen_lieu_sap_het:
        trang_thai = "sap_het"
        ten = "Sắp hết"
    else:
        trang_thai = "con_hang"
        ten = "Còn hàng"

    return {
        "SoLyCoTheBan": so_ly_co_the_ban,
        "TrangThaiKho": trang_thai,
        "TenTrangThaiKho": ten,
        "CoTheBan": so_ly_co_the_ban > 0,
        "NguyenLieuThieu": nguyen_lieu_thieu,
        "CanhBaoKho": "" if so_ly_co_the_ban > 0 else "Không đủ nguyên liệu để bán sản phẩm này.",
    }


def ap_dung_trang_thai_kho_chinh_tay(sp: dict, tinh_tu_dong: dict) -> dict:
    """Ghép trạng thái tự động với trạng thái quản lý chỉnh tay.
    Backend vẫn kiểm tra nguyên liệu thật khi thanh toán để tránh âm kho.
    """
    # tinh_tu_dong keys are PascalCase now
    sp.update(tinh_tu_dong)
    sp["TrangThaiKhoTuDong"] = tinh_tu_dong["TrangThaiKho"]
    sp["TenTrangThaiKhoTuDong"] = tinh_tu_dong["TenTrangThaiKho"]
    sp["SoLyCoTheBanTuDong"] = tinh_tu_dong["SoLyCoTheBan"]
    sp["CoTheBanTuDong"] = tinh_tu_dong["CoTheBan"]

    cach_chinh = sp.get("TrangThaiKhoChinhTay") or "tu_dong"
    sp["TrangThaiKhoDuocChinhTay"] = cach_chinh != "tu_dong"

    if cach_chinh != "tu_dong":
        sp["TrangThaiKho"] = cach_chinh
        sp["TenTrangThaiKho"] = TEN_TRANG_THAI_KHO.get(cach_chinh, cach_chinh)
        if cach_chinh == "het_hang":
            sp["CoTheBan"] = False
            sp["CanhBaoKho"] = sp.get("GhiChuKho") or "Quản lý đã đặt sản phẩm này là hết hàng."
        elif not tinh_tu_dong["CoTheBan"]:
            sp["CoTheBan"] = False
            sp["CanhBaoKho"] = "Quản lý đặt trạng thái thủ công nhưng kho thực tế chưa đủ nguyên liệu."
        else:
            sp["CoTheBan"] = True
            sp["CanhBaoKho"] = sp.get("GhiChuKho") or "Trạng thái kho đang được quản lý chỉnh thủ công."

    if sp.get("TrangThai") != "dang_ban":
        sp["CoTheBan"] = False
        sp["CanhBaoKho"] = "Sản phẩm đang ngừng bán."

    return sp


def kem_cong_thuc(ds):
    conn = ket_noi()
    try:
        for sp in ds:
            sp["CongThuc"] = [dict(row) for row in conn.execute(
                """
                SELECT ct.MaNL, nl.TenNL, nl.DonViTinh, nl.SoLuongTon, nl.MucCanhBao, ct.DinhLuong
                FROM CongThuc ct JOIN NguyenLieu nl ON nl.MaNL = ct.MaNL
                WHERE ct.MaSP=? ORDER BY nl.TenNL
                """,
                (sp["MaSP"],),
            ).fetchall()]
            tinh_tu_dong = tinh_trang_thai_kho(conn, sp["MaSP"])
            ap_dung_trang_thai_kho_chinh_tay(sp, tinh_tu_dong)
        return ds
    finally:
        conn.close()


@router.get("")
def danh_sach(_: dict = Depends(nguoi_dung_hien_tai)):
    ds = lay_tat_ca("SELECT * FROM SanPham ORDER BY MaSP")
    return kem_cong_thuc(ds)


@router.post("")
def them(data: SanPhamVao, _: dict = Depends(chi_quan_ly)):
    try:
        kiem_tra_trang_thai(data)
        conn = ket_noi()
        ma_sp = tao_ma_moi(conn, "SanPham", "MaSP", "SP")
        conn.execute(
            "INSERT INTO SanPham(MaSP, TenSP, LoaiSP, GiaBan, HinhAnh, TrangThai, TrangThaiKhoChinhTay, GhiChuKho, MoTa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (ma_sp, data.TenSP, data.LoaiSP, data.GiaBan, data.HinhAnh.strip(), data.TrangThai, data.TrangThaiKhoChinhTay, data.GhiChuKho.strip(), data.MoTa),
        )
        gan_cong_thuc(conn, ma_sp, data.CongThuc)
        conn.commit()
        return {"message": "Đã thêm sản phẩm", "MaSP": ma_sp}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            conn.close()
        except Exception:
            pass


@router.put("/{ma_sp}")
def sua(ma_sp: str, data: SanPhamVao, _: dict = Depends(chi_quan_ly)):
    kiem_tra_trang_thai(data)
    conn = ket_noi()
    try:
        ton_tai = conn.execute("SELECT MaSP FROM SanPham WHERE MaSP=?", (ma_sp,)).fetchone()
        if not ton_tai:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        conn.execute(
            "UPDATE SanPham SET TenSP=?, LoaiSP=?, GiaBan=?, HinhAnh=?, TrangThai=?, TrangThaiKhoChinhTay=?, GhiChuKho=?, MoTa=? WHERE MaSP=?",
            (data.TenSP, data.LoaiSP, data.GiaBan, data.HinhAnh.strip(), data.TrangThai, data.TrangThaiKhoChinhTay, data.GhiChuKho.strip(), data.MoTa, ma_sp),
        )
        gan_cong_thuc(conn, ma_sp, data.CongThuc)
        conn.commit()
        return {"message": "Đã sửa sản phẩm"}
    finally:
        conn.close()


@router.patch("/{ma_sp}/trangthaikho")
def doi_trang_thai_kho(ma_sp: str, data: TrangThaiKhoVao, _: dict = Depends(chi_quan_ly)):
    if data.TrangThaiKhoChinhTay not in CAC_TRANG_THAI_KHO_CHINH_TAY:
        raise HTTPException(status_code=400, detail="Trạng thái kho chỉnh tay không hợp lệ")
    conn = ket_noi()
    try:
        ton_tai = conn.execute("SELECT MaSP FROM SanPham WHERE MaSP=?", (ma_sp,)).fetchone()
        if not ton_tai:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        conn.execute(
            "UPDATE SanPham SET TrangThaiKhoChinhTay=?, GhiChuKho=? WHERE MaSP=?",
            (data.TrangThaiKhoChinhTay, data.GhiChuKho.strip(), ma_sp),
        )
        conn.commit()
        ten = "Tự động theo kho" if data.TrangThaiKhoChinhTay == "tu_dong" else TEN_TRANG_THAI_KHO[data.TrangThaiKhoChinhTay]
        return {"message": f"Đã đổi trạng thái kho sản phẩm sang: {ten}"}
    finally:
        conn.close()


@router.delete("/{ma_sp}")
def xoa(ma_sp: str, _: dict = Depends(chi_quan_ly)):
    da_ban = lay_mot("SELECT 1 AS exists_flag FROM ChiTietHoaDon WHERE MaSP=? LIMIT 1", (ma_sp,))
    if da_ban:
        raise HTTPException(status_code=400, detail="Sản phẩm đã có trong đơn hàng, không nên xóa. Hãy đổi trạng thái ngừng bán.")
    conn = ket_noi()
    try:
        conn.execute("DELETE FROM SanPham WHERE MaSP=?", (ma_sp,))
        conn.commit()
        return {"message": "Đã xóa sản phẩm"}
    finally:
        conn.close()
