
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
