import os
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

from .db import get_connection

try:
    from zoneinfo import ZoneInfo
except Exception:
    ZoneInfo = None

THU_MUC_BACKEND = Path(__file__).resolve().parent
DUONG_DAN_SCHEMA = THU_MUC_BACKEND / "database.sql"

def _chuyen_tham_so(sql: str) -> str:
    if "?" in sql:
        return sql.replace("?", "%s")
    return sql


class MySQLCursorProxy:
    def __init__(self, cursor):
        self._cursor = cursor

    def execute(self, sql: str, tham_so: Iterable[Any] = ()):
        cau_lenh = _chuyen_tham_so(sql)
        gia_tri = tuple(tham_so)
        self._cursor.execute(cau_lenh, gia_tri)
        return self

    def executemany(self, sql: str, danh_sach_tham_so: Iterable[Iterable[Any]]):
        cau_lenh = _chuyen_tham_so(sql)
        danh_sach = list(danh_sach_tham_so)
        self._cursor.executemany(cau_lenh, danh_sach)
        return self

    def executescript(self, chuoi_sql: str):
        for cau_lenh in chuoi_sql.split(";"):
            cau_lenh = cau_lenh.strip()
            if cau_lenh:
                self._cursor.execute(cau_lenh)
        return self

    def fetchone(self):
        return self._cursor.fetchone()

    def fetchall(self):
        return self._cursor.fetchall()

    def close(self):
        self._cursor.close()

    @property
    def lastrowid(self):
        return self._cursor.lastrowid

    def __iter__(self):
        return iter(self._cursor)

    def __getattr__(self, name: str):
        return getattr(self._cursor, name)


class MySQLConnectionProxy:
    def __init__(self, connection):
        self._connection = connection

    def cursor(self):
        # Kết nối đã được cấu hình sẵn để trả về DictCursor
        return MySQLCursorProxy(self._connection.cursor())

    def execute(self, sql: str, tham_so: Iterable[Any] = ()):
        cursor = self.cursor()
        cursor.execute(sql, tham_so)
        return cursor

    def executemany(self, sql: str, danh_sach_tham_so: Iterable[Iterable[Any]]):
        cursor = self.cursor()
        cursor.executemany(sql, danh_sach_tham_so)
        return cursor

    def commit(self):
        self._connection.commit()

    def rollback(self):
        self._connection.rollback()

    def close(self):
        self._connection.close()

    def __getattr__(self, name: str):
        return getattr(self._connection, name)


def thoi_gian_hien_tai() -> str:
    if ZoneInfo:
        moc_thoi_gian = datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))
    else:
        moc_thoi_gian = datetime.now()
    return moc_thoi_gian.strftime("%Y-%m-%d %H:%M:%S")


def ngay_hien_tai() -> str:
    return thoi_gian_hien_tai()[:10]


def thang_hien_tai() -> str:
    return thoi_gian_hien_tai()[:7]


def ket_noi():
    """Mở kết nối cơ sở dữ liệu bằng `backend.db.get_connection()`.

    Hàm này trả về `MySQLConnectionProxy` để bọc kết nối thô và cung cấp
    các phương thức tiện ích được dùng xuyên suốt dự án.
    """
    ket_noi_mysql = get_connection()
    return MySQLConnectionProxy(ket_noi_mysql)


def lay_tat_ca(sql: str, tham_so: Iterable[Any] = ()):
    conn = ket_noi()
    try:
        cursor = conn.execute(sql, tuple(tham_so))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def lay_mot(sql: str, tham_so: Iterable[Any] = ()):
    conn = ket_noi()
    try:
        cursor = conn.execute(sql, tuple(tham_so))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def thuc_thi(sql: str, tham_so: Iterable[Any] = ()):
    conn = ket_noi()
    try:
        cursor = conn.execute(sql, tuple(tham_so))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def tao_ma_moi(conn: Any, ten_bang: str, cot_ma: str, tien_to: str) -> str:
    row = conn.execute(
        f"SELECT {cot_ma} AS ma FROM {ten_bang} WHERE {cot_ma} LIKE ? ORDER BY {cot_ma} DESC LIMIT 1",
        (f"{tien_to}%",),
    ).fetchone()
    if not row:
        return f"{tien_to}001"

    so = int(str(row["ma"]).replace(tien_to, "") or 0) + 1
    return f"{tien_to}{so:03d}"


def tinh_cap_bac_khach(diem: int = 0, tong_chi_tieu: int = 0) -> str:
    """Tự xếp hạng khách hàng dựa trên điểm và tổng chi tiêu."""
    diem = int(diem or 0)
    tong_chi_tieu = int(tong_chi_tieu or 0)
    if diem >= 800 or tong_chi_tieu >= 8_000_000:
        return "vip"
    if diem >= 300 or tong_chi_tieu >= 3_000_000:
        return "vang"
    if diem >= 100 or tong_chi_tieu >= 1_000_000:
        return "bac"
    return "thuong"


def phan_tram_giam_theo_cap(cap_bac: str) -> int:
    return {"thuong": 0, "bac": 3, "vang": 5, "vip": 10}.get(cap_bac or "thuong", 0)


def cap_nhat_cap_bac_khach(conn: Any, ma_kh: str):
    row = conn.execute(
        "SELECT DiemTichLuy AS diem, TongChiTieu FROM KhachHang WHERE MaKH=?",
        (ma_kh,),
    ).fetchone()
    if not row:
        return

    cap_bac = tinh_cap_bac_khach(row["diem"], row["TongChiTieu"])
    conn.execute("UPDATE KhachHang SET CapBac=? WHERE MaKH=?", (cap_bac, ma_kh))


def cap_nhat_trang_thai_nguyen_lieu(conn: Any, ma_nl: str):
    row = conn.execute(
        "SELECT SoLuongTon, MucCanhBao FROM NguyenLieu WHERE MaNL=?",
        (ma_nl,),
    ).fetchone()
    if not row:
        return

    so_luong = float(row["SoLuongTon"])
    muc_canh_bao = float(row["MucCanhBao"])
    if so_luong <= 0:
        trang_thai = "het_hang"
    elif so_luong <= muc_canh_bao:
        trang_thai = "sap_het"
    else:
        trang_thai = "con_hang"
    conn.execute("UPDATE NguyenLieu SET TrangThai=? WHERE MaNL=?", (trang_thai, ma_nl))


def _cot_da_ton_tai(conn: Any, ten_bang: str, ten_cot: str) -> bool:
    row = conn.execute(
        """
        SELECT COUNT(*) AS so_luong
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
            AND table_name = %s
            AND column_name = %s
        """,
        (ten_bang, ten_cot),
    ).fetchone()
    return bool(row and int(row["so_luong"]) > 0)


def _them_cot_neu_thieu(conn: Any, ten_bang: str, ten_cot: str, khai_bao: str):
    if _cot_da_ton_tai(conn, ten_bang, ten_cot):
        return

    conn.execute(f"ALTER TABLE {ten_bang} ADD COLUMN {ten_cot} {khai_bao}")


def _bo_sung_cot_moi(conn: Any):
    # Cho phép nâng cấp từ bản cũ mà không cần xóa cơ sở dữ liệu.
    _them_cot_neu_thieu(conn, "KhachHang", "Email", "VARCHAR(100) DEFAULT ''")
    _them_cot_neu_thieu(conn, "KhachHang", "DiaChi", "VARCHAR(255) DEFAULT ''")
    _them_cot_neu_thieu(conn, "KhachHang", "NgaySinh", "DATE DEFAULT NULL")
    _them_cot_neu_thieu(conn, "KhachHang", "GioiTinh", "VARCHAR(10) DEFAULT ''")
    _them_cot_neu_thieu(conn, "KhachHang", "CapBac", "VARCHAR(20) NOT NULL DEFAULT 'thuong'")
    _them_cot_neu_thieu(conn, "KhachHang", "TongChiTieu", "INT NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "KhachHang", "SoLanMua", "INT NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "KhachHang", "NgayTao", "DATETIME DEFAULT NULL")
    _them_cot_neu_thieu(conn, "KhachHang", "LanMuaCuoi", "DATETIME DEFAULT NULL")
    _them_cot_neu_thieu(conn, "KhachHang", "TrangThai", "VARCHAR(20) NOT NULL DEFAULT 'dang_hoat_dong'")

    # Quản lý có thể chỉnh thủ công trạng thái kho hiển thị của sản phẩm:
    # tu_dong = hệ thống tự tính theo công thức + tồn kho; con_hang/sap_het/het_hang = quản lý ép trạng thái.
    _them_cot_neu_thieu(conn, "SanPham", "HinhAnh", "VARCHAR(255) DEFAULT ''")
    _them_cot_neu_thieu(conn, "SanPham", "TrangThaiKhoChinhTay", "VARCHAR(20) NOT NULL DEFAULT 'tu_dong'")
    _them_cot_neu_thieu(conn, "SanPham", "GhiChuKho", "TEXT")

    _them_cot_neu_thieu(conn, "HoaDon", "TongTruocGiam", "INT NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "HoaDon", "GiamGiaCapBac", "INT NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "HoaDon", "DiemSuDung", "INT NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "HoaDon", "GiamGiaDiem", "INT NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "HoaDon", "CapBacKhach", "VARCHAR(20) DEFAULT 'thuong'")
    _them_cot_neu_thieu(conn, "HoaDon", "PhuongThucThanhToan", "VARCHAR(20) DEFAULT 'tien_mat'")
    _them_cot_neu_thieu(conn, "HoaDon", "TienKhachDua", "INT NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "HoaDon", "TienThua", "INT NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "HoaDon", "GhiChu", "TEXT")

    conn.execute("UPDATE HoaDon SET TongTruocGiam=TongTien WHERE TongTruocGiam=0")
    conn.execute("UPDATE KhachHang SET NgayTao=? WHERE NgayTao=''", (thoi_gian_hien_tai(),))


def _dong_bo_thong_ke_khach(conn: Any):
    khach_hang = conn.execute("SELECT MaKH, DiemTichLuy AS diem FROM KhachHang").fetchall()
    for kh in khach_hang:
        tk = conn.execute(
            """
            SELECT COALESCE(SUM(TongTien),0) AS tong_chi_tieu,
                COUNT(*) AS so_lan_mua,
                COALESCE(MAX(ThoiDiemLap),'') AS lan_mua_cuoi
            FROM HoaDon
            WHERE MaKH=? AND TrangThai='da_thanh_toan'
            """,
            (kh["MaKH"],),
        ).fetchone()
        cap_bac = tinh_cap_bac_khach(kh["diem"], tk["tong_chi_tieu"])
        conn.execute(
            "UPDATE KhachHang SET TongChiTieu=?, SoLanMua=?, LanMuaCuoi=?, CapBac=? WHERE MaKH=?",
            (tk["tong_chi_tieu"], tk["so_lan_mua"], tk["lan_mua_cuoi"], cap_bac, kh["MaKH"]),
        )


def khoi_tao_csdl():
    conn = ket_noi()
    cur = conn.cursor()
    schema_sql = DUONG_DAN_SCHEMA.read_text(encoding="utf-8")
    cur.executescript(schema_sql)
    _bo_sung_cot_moi(conn)
    _dong_bo_thong_ke_khach(conn)
    conn.commit()
    conn.close()


if __name__ == "__main__":
    khoi_tao_csdl()
