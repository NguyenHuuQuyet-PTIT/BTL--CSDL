
CREATE TABLE IF NOT EXISTS nhanvien (
    ma_nv VARCHAR(20) PRIMARY KEY,
    ten_nv VARCHAR(100) NOT NULL,
    vai_tro ENUM('quan_ly', 'nhan_vien') NOT NULL,
    sdt VARCHAR(20),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'dang_lam'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS khachhang (
    ma_kh VARCHAR(20) PRIMARY KEY,
    ten_kh VARCHAR(100) NOT NULL,
    sdt VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) DEFAULT '',
    dia_chi VARCHAR(255) DEFAULT '',
    ngay_sinh DATE DEFAULT NULL,
    gioi_tinh VARCHAR(10) DEFAULT '',
    diem INT NOT NULL DEFAULT 0,
    cap_bac VARCHAR(20) NOT NULL DEFAULT 'thuong',
    tong_chi_tieu INT NOT NULL DEFAULT 0,
    so_lan_mua INT NOT NULL DEFAULT 0,
    ngay_tao DATETIME DEFAULT NULL,
    lan_mua_cuoi DATETIME DEFAULT NULL,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'dang_hoat_dong',
    ghi_chu TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nhacungcap (
    ma_ncc VARCHAR(20) PRIMARY KEY,
    ten_ncc VARCHAR(150) NOT NULL,
    sdt VARCHAR(20),
    dia_chi VARCHAR(255),
    ghi_chu TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nguyenlieu (
    ma_nl VARCHAR(20) PRIMARY KEY,
    ten_nl VARCHAR(150) NOT NULL,
    don_vi VARCHAR(20) NOT NULL,
    so_luong_ton DECIMAL(12,2) NOT NULL DEFAULT 0,
    muc_canh_bao DECIMAL(12,2) NOT NULL DEFAULT 5,
    gia_nhap_tb INT NOT NULL DEFAULT 0,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'con_hang'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sanpham (
    ma_sp VARCHAR(20) PRIMARY KEY,
    ten_sp VARCHAR(150) NOT NULL,
    loai VARCHAR(50) NOT NULL,
    gia_ban INT NOT NULL,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'dang_ban',
    trang_thai_kho_chinh_tay VARCHAR(20) NOT NULL DEFAULT 'tu_dong',
    ghi_chu_kho TEXT,
    mo_ta TEXT,
    CONSTRAINT chk_trang_thai_sanpham CHECK (trang_thai IN ('dang_ban', 'ngung_ban')),
    CONSTRAINT chk_trang_thai_kho CHECK (trang_thai_kho_chinh_tay IN ('tu_dong', 'con_hang', 'sap_het', 'het_hang'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS congthuc (
    ma_sp VARCHAR(20) NOT NULL,
    ma_nl VARCHAR(20) NOT NULL,
    dinh_luong DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (ma_sp, ma_nl),
    FOREIGN KEY (ma_sp) REFERENCES sanpham(ma_sp) ON DELETE CASCADE,
    FOREIGN KEY (ma_nl) REFERENCES nguyenlieu(ma_nl)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS donhang (
    ma_hd VARCHAR(20) PRIMARY KEY,
    thoi_diem DATETIME NOT NULL,
    ma_kh VARCHAR(20),
    ten_kh VARCHAR(100) NOT NULL,
    cap_bac_khach VARCHAR(20) DEFAULT 'thuong',
    ma_nv VARCHAR(20) NOT NULL,
    ten_nv VARCHAR(100) NOT NULL,
    tong_truoc_giam INT NOT NULL DEFAULT 0,
    giam_gia_cap_bac INT NOT NULL DEFAULT 0,
    diem_su_dung INT NOT NULL DEFAULT 0,
    giam_gia_diem INT NOT NULL DEFAULT 0,
    tong_tien INT NOT NULL,
    diem_cong INT NOT NULL DEFAULT 0,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'da_thanh_toan',
    phuong_thuc_thanh_toan VARCHAR(20) DEFAULT 'tien_mat',
    tien_khach_dua INT NOT NULL DEFAULT 0,
    tien_thua INT NOT NULL DEFAULT 0,
    ghi_chu TEXT,
    FOREIGN KEY (ma_kh) REFERENCES khachhang(ma_kh),
    FOREIGN KEY (ma_nv) REFERENCES nhanvien(ma_nv)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chitietdonhang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_hd VARCHAR(20) NOT NULL,
    ma_sp VARCHAR(20) NOT NULL,
    ten_sp VARCHAR(150) NOT NULL,
    so_luong INT NOT NULL,
    don_gia INT NOT NULL,
    size VARCHAR(10) NOT NULL DEFAULT 'M',
    ghi_chu TEXT,
    FOREIGN KEY (ma_hd) REFERENCES donhang(ma_hd) ON DELETE CASCADE,
    FOREIGN KEY (ma_sp) REFERENCES sanpham(ma_sp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS phieunhap (
    ma_pn VARCHAR(20) PRIMARY KEY,
    ngay_nhap DATETIME NOT NULL,
    ma_ncc VARCHAR(20) NOT NULL,
    ten_ncc VARCHAR(150) NOT NULL,
    ma_nv VARCHAR(20) NOT NULL,
    ten_nv VARCHAR(100) NOT NULL,
    tong_tien INT NOT NULL,
    ghi_chu TEXT,
    FOREIGN KEY (ma_ncc) REFERENCES nhacungcap(ma_ncc),
    FOREIGN KEY (ma_nv) REFERENCES nhanvien(ma_nv)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chitietphieunhap (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_pn VARCHAR(20) NOT NULL,
    ma_nl VARCHAR(20) NOT NULL,
    ten_nl VARCHAR(150) NOT NULL,
    so_luong DECIMAL(12,2) NOT NULL,
    don_gia INT NOT NULL,
    FOREIGN KEY (ma_pn) REFERENCES phieunhap(ma_pn) ON DELETE CASCADE,
    FOREIGN KEY (ma_nl) REFERENCES nguyenlieu(ma_nl)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
