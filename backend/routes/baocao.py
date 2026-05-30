from datetime import datetime, timedelta
from fastapi import APIRouter, Depends

from ..SQL.cosodulieu import lay_mot, lay_tat_ca, ngay_hien_tai, thang_hien_tai
from .xacthuc import chi_quan_ly

router = APIRouter(prefix="/api/baocao", tags=["baocao"])


@router.get("/tongquan")
def tong_quan(_: dict = Depends(chi_quan_ly)):
    try:
        hom_nay = ngay_hien_tai()
        thang_nay = thang_hien_tai()

        doanh_thu_hom_nay = lay_mot(
            "SELECT COALESCE(SUM(TongTien),0) AS gt FROM HoaDon WHERE substr(ThoiDiemLap,1,10)=? AND TrangThai='da_thanh_toan'",
            (hom_nay,),
        )["gt"]
        so_don_hom_nay = lay_mot(
            "SELECT COUNT(*) AS gt FROM HoaDon WHERE substr(ThoiDiemLap,1,10)=? AND TrangThai='da_thanh_toan'",
            (hom_nay,),
        )["gt"]
        doanh_thu_thang = lay_mot(
            "SELECT COALESCE(SUM(TongTien),0) AS gt FROM HoaDon WHERE substr(ThoiDiemLap,1,7)=? AND TrangThai='da_thanh_toan'",
            (thang_nay,),
        )["gt"]
        giam_gia_thang = lay_mot(
            "SELECT COALESCE(SUM(GiamGiaCapBac + GiamGiaDiem),0) AS gt FROM HoaDon WHERE substr(ThoiDiemLap,1,7)=? AND TrangThai='da_thanh_toan'",
            (thang_nay,),
        )["gt"]
        tong_don = lay_mot("SELECT COUNT(*) AS gt FROM HoaDon WHERE TrangThai='da_thanh_toan'")["gt"]
        tong_khach = lay_mot("SELECT COUNT(*) AS gt FROM KhachHang")["gt"]
        tong_khach_vip = lay_mot(
            "SELECT COUNT(*) AS gt FROM KhachHang WHERE CapBac='vip' AND TrangThai='dang_hoat_dong'",
        )["gt"]
        tong_sp = lay_mot("SELECT COUNT(*) AS gt FROM SanPham WHERE TrangThai='dang_ban'")["gt"]
        chi_phi_nhap_thang = lay_mot(
            "SELECT COALESCE(SUM(TongTienNhap),0) AS gt FROM PhieuNhap WHERE substr(NgayNhap,1,7)=?",
            (thang_nay,),
        )["gt"]

        top_san_pham = lay_tat_ca(
            """
                SELECT ct.MaSP, ct.TenSP, SUM(ct.SoLuong) AS SoLuong, SUM(ct.SoLuong*ct.DonGia) AS DoanhThu
                FROM ChiTietHoaDon ct
                JOIN HoaDon dh ON dh.MaHD = ct.MaHD
                WHERE dh.TrangThai='da_thanh_toan'
                GROUP BY ct.MaSP, ct.TenSP ORDER BY SoLuong DESC LIMIT 5
            """
        )
        top_khach_hang = lay_tat_ca(
            """
            SELECT MaKH AS MaKH, TenKH AS TenKH, SoDienThoai AS SoDienThoai, CapBac AS CapBac, DiemTichLuy AS DiemTichLuy, TongChiTieu AS TongChiTieu, SoLanMua AS SoLanMua
            FROM KhachHang
            WHERE TrangThai='dang_hoat_dong'
            ORDER BY TongChiTieu DESC, DiemTichLuy DESC
            LIMIT 5
            """
        )
        thong_ke_cap_bac = lay_tat_ca(
                """
                SELECT CapBac AS CapBac, COUNT(*) AS SoLuong, COALESCE(SUM(TongChiTieu),0) AS TongChiTieu
                FROM KhachHang GROUP BY CapBac ORDER BY SoLuong DESC
                """
        )
        sap_het = lay_tat_ca("SELECT * FROM NguyenLieu WHERE TrangThai IN ('sap_het','het_hang') ORDER BY SoLuongTon ASC")

        ngay_cuoi = datetime.strptime(hom_nay, "%Y-%m-%d")
        cac_ngay = [(ngay_cuoi - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)]
        du_lieu_ngay = lay_tat_ca(
            """
            SELECT substr(ThoiDiemLap,1,10) AS Ngay, SUM(TongTien) AS DoanhThu, COUNT(*) AS SoDon
            FROM HoaDon
            WHERE substr(ThoiDiemLap,1,10) >= ? AND TrangThai='da_thanh_toan'
            GROUP BY substr(ThoiDiemLap,1,10)
            ORDER BY ngay
            """,
            (cac_ngay[0],),
        )
        theo_ngay = {dong["Ngay"]: dong for dong in du_lieu_ngay}
        doanh_thu_7_ngay = [
            {"Ngay": ngay, "DoanhThu": theo_ngay.get(ngay, {}).get("DoanhThu", 0), "SoDon": theo_ngay.get(ngay, {}).get("SoDon", 0)}
            for ngay in cac_ngay
        ]

        thong_ke_thanh_toan = lay_tat_ca(
            """
                SELECT PhuongThucThanhToan AS PhuongThucThanhToan, COUNT(*) AS SoDon, COALESCE(SUM(TongTien),0) AS DoanhThu
                FROM HoaDon
                WHERE substr(ThoiDiemLap,1,7)=? AND TrangThai='da_thanh_toan'
                GROUP BY PhuongThucThanhToan
                ORDER BY DoanhThu DESC
            """,
            (thang_nay,),
        )
        don_da_huy = lay_mot(
            "SELECT COUNT(*) AS gt FROM HoaDon WHERE TrangThai='da_huy' AND substr(ThoiDiemLap,1,7)=?",
            (thang_nay,),
        )["gt"]

        return {
            "NgayHienTai": hom_nay,
            "ThangHienTai": thang_nay,
            "DoanhThuHomNay": doanh_thu_hom_nay,
            "SoDonHomNay": so_don_hom_nay,
            "DoanhThuThang": doanh_thu_thang,
            "GiamGiaThang": giam_gia_thang,
            "TongDon": tong_don,
            "TongKhach": tong_khach,
            "TongKhachVIP": tong_khach_vip,
            "TongSP": tong_sp,
            "ChiPhiNhapThang": chi_phi_nhap_thang,
            "LoiNhuanTamTinh": doanh_thu_thang - chi_phi_nhap_thang,
            "TopSanPham": top_san_pham,
            "TopKhachHang": top_khach_hang,
            "ThongKeCapBac": thong_ke_cap_bac,
            "NguyenLieuSapHet": sap_het,
            "DoanhThu7Ngay": doanh_thu_7_ngay,
            "ThongKeThanhToan": thong_ke_thanh_toan,
            "DonDaHuyThang": don_da_huy,
        }
    except Exception as e:
        import traceback

        tb = traceback.format_exc()
        from fastapi import HTTPException

        raise HTTPException(status_code=500, detail=str(e) + "\n" + tb)
