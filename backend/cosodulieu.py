import hashlib
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

try:
    from zoneinfo import ZoneInfo
except Exception:
    ZoneInfo = None

THU_MUC_BACKEND = Path(__file__).resolve().parent
DUONG_DAN_DB = THU_MUC_BACKEND / "cuahangdouong.db"


def thoi_gian_hien_tai() -> str:
    """Thời gian thực theo múi giờ Việt Nam, dùng chung cho đơn hàng, nhập hàng và báo cáo."""
    if ZoneInfo:
        return datetime.now(ZoneInfo("Asia/Ho_Chi_Minh")).strftime("%Y-%m-%d %H:%M:%S")
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def ngay_hien_tai() -> str:
    return thoi_gian_hien_tai()[:10]


def thang_hien_tai() -> str:
    return thoi_gian_hien_tai()[:7]


def bam_mat_khau(mat_khau: str) -> str:
    # Phù hợp bài tập sinh viên. Khi triển khai thật nên đổi sang bcrypt/passlib.
    return hashlib.sha256(mat_khau.encode("utf-8")).hexdigest()


def ket_noi():
    conn = sqlite3.connect(DUONG_DAN_DB)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def lay_tat_ca(sql: str, tham_so: Iterable[Any] = ()): 
    conn = ket_noi()
    try:
        rows = conn.execute(sql, tuple(tham_so)).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def lay_mot(sql: str, tham_so: Iterable[Any] = ()): 
    conn = ket_noi()
    try:
        row = conn.execute(sql, tuple(tham_so)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def thuc_thi(sql: str, tham_so: Iterable[Any] = ()): 
    conn = ket_noi()
    try:
        cur = conn.execute(sql, tuple(tham_so))
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def tao_ma_moi(conn: sqlite3.Connection, ten_bang: str, cot_ma: str, tien_to: str) -> str:
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


def cap_nhat_cap_bac_khach(conn: sqlite3.Connection, ma_kh: str):
    row = conn.execute("SELECT diem, tong_chi_tieu FROM khachhang WHERE ma_kh=?", (ma_kh,)).fetchone()
    if not row:
        return
    cap_bac = tinh_cap_bac_khach(row["diem"], row["tong_chi_tieu"])
    conn.execute("UPDATE khachhang SET cap_bac=? WHERE ma_kh=?", (cap_bac, ma_kh))


def cap_nhat_trang_thai_nguyen_lieu(conn: sqlite3.Connection, ma_nl: str):
    row = conn.execute("SELECT so_luong_ton, muc_canh_bao FROM nguyenlieu WHERE ma_nl=?", (ma_nl,)).fetchone()
    if not row:
        return
    so_luong = float(row["so_luong_ton"])
    muc_canh_bao = float(row["muc_canh_bao"])
    if so_luong <= 0:
        trang_thai = "het_hang"
    elif so_luong <= muc_canh_bao:
        trang_thai = "sap_het"
    else:
        trang_thai = "con_hang"
    conn.execute("UPDATE nguyenlieu SET trang_thai=? WHERE ma_nl=?", (trang_thai, ma_nl))


def _cot_da_ton_tai(conn: sqlite3.Connection, ten_bang: str, ten_cot: str) -> bool:
    return any(row["name"] == ten_cot for row in conn.execute(f"PRAGMA table_info({ten_bang})"))


def _them_cot_neu_thieu(conn: sqlite3.Connection, ten_bang: str, ten_cot: str, khai_bao: str):
    if not _cot_da_ton_tai(conn, ten_bang, ten_cot):
        conn.execute(f"ALTER TABLE {ten_bang} ADD COLUMN {ten_cot} {khai_bao}")


def _bo_sung_cot_moi(conn: sqlite3.Connection):
    # Cho phép nâng cấp từ bản cũ mà không cần xóa database.
    _them_cot_neu_thieu(conn, "khachhang", "email", "TEXT DEFAULT ''")
    _them_cot_neu_thieu(conn, "khachhang", "dia_chi", "TEXT DEFAULT ''")
    _them_cot_neu_thieu(conn, "khachhang", "ngay_sinh", "TEXT DEFAULT ''")
    _them_cot_neu_thieu(conn, "khachhang", "gioi_tinh", "TEXT DEFAULT ''")
    _them_cot_neu_thieu(conn, "khachhang", "cap_bac", "TEXT NOT NULL DEFAULT 'thuong'")
    _them_cot_neu_thieu(conn, "khachhang", "tong_chi_tieu", "INTEGER NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "khachhang", "so_lan_mua", "INTEGER NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "khachhang", "ngay_tao", "TEXT DEFAULT ''")
    _them_cot_neu_thieu(conn, "khachhang", "lan_mua_cuoi", "TEXT DEFAULT ''")
    _them_cot_neu_thieu(conn, "khachhang", "trang_thai", "TEXT NOT NULL DEFAULT 'dang_hoat_dong'")

    # Quản lý có thể chỉnh thủ công trạng thái kho hiển thị của sản phẩm:
    # tu_dong = hệ thống tự tính theo công thức + tồn kho; con_hang/sap_het/het_hang = quản lý ép trạng thái.
    _them_cot_neu_thieu(conn, "sanpham", "trang_thai_kho_chinh_tay", "TEXT NOT NULL DEFAULT 'tu_dong'")
    _them_cot_neu_thieu(conn, "sanpham", "ghi_chu_kho", "TEXT DEFAULT ''")

    _them_cot_neu_thieu(conn, "donhang", "tong_truoc_giam", "INTEGER NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "donhang", "giam_gia_cap_bac", "INTEGER NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "donhang", "diem_su_dung", "INTEGER NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "donhang", "giam_gia_diem", "INTEGER NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "donhang", "cap_bac_khach", "TEXT DEFAULT 'thuong'")
    _them_cot_neu_thieu(conn, "donhang", "phuong_thuc_thanh_toan", "TEXT DEFAULT 'tien_mat'")
    _them_cot_neu_thieu(conn, "donhang", "tien_khach_dua", "INTEGER NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "donhang", "tien_thua", "INTEGER NOT NULL DEFAULT 0")
    _them_cot_neu_thieu(conn, "donhang", "ghi_chu", "TEXT DEFAULT ''")

    conn.execute("UPDATE donhang SET tong_truoc_giam=tong_tien WHERE tong_truoc_giam=0")
    conn.execute("UPDATE khachhang SET ngay_tao=? WHERE ngay_tao=''", (thoi_gian_hien_tai(),))


def _dong_bo_thong_ke_khach(conn: sqlite3.Connection):
    khach_hang = conn.execute("SELECT ma_kh, diem FROM khachhang").fetchall()
    for kh in khach_hang:
        tk = conn.execute(
            """
            SELECT COALESCE(SUM(tong_tien),0) AS tong_chi_tieu,
                   COUNT(*) AS so_lan_mua,
                   COALESCE(MAX(thoi_diem),'') AS lan_mua_cuoi
            FROM donhang
            WHERE ma_kh=? AND trang_thai='da_thanh_toan'
            """,
            (kh["ma_kh"],),
        ).fetchone()
        cap_bac = tinh_cap_bac_khach(kh["diem"], tk["tong_chi_tieu"])
        conn.execute(
            "UPDATE khachhang SET tong_chi_tieu=?, so_lan_mua=?, lan_mua_cuoi=?, cap_bac=? WHERE ma_kh=?",
            (tk["tong_chi_tieu"], tk["so_lan_mua"], tk["lan_mua_cuoi"], cap_bac, kh["ma_kh"]),
        )


def khoi_tao_csdl():
    conn = ket_noi()
    cur = conn.cursor()
    cur.executescript(SCHEMA_SQL)
    _bo_sung_cot_moi(conn)

    # Gọi seed dữ liệu mỗi lần khởi tạo nhưng dùng INSERT OR IGNORE trong các lệnh
    # để tránh lỗi khi dữ liệu đã tồn tại. Giúp đảm bảo các bản nâng cấp bổ sung dữ liệu mới.
    them_du_lieu_mau(cur)

    _dong_bo_thong_ke_khach(conn)
    conn.commit()
    conn.close()


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS nhanvien (
    ma_nv TEXT PRIMARY KEY,
    ten_nv TEXT NOT NULL,
    vai_tro TEXT NOT NULL CHECK (vai_tro IN ('quan_ly', 'nhan_vien')),
    sdt TEXT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    trang_thai TEXT NOT NULL DEFAULT 'dang_lam'
);

CREATE TABLE IF NOT EXISTS khachhang (
    ma_kh TEXT PRIMARY KEY,
    ten_kh TEXT NOT NULL,
    sdt TEXT UNIQUE NOT NULL,
    email TEXT DEFAULT '',
    dia_chi TEXT DEFAULT '',
    ngay_sinh TEXT DEFAULT '',
    gioi_tinh TEXT DEFAULT '',
    diem INTEGER NOT NULL DEFAULT 0,
    cap_bac TEXT NOT NULL DEFAULT 'thuong',
    tong_chi_tieu INTEGER NOT NULL DEFAULT 0,
    so_lan_mua INTEGER NOT NULL DEFAULT 0,
    ngay_tao TEXT DEFAULT '',
    lan_mua_cuoi TEXT DEFAULT '',
    trang_thai TEXT NOT NULL DEFAULT 'dang_hoat_dong',
    ghi_chu TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS nhacungcap (
    ma_ncc TEXT PRIMARY KEY,
    ten_ncc TEXT NOT NULL,
    sdt TEXT,
    dia_chi TEXT,
    ghi_chu TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS nguyenlieu (
    ma_nl TEXT PRIMARY KEY,
    ten_nl TEXT NOT NULL,
    don_vi TEXT NOT NULL,
    so_luong_ton REAL NOT NULL DEFAULT 0,
    muc_canh_bao REAL NOT NULL DEFAULT 5,
    gia_nhap_tb INTEGER NOT NULL DEFAULT 0,
    trang_thai TEXT NOT NULL DEFAULT 'con_hang'
);

CREATE TABLE IF NOT EXISTS sanpham (
    ma_sp TEXT PRIMARY KEY,
    ten_sp TEXT NOT NULL,
    loai TEXT NOT NULL,
    gia_ban INTEGER NOT NULL,
    trang_thai TEXT NOT NULL DEFAULT 'dang_ban' CHECK (trang_thai IN ('dang_ban', 'ngung_ban')),
    trang_thai_kho_chinh_tay TEXT NOT NULL DEFAULT 'tu_dong' CHECK (trang_thai_kho_chinh_tay IN ('tu_dong', 'con_hang', 'sap_het', 'het_hang')),
    ghi_chu_kho TEXT DEFAULT '',
    mo_ta TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS congthuc (
    ma_sp TEXT NOT NULL,
    ma_nl TEXT NOT NULL,
    dinh_luong REAL NOT NULL,
    PRIMARY KEY (ma_sp, ma_nl),
    FOREIGN KEY(ma_sp) REFERENCES sanpham(ma_sp) ON DELETE CASCADE,
    FOREIGN KEY(ma_nl) REFERENCES nguyenlieu(ma_nl)
);

CREATE TABLE IF NOT EXISTS donhang (
    ma_hd TEXT PRIMARY KEY,
    thoi_diem TEXT NOT NULL,
    ma_kh TEXT,
    ten_kh TEXT NOT NULL,
    cap_bac_khach TEXT DEFAULT 'thuong',
    ma_nv TEXT NOT NULL,
    ten_nv TEXT NOT NULL,
    tong_truoc_giam INTEGER NOT NULL DEFAULT 0,
    giam_gia_cap_bac INTEGER NOT NULL DEFAULT 0,
    diem_su_dung INTEGER NOT NULL DEFAULT 0,
    giam_gia_diem INTEGER NOT NULL DEFAULT 0,
    tong_tien INTEGER NOT NULL,
    diem_cong INTEGER NOT NULL DEFAULT 0,
    trang_thai TEXT NOT NULL DEFAULT 'da_thanh_toan',
    phuong_thuc_thanh_toan TEXT DEFAULT 'tien_mat',
    tien_khach_dua INTEGER NOT NULL DEFAULT 0,
    tien_thua INTEGER NOT NULL DEFAULT 0,
    ghi_chu TEXT DEFAULT '',
    FOREIGN KEY(ma_kh) REFERENCES khachhang(ma_kh),
    FOREIGN KEY(ma_nv) REFERENCES nhanvien(ma_nv)
);

CREATE TABLE IF NOT EXISTS chitietdonhang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_hd TEXT NOT NULL,
    ma_sp TEXT NOT NULL,
    ten_sp TEXT NOT NULL,
    so_luong INTEGER NOT NULL,
    don_gia INTEGER NOT NULL,
    size TEXT NOT NULL DEFAULT 'M',
    ghi_chu TEXT DEFAULT '',
    FOREIGN KEY(ma_hd) REFERENCES donhang(ma_hd) ON DELETE CASCADE,
    FOREIGN KEY(ma_sp) REFERENCES sanpham(ma_sp)
);

CREATE TABLE IF NOT EXISTS phieunhap (
    ma_pn TEXT PRIMARY KEY,
    ngay_nhap TEXT NOT NULL,
    ma_ncc TEXT NOT NULL,
    ten_ncc TEXT NOT NULL,
    ma_nv TEXT NOT NULL,
    ten_nv TEXT NOT NULL,
    tong_tien INTEGER NOT NULL,
    ghi_chu TEXT DEFAULT '',
    FOREIGN KEY(ma_ncc) REFERENCES nhacungcap(ma_ncc),
    FOREIGN KEY(ma_nv) REFERENCES nhanvien(ma_nv)
);

CREATE TABLE IF NOT EXISTS chitietphieunhap (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_pn TEXT NOT NULL,
    ma_nl TEXT NOT NULL,
    ten_nl TEXT NOT NULL,
    so_luong REAL NOT NULL,
    don_gia INTEGER NOT NULL,
    FOREIGN KEY(ma_pn) REFERENCES phieunhap(ma_pn) ON DELETE CASCADE,
    FOREIGN KEY(ma_nl) REFERENCES nguyenlieu(ma_nl)
);
"""


def them_du_lieu_mau(cur: sqlite3.Cursor):
    now = thoi_gian_hien_tai()
    cur.executemany(
        "INSERT OR IGNORE INTO nhanvien(ma_nv, ten_nv, vai_tro, sdt, username, password_hash, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            ("NV001", "Nguyễn Hữu Quyết", "quan_ly", "0123456789", "admin", bam_mat_khau("admin"), "dang_lam"),
            ("NV002", "Nhân viên bán hàng", "nhan_vien", "0987654321", "staff", bam_mat_khau("staff"), "dang_lam"),
        ],
    )

    cur.executemany(
        "INSERT OR IGNORE INTO khachhang(ma_kh, ten_kh, sdt, email, dia_chi, ngay_sinh, gioi_tinh, diem, cap_bac, tong_chi_tieu, so_lan_mua, ngay_tao, lan_mua_cuoi, trang_thai, ghi_chu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            ("KH001", "Nguyễn Văn A", "0901111111", "vana@example.com", "Hà Nội", "1999-05-20", "Nam", 125, "bac", 85000, 1, now, now, "dang_hoat_dong", "Khách quen"),
            ("KH002", "Trần Thị B", "0902222222", "thib@example.com", "Hà Nội", "2000-08-12", "Nữ", 360, "vang", 3200000, 24, now, now, "dang_hoat_dong", "Thích ít đường"),
            ("KH003", "Lê Văn C", "0903333333", "", "", "", "", 890, "vip", 8450000, 72, now, now, "dang_hoat_dong", "Khách VIP, ưu tiên chăm sóc"),
        ],
    )

    cur.executemany(
        "INSERT OR IGNORE INTO nhacungcap(ma_ncc, ten_ncc, sdt, dia_chi, ghi_chu) VALUES (?, ?, ?, ?, ?)",
        [
            ("NCC001", "Công ty Cà phê Trung Nguyên", "0901234567", "TP. Hồ Chí Minh", "Cung cấp cà phê"),
            ("NCC002", "Vinamilk", "0912345678", "TP. Hồ Chí Minh", "Sữa tươi, sữa đặc"),
            ("NCC003", "Nguyên liệu F&B Việt", "0923456789", "Hà Nội", "Trân châu, bột matcha"),
        ],
    )

    cur.executemany(
        "INSERT OR IGNORE INTO nguyenlieu(ma_nl, ten_nl, don_vi, so_luong_ton, muc_canh_bao, gia_nhap_tb, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            ("NL001", "Cà phê hạt", "kg", 20, 5, 180000, "con_hang"),
            ("NL002", "Sữa tươi", "lít", 30, 8, 32000, "con_hang"),
            ("NL003", "Đường", "kg", 12, 5, 22000, "con_hang"),
            ("NL004", "Trân châu", "kg", 10, 3, 45000, "con_hang"),
            ("NL005", "Trà xanh", "gói", 8, 3, 55000, "con_hang"),
            ("NL006", "Bột matcha", "kg", 3, 2, 210000, "con_hang"),
            ("NL007", "Ly nhựa", "cái", 500, 100, 700, "con_hang"),
            ("NL008", "Ống hút", "cái", 800, 150, 200, "con_hang"),
        ],
    )

    cur.executemany(
        "INSERT OR IGNORE INTO sanpham(ma_sp, ten_sp, loai, gia_ban, trang_thai, mo_ta) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("SP001", "Cà phê đen", "Cà phê", 25000, "dang_ban", "Đậm vị cà phê"),
            ("SP002", "Cà phê sữa", "Cà phê", 30000, "dang_ban", "Cà phê pha sữa"),
            ("SP003", "Bạc xỉu", "Cà phê", 28000, "dang_ban", "Nhiều sữa, nhẹ cà phê"),
            ("SP004", "Trà sữa trân châu", "Trà sữa", 35000, "dang_ban", "Trà sữa truyền thống"),
            ("SP005", "Trà sữa matcha", "Trà sữa", 40000, "dang_ban", "Matcha thơm béo"),
            ("SP006", "Trà sữa socola", "Trà sữa", 38000, "dang_ban", "Socola béo mịn"),
            ("SP007", "Sinh tố dâu", "Sinh tố", 35000, "dang_ban", "Dâu tươi xay"),
            ("SP008", "Sinh tố bơ", "Sinh tố", 40000, "dang_ban", "Bơ chín xay mịn"),
            ("SP009", "Nước ép cam", "Nước ép", 30000, "dang_ban", "Cam tươi nguyên chất"),
        ],
    )

    cur.executemany(
        "INSERT OR IGNORE INTO congthuc(ma_sp, ma_nl, dinh_luong) VALUES (?, ?, ?)",
        [
            ("SP001", "NL001", 0.03), ("SP001", "NL003", 0.01), ("SP001", "NL007", 1), ("SP001", "NL008", 1),
            ("SP002", "NL001", 0.025), ("SP002", "NL002", 0.08), ("SP002", "NL003", 0.015), ("SP002", "NL007", 1), ("SP002", "NL008", 1),
            ("SP003", "NL001", 0.015), ("SP003", "NL002", 0.12), ("SP003", "NL003", 0.015), ("SP003", "NL007", 1), ("SP003", "NL008", 1),
            ("SP004", "NL002", 0.12), ("SP004", "NL003", 0.02), ("SP004", "NL004", 0.05), ("SP004", "NL005", 0.15), ("SP004", "NL007", 1), ("SP004", "NL008", 1),
            ("SP005", "NL002", 0.12), ("SP005", "NL003", 0.02), ("SP005", "NL006", 0.02), ("SP005", "NL007", 1), ("SP005", "NL008", 1),
            ("SP006", "NL002", 0.10), ("SP006", "NL003", 0.02), ("SP006", "NL007", 1), ("SP006", "NL008", 1),
            ("SP007", "NL003", 0.015), ("SP007", "NL007", 1), ("SP007", "NL008", 1),
        ],
    )

    cur.execute(
        """
        INSERT OR IGNORE INTO donhang(ma_hd, thoi_diem, ma_kh, ten_kh, cap_bac_khach, ma_nv, ten_nv, tong_truoc_giam, giam_gia_cap_bac, diem_su_dung, giam_gia_diem, tong_tien, diem_cong, trang_thai, phuong_thuc_thanh_toan, tien_khach_dua, tien_thua, ghi_chu)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        ("HD001", now, "KH001", "Nguyễn Văn A", "bac", "NV001", "Nguyễn Hữu Quyết", 95000, 2850, 0, 0, 92150, 9, "da_thanh_toan", "tien_mat", 100000, 7850, "Đơn mẫu"),
    )
    cur.execute(
        """
        INSERT OR IGNORE INTO donhang(ma_hd, thoi_diem, ma_kh, ten_kh, cap_bac_khach, ma_nv, ten_nv, tong_truoc_giam, giam_gia_cap_bac, diem_su_dung, giam_gia_diem, tong_tien, diem_cong, trang_thai, phuong_thuc_thanh_toan, tien_khach_dua, tien_thua, ghi_chu)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        ("HD002", now, "KH003", "Lê Văn C", "vip", "NV002", "Nhân viên bán hàng", 80000, 0, 0, 0, 80000, 0, "da_thanh_toan", "chuyen_khoan", 80000, 0, "Đơn mẫu 2"),
    )
    cur.execute(
        """
        INSERT OR IGNORE INTO donhang(ma_hd, thoi_diem, ma_kh, ten_kh, cap_bac_khach, ma_nv, ten_nv, tong_truoc_giam, giam_gia_cap_bac, diem_su_dung, giam_gia_diem, tong_tien, diem_cong, trang_thai, phuong_thuc_thanh_toan, tien_khach_dua, tien_thua, ghi_chu)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        ("HD003", now, None, "Khách lẻ", "thuong", "NV001", "Nguyễn Hữu Quyết", 22500, 0, 0, 0, 22500, 0, "da_thanh_toan", "tien_mat", 22500, 0, "Đơn mẫu 3"),
    )
    cur.executemany(
        "INSERT INTO chitietdonhang(ma_hd, ma_sp, ten_sp, so_luong, don_gia, size, ghi_chu) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            ("HD001", "SP001", "Cà phê đen", 1, 25000, "M", ""),
            ("HD001", "SP004", "Trà sữa trân châu", 1, 40000, "L", "Ít đá"),
            ("HD001", "SP002", "Cà phê sữa", 1, 30000, "M", ""),
        ],
    )


if __name__ == "__main__":
    khoi_tao_csdl()
