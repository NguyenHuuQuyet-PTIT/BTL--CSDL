import math
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List
from cosodulieu import ket_noi, lay_tat_ca, lay_mot, tao_ma_moi
from xacthuc import nguoi_dung_hien_tai, chi_quan_ly

router = APIRouter(prefix="/api/sanpham", tags=["sanpham"])

CAC_TRANG_THAI_BAN = {"dang_ban", "ngung_ban"}
CAC_TRANG_THAI_KHO_CHINH_TAY = {"tu_dong", "con_hang", "sap_het", "het_hang"}
TEN_TRANG_THAI_KHO = {"con_hang": "Còn hàng", "sap_het": "Sắp hết", "het_hang": "Hết hàng", "chua_co_cong_thuc": "Chưa có công thức"}

def kiem_tra_trang_thai(data: "SanPhamVao"):
    if data.trang_thai not in CAC_TRANG_THAI_BAN:
        raise HTTPException(status_code=400, detail="Trạng thái bán không hợp lệ")
    if data.trang_thai_kho_chinh_tay not in CAC_TRANG_THAI_KHO_CHINH_TAY:
        raise HTTPException(status_code=400, detail="Trạng thái kho chỉnh tay không hợp lệ")


class CongThuc(BaseModel):
    ma_nl: str
    dinh_luong: float = Field(gt=0)

class SanPhamVao(BaseModel):
    ten_sp: str
    loai: str
    gia_ban: int = Field(gt=0)
    trang_thai: str = "dang_ban"
    # tu_dong: hệ thống tự tính theo kho; con_hang/sap_het/het_hang: quản lý chỉnh thủ công
    trang_thai_kho_chinh_tay: str = "tu_dong"
    ghi_chu_kho: str = ""
    mo_ta: str = ""
    cong_thuc: List[CongThuc] = []

class TrangThaiKhoVao(BaseModel):
    trang_thai_kho_chinh_tay: str = "tu_dong"
    ghi_chu_kho: str = ""

def gan_cong_thuc(conn, ma_sp: str, cong_thuc: list[CongThuc]):
    conn.execute("DELETE FROM congthuc WHERE ma_sp=?", (ma_sp,))
    for ct in cong_thuc:
        nl = conn.execute("SELECT ma_nl FROM nguyenlieu WHERE ma_nl=?", (ct.ma_nl,)).fetchone()
        if not nl:
            raise HTTPException(status_code=400, detail=f"Không tồn tại nguyên liệu {ct.ma_nl}")
        conn.execute("INSERT INTO congthuc(ma_sp, ma_nl, dinh_luong) VALUES (?, ?, ?)", (ma_sp, ct.ma_nl, ct.dinh_luong))

def lay_cong_thuc(ma_sp: str):
    return lay_tat_ca(
        """
        SELECT ct.ma_nl, nl.ten_nl, nl.don_vi, nl.so_luong_ton, nl.muc_canh_bao, ct.dinh_luong
        FROM congthuc ct JOIN nguyenlieu nl ON nl.ma_nl = ct.ma_nl
        WHERE ct.ma_sp=? ORDER BY nl.ten_nl
        """,
        (ma_sp,),
    )


def tinh_trang_thai_kho(conn, ma_sp: str) -> dict:
    """Tính số ly còn bán được dựa trên công thức sản phẩm và tồn kho nguyên liệu."""
    cong_thuc = conn.execute(
        """
        SELECT ct.ma_nl, nl.ten_nl, nl.don_vi, nl.so_luong_ton, nl.muc_canh_bao, ct.dinh_luong
        FROM congthuc ct JOIN nguyenlieu nl ON nl.ma_nl = ct.ma_nl
        WHERE ct.ma_sp=?
        """,
        (ma_sp,),
    ).fetchall()

    if not cong_thuc:
        return {
            "so_ly_co_the_ban": 0,
            "trang_thai_kho": "chua_co_cong_thuc",
            "ten_trang_thai_kho": "Chưa có công thức",
            "co_the_ban": False,
            "nguyen_lieu_thieu": [],
            "canh_bao_kho": "Sản phẩm chưa có công thức nguyên liệu nên chưa thể bán.",
        }

    so_ly_nho_nhat = None
    nguyen_lieu_thieu = []
    co_nguyen_lieu_sap_het = False

    for ct in cong_thuc:
        dinh_luong = float(ct["dinh_luong"] or 0)
        so_luong_ton = float(ct["so_luong_ton"] or 0)
        muc_canh_bao = float(ct["muc_canh_bao"] or 0)

        if dinh_luong <= 0:
            so_ly = 0
        else:
            so_ly = math.floor(so_luong_ton / dinh_luong)

        if so_ly_nho_nhat is None or so_ly < so_ly_nho_nhat:
            so_ly_nho_nhat = so_ly

        if so_luong_ton <= muc_canh_bao:
            co_nguyen_lieu_sap_het = True

        if so_ly <= 0:
            nguyen_lieu_thieu.append({
                "ma_nl": ct["ma_nl"],
                "ten_nl": ct["ten_nl"],
                "don_vi": ct["don_vi"],
                "so_luong_ton": so_luong_ton,
                "dinh_luong_can": dinh_luong,
            })

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
        "so_ly_co_the_ban": so_ly_co_the_ban,
        "trang_thai_kho": trang_thai,
        "ten_trang_thai_kho": ten,
        "co_the_ban": so_ly_co_the_ban > 0,
        "nguyen_lieu_thieu": nguyen_lieu_thieu,
        "canh_bao_kho": "" if so_ly_co_the_ban > 0 else "Không đủ nguyên liệu để bán sản phẩm này.",
    }


def ap_dung_trang_thai_kho_chinh_tay(sp: dict, tinh_tu_dong: dict) -> dict:
    """Ghép trạng thái tự động với trạng thái quản lý chỉnh tay.
    Backend vẫn kiểm tra nguyên liệu thật khi thanh toán để tránh âm kho.
    """
    sp.update(tinh_tu_dong)
    sp["trang_thai_kho_tu_dong"] = tinh_tu_dong["trang_thai_kho"]
    sp["ten_trang_thai_kho_tu_dong"] = tinh_tu_dong["ten_trang_thai_kho"]
    sp["so_ly_co_the_ban_tu_dong"] = tinh_tu_dong["so_ly_co_the_ban"]
    sp["co_the_ban_tu_dong"] = tinh_tu_dong["co_the_ban"]

    cach_chinh = sp.get("trang_thai_kho_chinh_tay") or "tu_dong"
    sp["trang_thai_kho_duoc_chinh_tay"] = cach_chinh != "tu_dong"

    if cach_chinh != "tu_dong":
        sp["trang_thai_kho"] = cach_chinh
        sp["ten_trang_thai_kho"] = TEN_TRANG_THAI_KHO.get(cach_chinh, cach_chinh)
        if cach_chinh == "het_hang":
            sp["co_the_ban"] = False
            sp["canh_bao_kho"] = sp.get("ghi_chu_kho") or "Quản lý đã đặt sản phẩm này là hết hàng."
        elif not tinh_tu_dong["co_the_ban"]:
            sp["co_the_ban"] = False
            sp["canh_bao_kho"] = "Quản lý đặt trạng thái thủ công nhưng kho thực tế chưa đủ nguyên liệu."
        else:
            sp["co_the_ban"] = True
            sp["canh_bao_kho"] = sp.get("ghi_chu_kho") or "Trạng thái kho đang được quản lý chỉnh thủ công."

    if sp["trang_thai"] != "dang_ban":
        sp["co_the_ban"] = False
        sp["canh_bao_kho"] = "Sản phẩm đang ngừng bán."
    return sp

def kem_cong_thuc(ds):
    conn = ket_noi()
    try:
        for sp in ds:
            sp["cong_thuc"] = [dict(row) for row in conn.execute(
                """
                SELECT ct.ma_nl, nl.ten_nl, nl.don_vi, nl.so_luong_ton, nl.muc_canh_bao, ct.dinh_luong
                FROM congthuc ct JOIN nguyenlieu nl ON nl.ma_nl = ct.ma_nl
                WHERE ct.ma_sp=? ORDER BY nl.ten_nl
                """,
                (sp["ma_sp"],),
            ).fetchall()]
            tinh_tu_dong = tinh_trang_thai_kho(conn, sp["ma_sp"])
            ap_dung_trang_thai_kho_chinh_tay(sp, tinh_tu_dong)
        return ds
    finally:
        conn.close()

@router.get("")
def danh_sach(_: dict = Depends(nguoi_dung_hien_tai)):
    ds = lay_tat_ca("SELECT * FROM sanpham ORDER BY ma_sp")
    return kem_cong_thuc(ds)

@router.post("")
def them(data: SanPhamVao, _: dict = Depends(chi_quan_ly)):
    kiem_tra_trang_thai(data)
    conn = ket_noi()
    try:
        ma_sp = tao_ma_moi(conn, "sanpham", "ma_sp", "SP")
        conn.execute(
            "INSERT INTO sanpham(ma_sp, ten_sp, loai, gia_ban, trang_thai, trang_thai_kho_chinh_tay, ghi_chu_kho, mo_ta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (ma_sp, data.ten_sp, data.loai, data.gia_ban, data.trang_thai, data.trang_thai_kho_chinh_tay, data.ghi_chu_kho.strip(), data.mo_ta),
        )
        gan_cong_thuc(conn, ma_sp, data.cong_thuc)
        conn.commit()
        return {"message": "Đã thêm sản phẩm", "ma_sp": ma_sp}
    finally:
        conn.close()

@router.put("/{ma_sp}")
def sua(ma_sp: str, data: SanPhamVao, _: dict = Depends(chi_quan_ly)):
    kiem_tra_trang_thai(data)
    conn = ket_noi()
    try:
        ton_tai = conn.execute("SELECT ma_sp FROM sanpham WHERE ma_sp=?", (ma_sp,)).fetchone()
        if not ton_tai:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        conn.execute(
            "UPDATE sanpham SET ten_sp=?, loai=?, gia_ban=?, trang_thai=?, trang_thai_kho_chinh_tay=?, ghi_chu_kho=?, mo_ta=? WHERE ma_sp=?",
            (data.ten_sp, data.loai, data.gia_ban, data.trang_thai, data.trang_thai_kho_chinh_tay, data.ghi_chu_kho.strip(), data.mo_ta, ma_sp),
        )
        gan_cong_thuc(conn, ma_sp, data.cong_thuc)
        conn.commit()
        return {"message": "Đã sửa sản phẩm"}
    finally:
        conn.close()

@router.patch("/{ma_sp}/trangthaikho")
def doi_trang_thai_kho(ma_sp: str, data: TrangThaiKhoVao, _: dict = Depends(chi_quan_ly)):
    if data.trang_thai_kho_chinh_tay not in CAC_TRANG_THAI_KHO_CHINH_TAY:
        raise HTTPException(status_code=400, detail="Trạng thái kho chỉnh tay không hợp lệ")
    conn = ket_noi()
    try:
        ton_tai = conn.execute("SELECT ma_sp FROM sanpham WHERE ma_sp=?", (ma_sp,)).fetchone()
        if not ton_tai:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        conn.execute(
            "UPDATE sanpham SET trang_thai_kho_chinh_tay=?, ghi_chu_kho=? WHERE ma_sp=?",
            (data.trang_thai_kho_chinh_tay, data.ghi_chu_kho.strip(), ma_sp),
        )
        conn.commit()
        ten = "Tự động theo kho" if data.trang_thai_kho_chinh_tay == "tu_dong" else TEN_TRANG_THAI_KHO[data.trang_thai_kho_chinh_tay]
        return {"message": f"Đã đổi trạng thái kho sản phẩm sang: {ten}"}
    finally:
        conn.close()

@router.delete("/{ma_sp}")
def xoa(ma_sp: str, _: dict = Depends(chi_quan_ly)):
    da_ban = lay_mot("SELECT id FROM chitietdonhang WHERE ma_sp=? LIMIT 1", (ma_sp,))
    if da_ban:
        raise HTTPException(status_code=400, detail="Sản phẩm đã có trong đơn hàng, không nên xóa. Hãy đổi trạng thái ngừng bán.")
    conn = ket_noi()
    try:
        conn.execute("DELETE FROM sanpham WHERE ma_sp=?", (ma_sp,))
        conn.commit()
        return {"message": "Đã xóa sản phẩm"}
    finally:
        conn.close()
