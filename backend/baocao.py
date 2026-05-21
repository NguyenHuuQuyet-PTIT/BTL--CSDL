from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from cosodulieu import lay_mot, lay_tat_ca, ngay_hien_tai, thang_hien_tai
from xacthuc import chi_quan_ly

router = APIRouter(prefix="/api/baocao", tags=["baocao"])

@router.get("/tongquan")
def tong_quan(_: dict = Depends(chi_quan_ly)):
    hom_nay = ngay_hien_tai()
    thang_nay = thang_hien_tai()

    doanh_thu_hom_nay = lay_mot("SELECT COALESCE(SUM(tong_tien),0) AS gt FROM donhang WHERE substr(thoi_diem,1,10)=? AND trang_thai='da_thanh_toan'", (hom_nay,))["gt"]
    so_don_hom_nay = lay_mot("SELECT COUNT(*) AS gt FROM donhang WHERE substr(thoi_diem,1,10)=? AND trang_thai='da_thanh_toan'", (hom_nay,))["gt"]
    doanh_thu_thang = lay_mot("SELECT COALESCE(SUM(tong_tien),0) AS gt FROM donhang WHERE substr(thoi_diem,1,7)=? AND trang_thai='da_thanh_toan'", (thang_nay,))["gt"]
    giam_gia_thang = lay_mot("SELECT COALESCE(SUM(giam_gia_cap_bac + giam_gia_diem),0) AS gt FROM donhang WHERE substr(thoi_diem,1,7)=? AND trang_thai='da_thanh_toan'", (thang_nay,))["gt"]
    tong_don = lay_mot("SELECT COUNT(*) AS gt FROM donhang WHERE trang_thai='da_thanh_toan'")["gt"]
    tong_khach = lay_mot("SELECT COUNT(*) AS gt FROM khachhang")["gt"]
    tong_khach_vip = lay_mot("SELECT COUNT(*) AS gt FROM khachhang WHERE cap_bac='vip' AND trang_thai='dang_hoat_dong'")["gt"]
    tong_sp = lay_mot("SELECT COUNT(*) AS gt FROM sanpham WHERE trang_thai='dang_ban'")["gt"]
    chi_phi_nhap_thang = lay_mot("SELECT COALESCE(SUM(tong_tien),0) AS gt FROM phieunhap WHERE substr(ngay_nhap,1,7)=?", (thang_nay,))["gt"]

    top_san_pham = lay_tat_ca(
        """
        SELECT ct.ma_sp, ct.ten_sp, SUM(ct.so_luong) AS so_luong, SUM(ct.so_luong*ct.don_gia) AS doanh_thu
        FROM chitietdonhang ct
        JOIN donhang dh ON dh.ma_hd = ct.ma_hd
        WHERE dh.trang_thai='da_thanh_toan'
        GROUP BY ct.ma_sp, ct.ten_sp ORDER BY so_luong DESC LIMIT 5
        """
    )
    top_khach_hang = lay_tat_ca(
        """
        SELECT ma_kh, ten_kh, sdt, cap_bac, diem, tong_chi_tieu, so_lan_mua
        FROM khachhang
        WHERE trang_thai='dang_hoat_dong'
        ORDER BY tong_chi_tieu DESC, diem DESC
        LIMIT 5
        """
    )
    thong_ke_cap_bac = lay_tat_ca(
        """
        SELECT cap_bac, COUNT(*) AS so_luong, COALESCE(SUM(tong_chi_tieu),0) AS tong_chi_tieu
        FROM khachhang GROUP BY cap_bac ORDER BY so_luong DESC
        """
    )
    sap_het = lay_tat_ca("SELECT * FROM nguyenlieu WHERE trang_thai IN ('sap_het','het_hang') ORDER BY so_luong_ton ASC")

    ngay_cuoi = datetime.strptime(hom_nay, "%Y-%m-%d")
    cac_ngay = [(ngay_cuoi - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)]
    du_lieu_ngay = lay_tat_ca(
        """
        SELECT substr(thoi_diem,1,10) AS ngay, SUM(tong_tien) AS doanh_thu, COUNT(*) AS so_don
        FROM donhang
        WHERE substr(thoi_diem,1,10) >= ? AND trang_thai='da_thanh_toan'
        GROUP BY substr(thoi_diem,1,10)
        ORDER BY ngay
        """,
        (cac_ngay[0],),
    )
    theo_ngay = {dong["ngay"]: dong for dong in du_lieu_ngay}
    doanh_thu_7_ngay = [
        {"ngay": ngay, "doanh_thu": theo_ngay.get(ngay, {}).get("doanh_thu", 0), "so_don": theo_ngay.get(ngay, {}).get("so_don", 0)}
        for ngay in cac_ngay
    ]

    thong_ke_thanh_toan = lay_tat_ca(
        """
        SELECT phuong_thuc_thanh_toan, COUNT(*) AS so_don, COALESCE(SUM(tong_tien),0) AS doanh_thu
        FROM donhang
        WHERE substr(thoi_diem,1,7)=? AND trang_thai='da_thanh_toan'
        GROUP BY phuong_thuc_thanh_toan
        ORDER BY doanh_thu DESC
        """,
        (thang_nay,),
    )
    don_da_huy = lay_mot("SELECT COUNT(*) AS gt FROM donhang WHERE trang_thai='da_huy' AND substr(thoi_diem,1,7)=?", (thang_nay,))["gt"]

    return {
        "ngay_hien_tai": hom_nay,
        "thang_hien_tai": thang_nay,
        "doanh_thu_hom_nay": doanh_thu_hom_nay,
        "so_don_hom_nay": so_don_hom_nay,
        "doanh_thu_thang": doanh_thu_thang,
        "giam_gia_thang": giam_gia_thang,
        "tong_don": tong_don,
        "tong_khach": tong_khach,
        "tong_khach_vip": tong_khach_vip,
        "tong_sp": tong_sp,
        "chi_phi_nhap_thang": chi_phi_nhap_thang,
        "loi_nhuan_tam_tinh": doanh_thu_thang - chi_phi_nhap_thang,
        "top_san_pham": top_san_pham,
        "top_khach_hang": top_khach_hang,
        "thong_ke_cap_bac": thong_ke_cap_bac,
        "nguyen_lieu_sap_het": sap_het,
        "doanh_thu_7_ngay": doanh_thu_7_ngay,
        "thong_ke_thanh_toan": thong_ke_thanh_toan,
        "don_da_huy_thang": don_da_huy,
    }
