# Tài liệu chi tiết dự án quản lý cửa hàng đồ uống

## 1) Mở đầu

Đây là dự án quản lý vận hành cho một cửa hàng đồ uống, làm theo mô hình web tách lớp rõ ràng: frontend hiển thị giao diện, backend xử lý nghiệp vụ, MySQL lưu dữ liệu.  
Mục tiêu của đồ án không chỉ dừng ở CRUD, mà đi vào đúng các bài toán thực tế của quán như kiểm soát tồn kho nguyên liệu, bán hàng theo công thức, cộng điểm khách hàng, nhập hàng và tổng hợp báo cáo.

Nói ngắn gọn: hệ thống này mô phỏng khá sát quy trình làm việc hằng ngày của quán.

---

## 2) Mục tiêu nghiệp vụ của hệ thống

Hệ thống giải quyết các nhóm nhu cầu chính sau:

1. **Quản lý danh mục vận hành**
	- Sản phẩm bán ra.
	- Nguyên liệu trong kho.
	- Khách hàng.
	- Nhân viên và quyền truy cập.
	- Nhà cung cấp.

2. **Quản lý quy trình bán hàng**
	- Tạo đơn hàng.
	- Thanh toán đơn.
	- Hủy đơn (có hoàn kho và hoàn điểm theo logic).

3. **Quản lý nhập hàng**
	- Tạo phiếu nhập.
	- Cập nhật tồn kho nguyên liệu.
	- Tính lại giá nhập trung bình.

4. **Theo dõi và báo cáo**
	- Doanh thu.
	- Top sản phẩm, top khách hàng.
	- Tình trạng nguyên liệu sắp hết/hết hàng.

---

## 3) Kiến trúc tổng thể

### 3.1 Frontend

- Dùng HTML/CSS/JavaScript.
- Chịu trách nhiệm hiển thị giao diện, gửi request API, xử lý trải nghiệm người dùng.
- Không truy cập trực tiếp database.

### 3.2 Backend

- Dùng Python FastAPI chạy với Uvicorn.
- Backend là nơi xử lý toàn bộ nghiệp vụ quan trọng:
  - Xác thực người dùng.
  - Phân quyền vai trò.
  - Kiểm tra tồn kho trước bán.
  - Trừ/hoàn kho.
  - Tính điểm và xếp hạng khách.

### 3.3 Database

- Dùng MySQL.
- Thiết kế theo mô hình quan hệ với khóa chính/khóa ngoại rõ ràng.
- Dữ liệu được tổ chức theo các bảng nghiệp vụ: bán hàng, nhập hàng, công thức, thanh toán...

---

## 4) Cấu trúc thư mục dự án

Phần quan trọng nhất nằm ở 2 thư mục:

- `backend/`: toàn bộ API và logic nghiệp vụ.
- `frontend/`: giao diện người dùng.

Các file tài liệu đi kèm:

- `gioithieu.md`: bản giới thiệu ngắn.
- `huongdansudung.md`: hướng dẫn cài đặt/chạy.
- `README.md`: hướng dẫn chạy dự án.
- `Sơ đồ ER.md` và `Sơ đồ RD.md`: sơ đồ ER và RD của database.
---

## 5) Cơ sở dữ liệu và ý nghĩa từng bảng

Hệ thống hiện có 11 bảng chính:

1. **NhanVien**
	- Lưu tài khoản và thông tin nhân viên.
	- Chứa vai trò để phân quyền (quản lý/nhân viên).

2. **KhachHang**
	- Lưu thông tin khách.
	- Theo dõi điểm tích lũy, tổng chi tiêu, số lần mua, cấp bậc khách hàng.

3. **NhaCungCap**
	- Lưu đối tác cung ứng nguyên liệu.

4. **NguyenLieu**
	- Theo dõi tồn kho, mức cảnh báo, giá nhập trung bình, trạng thái kho.

5. **SanPham**
	- Danh mục đồ uống/món bán.
	- Có trạng thái bán và trạng thái kho chỉnh tay.

6. **CongThuc**
	- Bảng liên kết sản phẩm - nguyên liệu.
	- Quy định định lượng nguyên liệu cho từng sản phẩm.

7. **HoaDon**
	- Thông tin đầu đơn bán hàng.
	- Gồm tổng tiền, giảm giá, điểm sử dụng, trạng thái đơn...

8. **ChiTietHoaDon**
	- Các dòng sản phẩm trong từng hóa đơn.

9. **ThanhToan**
	- Lưu giao dịch thanh toán theo hóa đơn.
	- Mỗi hóa đơn có một bản ghi thanh toán.

10. **PhieuNhap**
	 - Đầu phiếu nhập kho từ nhà cung cấp.

11. **ChiTietPhieuNhap**
	 - Chi tiết nguyên liệu nhập trong mỗi phiếu.

### Quan hệ quan trọng

- `HoaDon` liên kết `KhachHang`, `NhanVien`.
- `ChiTietHoaDon` liên kết `HoaDon`, `SanPham`.
- `CongThuc` liên kết `SanPham`, `NguyenLieu`.
- `PhieuNhap` liên kết `NhaCungCap`, `NhanVien`.
- `ChiTietPhieuNhap` liên kết `PhieuNhap`, `NguyenLieu`.

Nhìn sâu hơn, có thể hiểu hệ thống vận hành dựa trên hai trục:

- **Trục bán hàng**: Sản phẩm -> Công thức -> Trừ nguyên liệu -> Thanh toán -> Cộng điểm.
- **Trục nhập kho**: Phiếu nhập -> Cập nhật tồn -> Cập nhật giá nhập bình quân.

---

## 6) Các module backend và vai trò

### 6.1 Xác thực và đăng nhập

- `dangnhap.py`: xử lý đăng nhập và lấy thông tin người dùng hiện tại.
- `xacthuc.py`: tạo/đọc token, lấy người dùng từ token, kiểm tra quyền quản lý.

### 6.2 Quản lý danh mục

- `sanpham.py`: quản lý sản phẩm, công thức, trạng thái kho sản phẩm.
- `nguyenlieu.py`: quản lý nguyên liệu và tồn kho.
- `khachhang.py`: quản lý khách hàng, thống kê và lịch sử mua.
- `nhacungcap.py`: quản lý nhà cung cấp.
- `nhanvien.py`: quản lý nhân viên.

### 6.3 Nghiệp vụ chính

- `donhang.py`: tạo đơn, thanh toán, hủy đơn.
- `nhaphang.py`: tạo phiếu nhập và tăng tồn nguyên liệu.
- `baocao.py`: trả dữ liệu báo cáo tổng quan cho dashboard.

### 6.4 Tầng dữ liệu

- `SQL/db.py`: cấu hình kết nối MySQL.
- `SQL/cosodulieu.py`: helper truy vấn, khởi tạo CSDL, các hàm đồng bộ/cập nhật dữ liệu nền.

---

## 7) Luồng nghiệp vụ thực tế

### 7.1 Luồng tạo đơn và thanh toán

1. Nhân viên tạo hóa đơn ở trạng thái chờ thanh toán.
2. Chọn sản phẩm và số lượng.
3. Hệ thống tính tổng tiền, giảm giá, điểm sử dụng (nếu có).
4. Trước khi thanh toán, backend kiểm tra tồn kho nguyên liệu theo công thức.
5. Nếu đủ tồn, hệ thống:
	- Trừ kho nguyên liệu.
	- Ghi bản ghi thanh toán.
	- Đổi trạng thái hóa đơn thành đã thanh toán.
	- Cộng điểm cho khách hàng.

Điểm mạnh của luồng này là ràng buộc dữ liệu chặt ở backend, tránh việc sai lệch kho.

### 7.2 Luồng hủy đơn

1. Chỉ người có quyền quản lý mới được hủy.
2. Khi hủy, hệ thống tính lại phần nguyên liệu đã trừ và hoàn kho ngược lại.
3. Điều chỉnh điểm khách hàng tương ứng.
4. Chuyển hóa đơn sang trạng thái đã hủy.

### 7.3 Luồng nhập hàng

1. Tạo phiếu nhập theo nhà cung cấp.
2. Thêm các dòng nguyên liệu nhập.
3. Cộng tồn kho nguyên liệu.
4. Cập nhật giá nhập trung bình theo dữ liệu mới.

---

## 8) Phân quyền và an toàn dữ liệu

Hệ thống có phân quyền theo vai trò:

- **Nhân viên**: thao tác bán hàng cơ bản.
- **Quản lý**: thêm quyền trên các thao tác nhạy cảm (ví dụ hủy đơn).

Token xác thực được dùng cho các API nghiệp vụ.  
Phần phân quyền không đặt ở frontend mà đặt tại backend, nên an toàn hơn khi triển khai thực tế.

---

## 9) API và cách tổ chức endpoint

API được chia theo nhóm chức năng, ví dụ:

- `/api/dangnhap`
- `/api/sanpham`
- `/api/nguyenlieu`
- `/api/khachhang`
- `/api/donhang`
- `/api/nhaphang`
- `/api/baocao/tongquan`

Cách chia này giúp dễ bảo trì: cần sửa phần nào thì vào đúng module đó, không bị dồn hết vào một file lớn.

---

## 10) Vận hành dự án trên máy local

Thông số DB mặc định đang dùng:

- Host: `127.0.0.1`
- Port: `3312`
- User: `root`
- Password: rỗng
- Database: `quanlycuahangdouong`

Khởi chạy backend:

```powershell
python backend\chaybackend.py
```

Truy cập:

- Trang chính: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

---

## 11) Các điểm đã làm được trong dự án

- Mô hình dữ liệu tương đối đầy đủ cho một quán đồ uống.
- Luồng bán hàng có kiểm kho theo công thức.
- Có xử lý hủy đơn và hoàn kho.
- Có cơ chế khách hàng thân thiết (điểm + cấp bậc).
- Có luồng nhập hàng và cập nhật giá vốn trung bình.
- Có dashboard số liệu tổng quan để theo dõi vận hành.

---

## 12) Hạn chế hiện tại và hướng mở rộng

### Hạn chế

- Chưa có cơ chế migration bài bản cho schema khi nâng version.
- Chưa tách hoàn toàn service layer/repository layer thành kiến trúc nhiều tầng.
- Chưa có test tự động đầy đủ cho toàn bộ nghiệp vụ.

### Hướng mở rộng

- Thêm quản lý đa chi nhánh.
- Tách quyền chi tiết hơn theo nhóm chức năng.
- Bổ sung báo cáo nâng cao theo khung thời gian linh hoạt.
- Kết nối thiết bị bán hàng (máy in bill, quét mã, thanh toán QR).
- Bổ sung logging/audit để theo dõi chỉnh sửa dữ liệu quan trọng.

---

## 13) Kết luận

Nếu nhìn dưới góc độ đồ án, dự án này đã đi đủ một vòng đời vận hành của cửa hàng đồ uống: từ dữ liệu đầu vào (nhập hàng), đến dữ liệu phát sinh (bán hàng), rồi ra đầu cuối là báo cáo quản trị.  
Điểm đáng giá nhất là các nghiệp vụ quan trọng (trừ kho, hoàn kho, điểm khách, phân quyền) được xử lý ở backend, nên hệ thống có tính thực tế và có nền để phát triển tiếp.

Nói gọn: đây là một bộ khung tốt để triển khai thành sản phẩm quản lý quán ở quy mô vừa và nhỏ.
