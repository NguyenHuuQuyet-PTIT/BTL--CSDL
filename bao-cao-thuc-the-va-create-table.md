## 1. Tổng quan mô hình dữ liệu

Hệ thống cửa hàng đồ uống có các nhóm dữ liệu chính:

- Nhân sự: nhân viên, quyền truy cập và trạng thái làm việc.
- Khách hàng: thông tin liên hệ, điểm tích lũy, cấp bậc và lịch sử mua.
- Danh mục bán hàng: sản phẩm, trạng thái bán, công thức nguyên liệu.
- Kho nguyên liệu: nguyên liệu, tồn kho, ngưỡng cảnh báo, giá nhập.
- Nhà cung cấp và nhập hàng: phiếu nhập và chi tiết phiếu nhập.
- Bán hàng: đơn hàng và chi tiết đơn hàng.
- Báo cáo: tổng hợp doanh thu, sản phẩm bán chạy, nguyên liệu xuất nhập.

### 1.1 Sơ đồ ERD (Mermaid)

```mermaid
erDiagram
    NHANVIEN ||--o{ DONHANG : lap
    KHACHHANG ||--o{ DONHANG : mua
    NHANVIEN ||--o{ PHIEUNHAP : lap
    NHACUNGCAP ||--o{ PHIEUNHAP : cung_cap

    DONHANG ||--o{ CHITIETDONHANG : co
    SANPHAM ||--o{ CHITIETDONHANG : duoc_ban

    PHIEUNHAP ||--o{ CHITIETPHIEUNHAP : co
    NGUYENLIEU ||--o{ CHITIETPHIEUNHAP : duoc_nhap

    SANPHAM ||--o{ CONGTHUC : co
    NGUYENLIEU ||--o{ CONGTHUC : tham_gia

    NHANVIEN {
        varchar ma_nv PK
        varchar ten_nv
        enum vai_tro
        varchar sdt
        varchar username
        varchar password_hash
        varchar trang_thai
    }

    KHACHHANG {
        varchar ma_kh PK
        varchar ten_kh
        varchar sdt
        varchar email
        varchar dia_chi
        date ngay_sinh
        varchar gioi_tinh
        int diem
        varchar cap_bac
        int tong_chi_tieu
        int so_lan_mua
        datetime ngay_tao
        datetime lan_mua_cuoi
        varchar trang_thai
        text ghi_chu
    }

    SANPHAM {
        varchar ma_sp PK
        varchar ten_sp
        varchar loai
        int gia_ban
        varchar trang_thai
        varchar trang_thai_kho_chinh_tay
        text ghi_chu_kho
        text mo_ta
    }

    NGUYENLIEU {
        varchar ma_nl PK
        varchar ten_nl
        varchar don_vi
        decimal so_luong_ton
        decimal muc_canh_bao
        int gia_nhap_tb
        varchar trang_thai
    }

    CONGTHUC {
        varchar ma_sp PK, FK
        varchar ma_nl PK, FK
        decimal dinh_luong
    }

    DONHANG {
        varchar ma_hd PK
        datetime thoi_diem
        varchar ma_kh FK
        varchar ma_nv FK
        int tong_truoc_giam
        int tong_tien
        varchar trang_thai
        varchar phuong_thuc_thanh_toan
    }

    CHITIETDONHANG {
        int id PK
        varchar ma_hd FK
        varchar ma_sp FK
        int so_luong
        int don_gia
        varchar size
    }

    NHACUNGCAP {
        varchar ma_ncc PK
        varchar ten_ncc
        varchar sdt
        varchar dia_chi
    }

    PHIEUNHAP {
        varchar ma_pn PK
        datetime ngay_nhap
        varchar ma_ncc FK
        varchar ma_nv FK
        int tong_tien
    }

    CHITIETPHIEUNHAP {
        int id PK
        varchar ma_pn FK
        varchar ma_nl FK
        decimal so_luong
        int don_gia
    }

## 2. Các thực thể trong hệ thống

### 2.1 Nhân viên - `nhanvien`

Thực thể này lưu thông tin tài khoản đăng nhập và vai trò sử dụng hệ thống.

- Khóa chính: `ma_nv`
- Mục đích: xác định người dùng hệ thống, phân quyền quản lý hoặc nhân viên.
- Thuộc tính chính: `ten_nv`, `vai_tro`, `sdt`, `username`, `password_hash`, `trang_thai`

Ý nghĩa nghiệp vụ:

- `username` là tên đăng nhập duy nhất.
- `password_hash` lưu mật khẩu đã băm.
- `vai_tro` dùng để phân biệt người có toàn quyền và người dùng bình thường.
- `trang_thai` cho biết tài khoản còn hoạt động hay đã ngừng làm.

### 2.2 Khách hàng - `khachhang`

Thực thể này lưu hồ sơ khách hàng, thông tin liên hệ và thống kê mua hàng.

- Khóa chính: `ma_kh`
- Mục đích: quản lý khách hàng, tích điểm và phân hạng.
- Thuộc tính chính: `ten_kh`, `sdt`, `email`, `dia_chi`, `ngay_sinh`, `gioi_tinh`, `diem`, `cap_bac`, `tong_chi_tieu`, `so_lan_mua`, `ngay_tao`, `lan_mua_cuoi`, `trang_thai`, `ghi_chu`

Ý nghĩa nghiệp vụ:

- `diem` là số điểm tích lũy hiện có.
- `cap_bac` được tính từ điểm hoặc tổng chi tiêu.
- `tong_chi_tieu` và `so_lan_mua` phục vụ báo cáo khách hàng thân thiết.
- `lan_mua_cuoi` giúp biết khách hàng đã quay lại gần nhất lúc nào.

### 2.3 Nhà cung cấp - `nhacungcap`

Thực thể này lưu thông tin nhà cung cấp nguyên liệu.

- Khóa chính: `ma_ncc`
- Mục đích: quản lý nơi cung cấp hàng hóa cho kho.
- Thuộc tính chính: `ten_ncc`, `sdt`, `dia_chi`, `ghi_chu`

Ý nghĩa nghiệp vụ:

- Mỗi phiếu nhập đều phải gắn với một nhà cung cấp.
- `ghi_chu` dùng để lưu thông tin phụ như loại hàng, cách giao, điều kiện thanh toán.

### 2.4 Nguyên liệu - `nguyenlieu`

Thực thể này quản lý nguyên vật liệu trong kho.

- Khóa chính: `ma_nl`
- Mục đích: theo dõi tồn kho, mức cảnh báo và giá nhập trung bình.
- Thuộc tính chính: `ten_nl`, `don_vi`, `so_luong_ton`, `muc_canh_bao`, `gia_nhap_tb`, `trang_thai`

Ý nghĩa nghiệp vụ:

- `so_luong_ton` là số lượng đang còn trong kho.
- `muc_canh_bao` là ngưỡng để cảnh báo sắp hết hàng.
- `gia_nhap_tb` là giá nhập trung bình phục vụ thống kê.
- `trang_thai` được hệ thống tự tính là `con_hang`, `sap_het` hoặc `het_hang`.

### 2.5 Sản phẩm - `sanpham`

Thực thể này lưu món bán ra cho khách hàng.

- Khóa chính: `ma_sp`
- Mục đích: quản lý menu và trạng thái bán.
- Thuộc tính chính: `ten_sp`, `loai`, `gia_ban`, `trang_thai`, `trang_thai_kho_chinh_tay`, `ghi_chu_kho`, `mo_ta`

Ý nghĩa nghiệp vụ:

- `trang_thai` điều khiển món đó có được bán hay không.
- `trang_thai_kho_chinh_tay` cho phép quản lý ép trạng thái kho nếu muốn.
- `mo_ta` giúp hiển thị mô tả món trên giao diện.

### 2.6 Công thức sản phẩm - nguyên liệu - `congthuc`

Đây là bảng trung gian mô tả mỗi sản phẩm cần bao nhiêu nguyên liệu.

- Khóa chính ghép: `ma_sp`, `ma_nl`
- Mục đích: thể hiện quan hệ nhiều - nhiều giữa sản phẩm và nguyên liệu.
- Thuộc tính chính: `dinh_luong`

Ý nghĩa nghiệp vụ:

- Một sản phẩm có thể dùng nhiều nguyên liệu.
- Một nguyên liệu có thể xuất hiện trong nhiều sản phẩm.
- `dinh_luong` là định mức nguyên liệu cho 1 sản phẩm.

### 2.7 Đơn hàng - `donhang`

Thực thể này lưu một hóa đơn bán hàng hoàn chỉnh.

- Khóa chính: `ma_hd`
- Mục đích: lưu thời điểm bán, khách hàng, nhân viên, giảm giá, tiền thanh toán và điểm tích lũy.
- Thuộc tính chính: `thoi_diem`, `ma_kh`, `ten_kh`, `cap_bac_khach`, `ma_nv`, `ten_nv`, `tong_truoc_giam`, `giam_gia_cap_bac`, `diem_su_dung`, `giam_gia_diem`, `tong_tien`, `diem_cong`, `trang_thai`, `phuong_thuc_thanh_toan`, `tien_khach_dua`, `tien_thua`, `ghi_chu`

Ý nghĩa nghiệp vụ:

- `tong_truoc_giam` là tổng tiền trước khi áp giảm giá.
- `giam_gia_cap_bac` là giảm giá theo cấp bậc khách hàng.
- `giam_gia_diem` là số tiền quy đổi từ điểm.
- `diem_cong` là điểm được cộng sau thanh toán.
- `trang_thai` đang dùng các giá trị như `da_thanh_toan` hoặc `da_huy`.

### 2.8 Chi tiết đơn hàng - `chitietdonhang`

Thực thể này lưu từng dòng sản phẩm trong một hóa đơn.

- Khóa chính: `id`
- Mục đích: tách hóa đơn thành nhiều dòng chi tiết.
- Thuộc tính chính: `ma_hd`, `ma_sp`, `ten_sp`, `so_luong`, `don_gia`, `size`, `ghi_chu`

Ý nghĩa nghiệp vụ:

- Một đơn hàng có thể chứa nhiều món.
- Mỗi món có số lượng, size và ghi chú riêng.
- Khi xóa đơn hàng cha thì các dòng chi tiết cũng phải xóa theo.

### 2.9 Phiếu nhập - `phieunhap`

Thực thể này lưu một lần nhập nguyên liệu.

- Khóa chính: `ma_pn`
- Mục đích: ghi nhận một lần nhập hàng từ nhà cung cấp.
- Thuộc tính chính: `ngay_nhap`, `ma_ncc`, `ten_ncc`, `ma_nv`, `ten_nv`, `tong_tien`, `ghi_chu`

Ý nghĩa nghiệp vụ:

- Mỗi phiếu nhập gắn với một nhà cung cấp và một nhân viên lập phiếu.
- `tong_tien` là tổng giá trị của cả phiếu nhập.

### 2.10 Chi tiết phiếu nhập - `chitietphieunhap`

Thực thể này lưu từng nguyên liệu trong một phiếu nhập.

- Khóa chính: `id`
- Mục đích: tách phiếu nhập thành nhiều dòng nguyên liệu.
- Thuộc tính chính: `ma_pn`, `ma_nl`, `ten_nl`, `so_luong`, `don_gia`

Ý nghĩa nghiệp vụ:

- Một phiếu nhập có thể chứa nhiều nguyên liệu.
- Mỗi nguyên liệu có số lượng và đơn giá riêng.
- Khi xóa phiếu nhập cha thì chi tiết phiếu nhập cũng phải xóa theo.

## 3. Quan hệ giữa các thực thể

### 3.1 Quan hệ nhân viên - đơn hàng

- Một nhân viên có thể tạo nhiều đơn hàng.
- Mỗi đơn hàng chỉ do một nhân viên lập.
- Quan hệ là 1 - N.
- Khóa ngoại dùng trong bảng `donhang`: `ma_nv` tham chiếu `nhanvien(ma_nv)`.

### 3.2 Quan hệ khách hàng - đơn hàng

- Một khách hàng có thể phát sinh nhiều đơn hàng.
- Một đơn hàng có thể không gắn khách hàng nếu là khách lẻ.
- Quan hệ là 0..1 - N từ phía đơn hàng đến khách hàng.
- Khóa ngoại dùng trong bảng `donhang`: `ma_kh` tham chiếu `khachhang(ma_kh)`.

### 3.3 Quan hệ nhà cung cấp - phiếu nhập

- Một nhà cung cấp có thể xuất hiện trong nhiều phiếu nhập.
- Mỗi phiếu nhập chỉ thuộc về một nhà cung cấp.
- Quan hệ là 1 - N.
- Khóa ngoại dùng trong bảng `phieunhap`: `ma_ncc` tham chiếu `nhacungcap(ma_ncc)`.

### 3.4 Quan hệ nhân viên - phiếu nhập

- Một nhân viên có thể lập nhiều phiếu nhập.
- Mỗi phiếu nhập chỉ do một nhân viên lập.
- Quan hệ là 1 - N.
- Khóa ngoại dùng trong bảng `phieunhap`: `ma_nv` tham chiếu `nhanvien(ma_nv)`.

### 3.5 Quan hệ sản phẩm - nguyên liệu

- Quan hệ giữa sản phẩm và nguyên liệu là quan hệ nhiều - nhiều.
- Vì vậy phải tách thành bảng trung gian `congthuc`.
- Mỗi dòng của `congthuc` biểu diễn một nguyên liệu của một sản phẩm.
- Khóa chính ghép `(ma_sp, ma_nl)` ngăn trùng công thức.

### 3.6 Quan hệ đơn hàng - chi tiết đơn hàng

- Một đơn hàng có nhiều dòng chi tiết.
- Mỗi dòng chi tiết chỉ thuộc về một đơn hàng.
- Quan hệ là 1 - N.
- Khóa ngoại dùng trong bảng `chitietdonhang`: `ma_hd` tham chiếu `donhang(ma_hd)` và có `ON DELETE CASCADE`.

### 3.7 Quan hệ phiếu nhập - chi tiết phiếu nhập

- Một phiếu nhập có nhiều dòng chi tiết.
- Mỗi dòng chi tiết chỉ thuộc về một phiếu nhập.
- Quan hệ là 1 - N.
- Khóa ngoại dùng trong bảng `chitietphieunhap`: `ma_pn` tham chiếu `phieunhap(ma_pn)` và có `ON DELETE CASCADE`.

## 4. Chuyển từ ER sang RD

Trong ERD, ta mô tả thực thể và quan hệ bằng hình vẽ. Khi chuyển sang RD, ta quy đổi sang các bảng như sau:

- Thực thể mạnh thành bảng chính.
- Quan hệ 1 - N được thể hiện bằng khóa ngoại ở phía N.
- Quan hệ N - N được tách thành bảng trung gian.
- Thuộc tính đa trị hoặc thuộc tính gắn theo từng lần giao dịch được đưa vào bảng chi tiết.

### 4.1 Ánh xạ thực thể mạnh

- `nhanvien` → bảng nhân viên.
- `khachhang` → bảng khách hàng.
- `nhacungcap` → bảng nhà cung cấp.
- `nguyenlieu` → bảng nguyên liệu.
- `sanpham` → bảng sản phẩm.
- `donhang` → bảng đơn hàng.
- `phieunhap` → bảng phiếu nhập.

### 4.2 Ánh xạ thực thể kết hợp

- `congthuc` → bảng kết hợp giữa sản phẩm và nguyên liệu.
- `chitietdonhang` → bảng chi tiết đơn hàng.
- `chitietphieunhap` → bảng chi tiết phiếu nhập.

### 4.3 Vì sao phải tách bảng chi tiết

- Tránh lặp dữ liệu tên sản phẩm, tên nguyên liệu, số lượng trong cùng một bảng đơn hàng hoặc phiếu nhập.
- Dễ tính tổng tiền, tổng nguyên liệu và báo cáo chi tiết.
- Dễ xóa dây chuyền dữ liệu con khi xóa dữ liệu cha.

## 5. Thứ tự CREATE TABLE

Nên tạo bảng theo thứ tự sau:

1. `nhanvien`
2. `khachhang`
3. `nhacungcap`
4. `nguyenlieu`
5. `sanpham`
6. `congthuc`
7. `donhang`
8. `chitietdonhang`
9. `phieunhap`
10. `chitietphieunhap`

Lý do:

- Các bảng được tham chiếu bởi khóa ngoại phải tồn tại trước.
- Bảng trung gian `congthuc` cần có cả `sanpham` và `nguyenlieu`.
- Bảng chi tiết cần có bảng cha trước khi khai báo ràng buộc `ON DELETE CASCADE`.

## 6. Mẫu CREATE TABLE MySQL trong dự án

Đây là schema đang dùng trong backend và trong file `backend/database.sql`.

```sql
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
```

## 7. Giải thích chi tiết ERD và RD

### 7.1 Bản chất ERD của đề tài

ERD mô tả bài toán bằng thực thể, thuộc tính và quan hệ.

Trong bài này:

- Thực thể chính là nhân viên, khách hàng, nhà cung cấp, nguyên liệu, sản phẩm, đơn hàng và phiếu nhập.
- Quan hệ nhiều - nhiều xuất hiện giữa sản phẩm và nguyên liệu.
- Quan hệ 1 - nhiều xuất hiện giữa đơn hàng và chi tiết đơn hàng, phiếu nhập và chi tiết phiếu nhập.

### 7.2 Bản chất RD của đề tài

RD là kết quả chuyển ERD sang mô hình bảng quan hệ.

Sau khi chuyển, hệ thống có các bảng:

- Bảng gốc: `nhanvien`, `khachhang`, `nhacungcap`, `nguyenlieu`, `sanpham`, `donhang`, `phieunhap`
- Bảng trung gian / chi tiết: `congthuc`, `chitietdonhang`, `chitietphieunhap`

### 7.3 Ý nghĩa từng quan hệ chính

- `nhanvien` - `donhang`: cho biết ai là người lập hóa đơn.
- `khachhang` - `donhang`: cho biết hóa đơn thuộc về khách nào.
- `nhacungcap` - `phieunhap`: cho biết hàng nhập từ đâu.
- `nhanvien` - `phieunhap`: cho biết ai lập phiếu nhập.
- `sanpham` - `congthuc` - `nguyenlieu`: cho biết món bán dùng nguyên liệu nào và bao nhiêu.
- `donhang` - `chitietdonhang`: cho biết mỗi hóa đơn có những món nào.
- `phieunhap` - `chitietphieunhap`: cho biết mỗi phiếu nhập có những nguyên liệu nào.

### 7.4 Vì sao `congthuc` là bảng trung gian

Nếu không có bảng `congthuc`, ta sẽ phải nhét danh sách nguyên liệu vào `sanpham`, dẫn đến:

- Lặp dữ liệu.
- Khó cập nhật định mức nguyên liệu.
- Khó tính tồn kho khi bán hàng.
- Khó thêm mới hoặc xóa một nguyên liệu riêng lẻ.

Vì vậy `congthuc` là bảng bắt buộc để chuẩn hóa dữ liệu.

### 7.5 Vì sao bảng chi tiết phải tách riêng

Bảng chi tiết được tách ra để:

- Lưu nhiều dòng trong một hóa đơn hoặc phiếu nhập.
- Giữ thông tin từng dòng riêng biệt như số lượng, đơn giá, size, ghi chú.
- Dễ thống kê theo từng mặt hàng hoặc nguyên liệu.

### 7.6 Ý nghĩa của `ON DELETE CASCADE`

`ON DELETE CASCADE` dùng trong hai bảng con:

- `chitietdonhang`
- `chitietphieunhap`

Nghĩa là khi xóa bản ghi cha thì bản ghi con tự xóa theo.

Điều này rất quan trọng để tránh dữ liệu mồ côi. Ví dụ:

- Xóa một đơn hàng thì chi tiết đơn hàng của nó phải mất theo.
- Xóa một phiếu nhập thì chi tiết phiếu nhập của nó phải mất theo.

## 8. Liên hệ trực tiếp với code backend

### 8.1 `backend/chaybackend.py`

File này là điểm khởi động ứng dụng.

Vai trò liên quan đến SQL:

- Gọi `khoi_tao_csdl()` khi ứng dụng chạy.
- Đảm bảo schema trong `SCHEMA_SQL` được tạo trước khi các router hoạt động.
- Nếu file `backend/database.sql` chưa có thì ghi từ `SCHEMA_SQL` ra.

Tức là `chaybackend.py` không tự viết SQL nghiệp vụ, nhưng là nơi đảm bảo CSDL đã tồn tại trước khi API bắt đầu phục vụ.

### 8.2 `backend/cosodulieu.py`

Đây là file quan trọng nhất cho toàn bộ tầng CSDL.

Các hàm liên quan trực tiếp đến SQL:

- `ket_noi()` mở kết nối MySQL từ biến môi trường `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.
- `lay_mot()` chạy truy vấn SELECT và trả về một dòng.
- `lay_tat_ca()` chạy truy vấn SELECT và trả về nhiều dòng.
- `thuc_thi()` chạy INSERT, UPDATE hoặc DELETE rồi commit.
- `tao_ma_moi()` sinh mã mới như `HD001`, `SP001`, `KH001` bằng cách lấy mã lớn nhất hiện có.
- `cap_nhat_cap_bac_khach()` đọc `diem` và `tong_chi_tieu`, sau đó cập nhật `cap_bac`.
- `cap_nhat_trang_thai_nguyen_lieu()` đọc `so_luong_ton` và `muc_canh_bao`, sau đó cập nhật `trang_thai`.
- `_cot_da_ton_tai()` truy vấn `information_schema.columns` để kiểm tra cột trước khi thêm cột mới.
- `_them_cot_neu_thieu()` dùng `ALTER TABLE ADD COLUMN` khi cần nâng cấp schema cũ.
- `_bo_sung_cot_moi()` thực hiện nâng cấp không phá dữ liệu cũ.
- `_dong_bo_thong_ke_khach()` tính lại tổng chi tiêu, số lần mua và lần mua cuối.
- `khoi_tao_csdl()` chạy `SCHEMA_SQL`, seed dữ liệu mẫu và đồng bộ thống kê.

Điểm quan trọng của file này là nó giữ cho toàn bộ các module khác không phải viết lại cách gọi DB. Các module vẫn dùng `conn.execute(...)`, `fetchone()`, `fetchall()`, `commit()` như trước.

### 8.3 `backend/xacthuc.py`

File này dùng SQL để xác thực người dùng.

Truy vấn chính:

- Lấy nhân viên theo `ma_nv`.
- Kiểm tra `trang_thai = 'dang_lam'`.

Ý nghĩa:

- Chỉ tài khoản còn hoạt động mới được tạo token.
- Nếu nhân viên bị ngừng làm thì token không còn hợp lệ.

### 8.4 `backend/dangnhap.py`

File này nhận username và password rồi truy vấn bảng `nhanvien`.

SQL thường dùng ở đây:

- `SELECT ... FROM nhanvien WHERE username = ?`

Sau đó so sánh `password_hash` với mật khẩu đã băm.

### 8.5 `backend/sanpham.py`

File này làm việc với `sanpham` và `congthuc`.

SQL chính thường dùng:

- `SELECT * FROM sanpham`
- `INSERT INTO sanpham ...`
- `UPDATE sanpham SET ... WHERE ma_sp = ?`
- `DELETE FROM sanpham WHERE ma_sp = ?`
- `DELETE FROM congthuc WHERE ma_sp = ?`
- `INSERT INTO congthuc(ma_sp, ma_nl, dinh_luong) VALUES (?, ?, ?)`

Ý nghĩa nghiệp vụ:

- Khi sửa công thức một món, hệ thống xóa các dòng cũ trong `congthuc` rồi thêm lại dòng mới.
- Khi xóa sản phẩm, công thức liên quan cũng phải xử lý để không còn dữ liệu treo.

### 8.6 `backend/nguyenlieu.py`

File này thao tác với bảng `nguyenlieu`.

SQL thường dùng:

- `SELECT * FROM nguyenlieu`
- `INSERT INTO nguyenlieu ...`
- `UPDATE nguyenlieu SET ... WHERE ma_nl = ?`
- `DELETE FROM nguyenlieu WHERE ma_nl = ?`

Sau mỗi lần cập nhật tồn kho, hàm `cap_nhat_trang_thai_nguyen_lieu()` được gọi để đồng bộ trạng thái kho.

### 8.7 `backend/khachhang.py`

File này thao tác với bảng `khachhang`.

SQL thường dùng:

- `SELECT * FROM khachhang`
- `INSERT INTO khachhang ...`
- `UPDATE khachhang SET ... WHERE ma_kh = ?`
- `DELETE FROM khachhang WHERE ma_kh = ?`

Ngoài CRUD, file này còn phục vụ thống kê khách hàng:

- Tính điểm.
- Tính cấp bậc.
- Cập nhật tổng chi tiêu.
- Cập nhật số lần mua.

### 8.8 `backend/nhacungcap.py`

File này thao tác với bảng `nhacungcap`.

SQL chính:

- `SELECT * FROM nhacungcap`
- `INSERT INTO nhacungcap ...`
- `UPDATE nhacungcap SET ... WHERE ma_ncc = ?`
- `DELETE FROM nhacungcap WHERE ma_ncc = ?`

### 8.9 `backend/nhanvien.py`

File này thao tác với bảng `nhanvien`.

SQL thường dùng:

- `SELECT * FROM nhanvien`
- `INSERT INTO nhanvien ...`
- `UPDATE nhanvien SET ... WHERE ma_nv = ?`
- `DELETE FROM nhanvien WHERE ma_nv = ?`

Đây là nơi quản lý tài khoản đăng nhập và phân quyền.

### 8.10 `backend/donhang.py`

Đây là file nghiệp vụ quan trọng nhất của hệ thống bán hàng.

SQL thường dùng:

- `SELECT * FROM donhang ORDER BY ...`
- `SELECT * FROM donhang WHERE ma_hd = ?`
- `SELECT * FROM chitietdonhang WHERE ma_hd = ?`
- `SELECT * FROM sanpham WHERE ma_sp = ? AND trang_thai = 'dang_ban'`
- `SELECT ma_nl, dinh_luong FROM congthuc WHERE ma_sp = ?`
- `SELECT ten_nl, so_luong_ton FROM nguyenlieu WHERE ma_nl = ?`
- `INSERT INTO donhang ...`
- `INSERT INTO chitietdonhang ...`
- `UPDATE nguyenlieu SET so_luong_ton = so_luong_ton - ? WHERE ma_nl = ?`
- `UPDATE khachhang SET ... WHERE ma_kh = ?`
- `UPDATE donhang SET trang_thai = 'da_huy' ...`

Ý nghĩa nghiệp vụ:

- Khi tạo đơn, hệ thống phải kiểm tra sản phẩm còn bán và còn nguyên liệu.
- Khi tạo đơn xong, hệ thống trừ kho nguyên liệu.
- Khi hủy đơn, hệ thống cộng trả nguyên liệu và hoàn lại điểm cho khách nếu cần.

Ở đây SQL không chỉ để đọc dữ liệu mà còn để đảm bảo tính toàn vẹn nghiệp vụ.

### 8.11 `backend/nhaphang.py`

File này xử lý nhập nguyên liệu.

SQL thường dùng:

- `SELECT * FROM nhacungcap WHERE ma_ncc = ?`
- `SELECT * FROM nguyenlieu WHERE ma_nl = ?`
- `INSERT INTO phieunhap ...`
- `INSERT INTO chitietphieunhap ...`
- `UPDATE nguyenlieu SET so_luong_ton = ?, gia_nhap_tb = ? WHERE ma_nl = ?`

Ý nghĩa nghiệp vụ:

- Mỗi lần nhập hàng làm tăng tồn kho.
- Giá nhập trung bình của nguyên liệu được cập nhật lại.

### 8.12 `backend/baocao.py`

File này dùng để thống kê và tổng hợp.

SQL thường dùng:

- `JOIN` giữa `donhang`, `chitietdonhang`, `sanpham`
- `JOIN` giữa `phieunhap`, `chitietphieunhap`, `nguyenlieu`
- `GROUP BY` để gom nhóm doanh thu theo sản phẩm hoặc theo ngày.
- `SUM`, `COUNT`, `MAX`, `AVG` để thống kê.

Đây là phần thể hiện rõ nhất việc dữ liệu quan hệ đã được thiết kế đúng.

## 9. Các lệnh SQL quan trọng và cách chúng xuất hiện trong code

### 9.1 SELECT

SELECT dùng để đọc dữ liệu.

Trong code:

- `lay_mot()`
- `lay_tat_ca()`
- các câu `conn.execute("SELECT ...")` trong từng module

Ví dụ:

```sql
SELECT * FROM sanpham WHERE trang_thai = 'dang_ban';
SELECT * FROM khachhang WHERE ma_kh = ?;
```

### 9.2 INSERT

INSERT dùng để thêm dữ liệu mới.

Trong code:

- tạo sản phẩm
- thêm khách hàng
- tạo đơn hàng
- nhập nguyên liệu
- seed dữ liệu mẫu trong `them_du_lieu_mau()`

Ví dụ:

```sql
INSERT INTO donhang(ma_hd, thoi_diem, ma_kh, ten_kh, ma_nv, ten_nv, tong_tien)
VALUES (?, ?, ?, ?, ?, ?, ?);
```

### 9.3 UPDATE

UPDATE dùng để sửa dữ liệu.

Trong code:

- cập nhật trạng thái sản phẩm
- cập nhật số lượng tồn kho
- cập nhật điểm khách hàng
- cập nhật trạng thái đơn hàng
- cập nhật cấp bậc khách

Ví dụ:

```sql
UPDATE nguyenlieu
SET so_luong_ton = so_luong_ton - ?
WHERE ma_nl = ?;
```

### 9.4 DELETE

DELETE dùng để xóa dữ liệu.

Trong code:

- xóa sản phẩm
- xóa công thức cũ khi cập nhật công thức mới
- xóa khách hàng hoặc nguyên liệu nếu không còn dùng

Ví dụ:

```sql
DELETE FROM congthuc WHERE ma_sp = ?;
DELETE FROM donhang WHERE ma_hd = ?;
```

### 9.5 JOIN

JOIN dùng để ghép dữ liệu từ nhiều bảng.

Trong code báo cáo, JOIN thường xuất hiện để lấy tên sản phẩm, tên khách hàng, tên nguyên liệu và nhân viên cùng lúc.

Ví dụ:

```sql
SELECT dh.ma_hd, dh.thoi_diem, nv.ten_nv
FROM donhang dh
JOIN nhanvien nv ON dh.ma_nv = nv.ma_nv;
```

### 9.6 WHERE

WHERE là điều kiện chọn đúng dòng cần thao tác.

Trong code, WHERE gần như luôn đi kèm với mã định danh:

- `ma_nv`
- `ma_kh`
- `ma_ncc`
- `ma_nl`
- `ma_sp`
- `ma_hd`
- `ma_pn`

Điều này giúp tránh sửa/xóa nhầm toàn bộ bảng.

### 9.7 ORDER BY, LIMIT, GROUP BY, HAVING

Những lệnh này xuất hiện chủ yếu trong báo cáo và danh sách hiển thị.

- `ORDER BY` để sắp xếp mới nhất trước.
- `LIMIT` để lấy top N.
- `GROUP BY` để gom nhóm theo sản phẩm, ngày, nhân viên.
- `HAVING` để lọc sau khi gom nhóm.

### 9.8 FOREIGN KEY và ON DELETE CASCADE

Khóa ngoại giúp dữ liệu giữa các bảng luôn nhất quán.

Trong code:

- Nếu xóa `donhang` thì `chitietdonhang` mất theo.
- Nếu xóa `phieunhap` thì `chitietphieunhap` mất theo.

Điều này ngăn lỗi dữ liệu mồ côi.

### 9.9 TRANSACTION và commit

Khi tạo đơn hàng hoặc nhập hàng, hệ thống cần nhiều câu SQL chạy liên tiếp.

Vì vậy backend dùng một kết nối, thực hiện nhiều câu lệnh, rồi `commit()` sau khi thành công.

Ý nghĩa:

- Nếu một bước lỗi, dữ liệu không được ghi dở dang.
- Đảm bảo trừ kho, tạo đơn, tạo chi tiết và cập nhật khách hàng đều đi cùng nhau.

## 10. Liên hệ với cấu trúc MySQL của dự án

### 10.1 Vì sao dùng MySQL

- Phù hợp với mô hình server - client.
- Dễ quản lý dữ liệu tập trung.
- Dễ dùng công cụ như MySQL Workbench, phpMyAdmin hoặc CLI.
- Phù hợp với bài báo cáo có nhiều bảng và quan hệ rõ ràng.

### 10.2 Những điểm MySQL đang được dùng trong schema

- `VARCHAR` cho mã và chuỗi ngắn.
- `INT` cho số nguyên như giá, điểm, số lượng.
- `DECIMAL` cho số lượng lẻ và định lượng.
- `DATETIME` cho thời gian giao dịch.
- `ENUM` cho trạng thái nhỏ, cố định.
- `ENGINE=InnoDB` để hỗ trợ khóa ngoại.
- `DEFAULT CHARSET=utf8mb4` để lưu tiếng Việt đúng.

### 10.3 Lý do các bảng dùng `VARCHAR` thay vì `TEXT`

- Mã định danh như `ma_nv`, `ma_sp`, `ma_hd` có độ dài cố định tương đối.
- `VARCHAR` phù hợp cho dữ liệu có thể lập chỉ mục và so sánh nhanh.
- Các trường mô tả dài như `ghi_chu`, `mo_ta` mới dùng `TEXT`.

### 10.4 Ý nghĩa của lớp kết nối tương thích trong `cosodulieu.py`

Backend hiện tại dùng một lớp proxy để các module cũ vẫn gọi được như cách dùng SQLite trước đây.

Điều đó giúp:

- Giữ nguyên cách viết truy vấn ở các file nghiệp vụ.
- Không phải sửa hàng loạt module chỉ vì đổi driver.
- Hạn chế làm hỏng tính năng hiện có.

## 11. Kết luận ngắn cho phần bảo vệ

Nếu giáo viên hỏi, có thể trả lời ngắn gọn như sau:

- ERD mô tả thực thể và quan hệ.
- RD là các bảng quan hệ đã chuẩn hóa.
- `congthuc` là bảng trung gian giữa sản phẩm và nguyên liệu.
- `chitietdonhang` và `chitietphieunhap` là bảng chi tiết của giao dịch.
- `FOREIGN KEY` và `ON DELETE CASCADE` đảm bảo toàn vẹn dữ liệu.
- Backend dùng MySQL và truy vấn trực tiếp qua `cosodulieu.py`.
- Các module nghiệp vụ vẫn dùng SELECT, INSERT, UPDATE, DELETE, JOIN như một lớp dữ liệu thống nhất.
