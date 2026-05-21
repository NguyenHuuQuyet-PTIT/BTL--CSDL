# Giới thiệu website quản lý cửa hàng đồ uống

## 1. Tên đề tài

**Website quản lý cửa hàng đồ uống**

Đây là website hỗ trợ quản lý hoạt động kinh doanh của một cửa hàng đồ uống. Hệ thống được xây dựng nhằm giúp cửa hàng quản lý sản phẩm, bán hàng, kho nguyên liệu, nhập hàng, nhà cung cấp, khách hàng, nhân viên và báo cáo doanh thu.

Dự án được viết theo mô hình **fullstack**, trong đó frontend và backend được tách riêng rõ ràng.

- Frontend dùng để hiển thị giao diện và nhận thao tác từ người dùng.
- Backend dùng để xử lý dữ liệu, đăng nhập, phân quyền, nghiệp vụ và database.
- Database dùng để lưu thông tin thật của cửa hàng.

Điểm quan trọng của dự án là **không để lộ backend trong frontend**. Frontend không chứa câu SQL, không chứa database, không chứa mật khẩu gốc và không tự xử lý các nghiệp vụ quan trọng như trừ kho, cộng điểm, hủy đơn hay tính báo cáo.

---

## 2. Lý do chọn đề tài

Hiện nay các cửa hàng đồ uống thường có nhiều công việc cần quản lý cùng lúc như bán hàng, kiểm tra kho, nhập nguyên liệu, chăm sóc khách hàng và theo dõi doanh thu. Nếu quản lý thủ công bằng giấy tờ hoặc file Excel thì dễ xảy ra sai sót, khó tìm kiếm dữ liệu và khó tổng hợp báo cáo.

Vì vậy, website quản lý cửa hàng đồ uống được xây dựng để giúp các thao tác này trở nên nhanh hơn, chính xác hơn và dễ theo dõi hơn.

Đề tài này cũng phù hợp với sinh viên vì có thể áp dụng nhiều kiến thức như:

- Thiết kế giao diện web.
- Viết JavaScript xử lý giao diện.
- Xây dựng backend bằng Python.
- Thiết kế cơ sở dữ liệu.
- Xây dựng API.
- Phân quyền người dùng.
- Liên kết dữ liệu giữa nhiều bảng.

---

## 3. Mục tiêu của website

Website hướng tới các mục tiêu chính sau:

- Hỗ trợ bán hàng tại quầy.
- Quản lý danh sách sản phẩm/menu.
- Quản lý trạng thái sản phẩm còn hàng, sắp hết hoặc hết hàng.
- Quản lý kho nguyên liệu.
- Quản lý nhập hàng từ nhà cung cấp.
- Quản lý thông tin khách hàng.
- Quản lý khách VIP và điểm tích lũy.
- Quản lý nhân viên và tài khoản đăng nhập.
- Thống kê doanh thu, hóa đơn và báo cáo kinh doanh.
- Đảm bảo các chức năng liên kết chặt chẽ với nhau.
- Tách frontend và backend để tránh lộ xử lý backend trong frontend.

---

## 4. Công nghệ sử dụng

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Frontend | HTML | Tạo cấu trúc trang web |
| Frontend | CSS | Thiết kế giao diện, màu sắc, bố cục |
| Frontend | JavaScript thuần | Xử lý giao diện và gọi API |
| Backend | Python FastAPI | Xử lý API, nghiệp vụ, đăng nhập, phân quyền |
| Database | SQLite | Lưu trữ dữ liệu cửa hàng |
| API Docs | Swagger UI | Kiểm tra API tại đường dẫn `/docs` |

Dự án không dùng:

- React
- TSX
- TypeScript
- Vite
- NodeJS
- File `.bat`
- File `.sh`

Lý do dùng HTML, CSS, JavaScript thuần là để code dễ hiểu, phù hợp với sinh viên chưa học React hoặc TypeScript.

---

## 5. Mô hình hoạt động

Website hoạt động theo mô hình:

```txt
Người dùng
→ thao tác trên giao diện frontend
→ frontend gọi API
→ backend xử lý dữ liệu
→ backend truy vấn database
→ backend trả kết quả
→ frontend hiển thị kết quả
```

Ví dụ khi bán hàng:

```txt
Nhân viên chọn sản phẩm
→ thêm vào giỏ hàng
→ chọn khách hàng
→ thanh toán
→ backend tạo hóa đơn
→ backend trừ kho
→ backend cộng điểm khách hàng
→ backend cập nhật báo cáo
→ frontend hiển thị thông báo thành công
```

---

## 6. Cấu trúc thư mục dự án

```txt
quanlycuahangdouong/
├── backend/
│   ├── chaybackend.py
│   ├── cosodulieu.py
│   ├── xacthuc.py
│   ├── dangnhap.py
│   ├── sanpham.py
│   ├── nguyenlieu.py
│   ├── khachhang.py
│   ├── nhacungcap.py
│   ├── nhanvien.py
│   ├── donhang.py
│   ├── nhaphang.py
│   ├── baocao.py
│   ├── database.sql
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── api.js
│   └── app.js
├── gioithieu.md
└── huongdansudung.md
```

---

## 7. Quy tắc đặt tên file

Dự án đặt tên file theo yêu cầu:

- Các file Python `.py` đặt tên tiếng Việt viết liền không dấu.
- Các file frontend đặt tên tiếng Anh.
- Hai file markdown đặt tên tiếng Việt.
- Không dùng file `.bat`.
- Không dùng file `.sh`.
- Không dùng file `overrides.css`.

Frontend chỉ cần 4 file chính:

```txt
index.html
style.css
api.js
app.js
```

---

## 8. Ý nghĩa các file backend

### 8.1. `chaybackend.py`

Đây là file chạy chính của backend.

Nhiệm vụ:

- Tạo ứng dụng FastAPI.
- Kết nối các router API.
- Khởi tạo database khi chạy lần đầu.
- Phục vụ frontend.
- Cho phép mở web tại `http://127.0.0.1:8000`.
- Cho phép xem API docs tại `http://127.0.0.1:8000/docs`.

### 8.2. `cosodulieu.py`

File này xử lý database.

Nhiệm vụ:

- Kết nối SQLite.
- Tạo bảng dữ liệu.
- Tạo dữ liệu mẫu.
- Tính thời gian theo múi giờ Việt Nam.
- Tính hạng khách hàng.
- Tính trạng thái kho nguyên liệu.
- Tính trạng thái còn hàng, sắp hết, hết hàng của sản phẩm.

### 8.3. `xacthuc.py`

File này xử lý xác thực và phân quyền.

Nhiệm vụ:

- Tạo token đăng nhập.
- Kiểm tra token khi gọi API.
- Kiểm tra người dùng hiện tại.
- Kiểm tra quyền quản lý hoặc nhân viên.

### 8.4. `dangnhap.py`

File này xử lý đăng nhập.

Nhiệm vụ:

- Nhận username và mật khẩu.
- Kiểm tra tài khoản.
- Kiểm tra trạng thái nhân viên.
- Trả token cho frontend nếu đăng nhập đúng.

### 8.5. `sanpham.py`

File này xử lý sản phẩm/menu.

Nhiệm vụ:

- Lấy danh sách sản phẩm.
- Thêm sản phẩm.
- Sửa sản phẩm.
- Xóa sản phẩm.
- Quản lý trạng thái đang bán hoặc ngừng bán.
- Quản lý công thức nguyên liệu.
- Quản lý trạng thái còn hàng/hết hàng do quản lý chỉnh.

### 8.6. `nguyenlieu.py`

File này xử lý kho nguyên liệu.

Nhiệm vụ:

- Lấy danh sách nguyên liệu.
- Thêm nguyên liệu.
- Sửa nguyên liệu.
- Xóa nguyên liệu.
- Theo dõi tồn kho.
- Theo dõi mức cảnh báo.
- Theo dõi giá nhập trung bình.

### 8.7. `khachhang.py`

File này xử lý khách hàng.

Nhiệm vụ:

- Lấy danh sách khách hàng.
- Thêm khách hàng.
- Sửa khách hàng.
- Xóa hoặc ngừng hoạt động khách hàng.
- Quản lý điểm tích lũy.
- Quản lý tổng chi tiêu.
- Quản lý số lần mua.
- Xếp hạng khách hàng.
- Xem lịch sử mua hàng.

### 8.8. `nhacungcap.py`

File này xử lý nhà cung cấp.

Nhiệm vụ:

- Lấy danh sách nhà cung cấp.
- Thêm nhà cung cấp.
- Sửa nhà cung cấp.
- Xóa nhà cung cấp.
- Liên kết nhà cung cấp với phiếu nhập.

### 8.9. `nhanvien.py`

File này xử lý nhân viên.

Nhiệm vụ:

- Lấy danh sách nhân viên.
- Thêm nhân viên.
- Sửa nhân viên.
- Xóa hoặc chuyển nhân viên sang nghỉ làm.
- Quản lý tài khoản đăng nhập.
- Phân quyền quản lý hoặc nhân viên.

### 8.10. `donhang.py`

File này xử lý bán hàng và hóa đơn.

Nhiệm vụ:

- Tạo hóa đơn.
- Lưu chi tiết hóa đơn.
- Kiểm tra kho trước khi bán.
- Trừ nguyên liệu theo công thức.
- Tính giảm giá khách VIP.
- Tính điểm sử dụng.
- Cộng điểm cho khách hàng.
- Hủy đơn.
- Hoàn kho khi hủy đơn.
- Cập nhật lại điểm khách hàng khi hủy đơn.

### 8.11. `nhaphang.py`

File này xử lý nhập hàng.

Nhiệm vụ:

- Tạo phiếu nhập.
- Lưu chi tiết phiếu nhập.
- Chọn nhà cung cấp.
- Nhập nhiều nguyên liệu trong một phiếu.
- Tăng tồn kho nguyên liệu.
- Cập nhật giá nhập trung bình.

### 8.12. `baocao.py`

File này xử lý báo cáo.

Nhiệm vụ:

- Thống kê doanh thu.
- Thống kê số đơn.
- Thống kê sản phẩm bán chạy.
- Thống kê khách hàng.
- Thống kê khách VIP.
- Thống kê phương thức thanh toán.
- Thống kê kho sắp hết hoặc hết hàng.

---

## 9. Ý nghĩa các file frontend

### 9.1. `index.html`

File HTML chính của website.

Nhiệm vụ:

- Tạo khung trang web.
- Nạp `style.css`.
- Nạp `api.js`.
- Nạp `app.js`.
- Chứa thẻ `div` để JavaScript render giao diện.

### 9.2. `style.css`

File giao diện chính.

Nhiệm vụ:

- Thiết kế trang đăng nhập.
- Thiết kế sidebar.
- Thiết kế dashboard.
- Thiết kế card sản phẩm.
- Thiết kế bảng dữ liệu.
- Thiết kế modal.
- Thiết kế nút bấm.
- Thiết kế thông báo.
- Thiết kế trạng thái còn hàng/hết hàng.
- Ẩn thanh cuộn nhưng vẫn cho phép cuộn.

### 9.3. `api.js`

File gọi API.

Nhiệm vụ:

- Khai báo địa chỉ API.
- Lấy token đăng nhập.
- Gửi token lên backend.
- Gọi API đăng nhập.
- Gọi API sản phẩm.
- Gọi API khách hàng.
- Gọi API kho.
- Gọi API nhập hàng.
- Gọi API nhà cung cấp.
- Gọi API nhân viên.
- Gọi API đơn hàng.
- Gọi API báo cáo.

### 9.4. `app.js`

File xử lý giao diện.

Nhiệm vụ:

- Render trang đăng nhập.
- Render trang tổng quan.
- Render trang bán hàng.
- Render trang quản lý menu.
- Render trang kho hàng.
- Render trang nhập hàng.
- Render trang khách hàng.
- Render trang nhân viên.
- Render trang báo cáo.
- Xử lý modal.
- Xử lý thông báo.
- Xử lý xác nhận thao tác.
- Gọi API khi người dùng thao tác.

---

## 10. Nguyên tắc không lộ backend

Frontend không chứa:

- Câu SQL.
- Database.
- Mật khẩu gốc.
- Logic hash mật khẩu.
- Logic phân quyền thật.
- Logic trừ kho thật.
- Logic cộng điểm thật.
- Logic hủy đơn thật.
- Logic tính báo cáo thật.

Các phần này đều được xử lý trong backend Python.

Khi mở DevTools, người dùng có thể thấy frontend gọi các đường dẫn như:

```txt
/api/dangnhap
/api/sanpham
/api/donhang
/api/khachhang
/api/baocao/tongquan
```

Đây là điều bình thường của website fullstack. Người dùng chỉ thấy đường dẫn API, không thấy code backend bên trong.

---

## 11. Phân quyền người dùng

Website có hai vai trò chính:

| Vai trò | Quyền |
|---|---|
| Quản lý | Sử dụng toàn bộ chức năng |
| Nhân viên | Chủ yếu bán hàng và chăm sóc khách hàng |

Quản lý có thể:

- Quản lý menu.
- Quản lý kho.
- Nhập hàng.
- Quản lý nhà cung cấp.
- Quản lý khách hàng.
- Quản lý nhân viên.
- Xem báo cáo.
- Hủy đơn.
- Chỉnh trạng thái còn hàng/hết hàng.

Nhân viên có thể:

- Bán hàng.
- Chọn khách hàng.
- Thêm nhanh khách hàng.
- Xem một số thông tin cơ bản.

Backend có kiểm tra quyền, không chỉ ẩn nút ở frontend.

---

## 12. Các chức năng chính

Website gồm các mục:

1. Tổng quan
2. Bán hàng
3. Quản lý Menu
4. Kho hàng
5. Nhập hàng
6. Nhà cung cấp
7. Khách hàng
8. Nhân viên
9. Báo cáo

Các mục này liên kết với nhau thông qua database.

---

## 13. Tổng quan

Mục Tổng quan dùng để xem nhanh tình hình cửa hàng.

Thông tin hiển thị gồm:

- Doanh thu hôm nay.
- Số đơn hàng.
- Số sản phẩm.
- Số khách hàng.
- Đơn hàng gần đây.

Dữ liệu được lấy từ backend nên là dữ liệu thật trong database.

---

## 14. Bán hàng

Mục Bán hàng dùng để tạo hóa đơn.

Chức năng:

- Hiển thị sản phẩm đang bán.
- Lọc sản phẩm theo loại.
- Thêm sản phẩm vào giỏ hàng.
- Chọn size.
- Tăng/giảm số lượng.
- Xóa món khỏi giỏ.
- Chọn khách hàng.
- Thêm nhanh khách hàng.
- Áp dụng giảm giá theo hạng khách.
- Sử dụng điểm tích lũy.
- Tính tổng tiền.
- Tạo hóa đơn.
- In hóa đơn.

Sau khi thanh toán, backend tự động:

```txt
Tạo hóa đơn
→ lưu chi tiết hóa đơn
→ trừ kho nguyên liệu
→ cộng điểm khách hàng
→ cập nhật hạng khách
→ cập nhật báo cáo
→ cập nhật trạng thái còn/hết hàng
```

---

## 15. Quản lý Menu

Mục Quản lý Menu dùng để quản lý sản phẩm.

Chức năng:

- Thêm sản phẩm.
- Sửa sản phẩm.
- Xóa sản phẩm.
- Bật/tắt trạng thái đang bán.
- Nhập giá bán.
- Nhập mô tả.
- Nhập loại sản phẩm.
- Nhập công thức nguyên liệu.
- Chỉnh trạng thái còn hàng, sắp hết, hết hàng.
- Tìm kiếm sản phẩm.
- Lọc sản phẩm.
- Xuất CSV.

---

## 16. Trạng thái còn hàng, sắp hết, hết hàng

Sản phẩm có trạng thái kho để hỗ trợ bán hàng.

Các trạng thái gồm:

| Trạng thái | Ý nghĩa |
|---|---|
| Còn hàng | Sản phẩm có thể bán |
| Sắp hết | Sản phẩm còn ít nguyên liệu |
| Hết hàng | Sản phẩm không thể bán |
| Chưa có công thức | Chưa có công thức nguyên liệu để tính kho |

Quản lý có thể chỉnh tay:

| Lựa chọn | Ý nghĩa |
|---|---|
| Tự động theo kho | Backend tự tính theo nguyên liệu |
| Quản lý đặt: Còn hàng | Hiển thị là còn hàng |
| Quản lý đặt: Sắp hết | Hiển thị là sắp hết |
| Quản lý đặt: Hết hàng | Khóa bán sản phẩm |

Nếu quản lý đặt `Hết hàng`, sản phẩm bị khóa ở trang Bán hàng.

Nếu quản lý đặt `Còn hàng` nhưng kho thật sự không đủ, backend vẫn chặn thanh toán để tránh âm kho.

---

## 17. Công thức nguyên liệu

Công thức nguyên liệu cho biết 1 sản phẩm cần bao nhiêu nguyên liệu.

Ví dụ:

```txt
NL001|0.03
NL002|0.01
NL005|1
```

Ý nghĩa:

- `NL001` là mã nguyên liệu.
- `0.03` là số lượng cần dùng cho 1 sản phẩm.
- Mỗi dòng là một nguyên liệu.
- Dấu `|` dùng để tách mã nguyên liệu và số lượng.

Khi bán hàng, backend dùng công thức này để trừ kho.

Khi hủy đơn, backend dùng công thức này để hoàn kho.

---

## 18. Kho hàng

Mục Kho hàng dùng để quản lý nguyên liệu.

Chức năng:

- Thêm nguyên liệu.
- Sửa nguyên liệu.
- Xóa nguyên liệu.
- Quản lý đơn vị tính.
- Quản lý tồn kho.
- Quản lý mức cảnh báo.
- Quản lý giá nhập trung bình.
- Tự tính trạng thái còn hàng/sắp hết/hết hàng.
- Tìm kiếm nguyên liệu.
- Lọc theo trạng thái.
- Xuất CSV.

Kho hàng liên kết với:

- Menu.
- Bán hàng.
- Nhập hàng.
- Báo cáo.

---

## 19. Nhập hàng

Mục Nhập hàng dùng để nhập nguyên liệu vào kho.

Chức năng:

- Chọn nhà cung cấp.
- Chọn nguyên liệu.
- Nhập số lượng.
- Nhập đơn giá.
- Thêm nhiều dòng nguyên liệu.
- Tính tổng tiền phiếu nhập.
- Lưu phiếu nhập.
- Xem chi tiết phiếu nhập.
- Xuất CSV.

Sau khi nhập hàng:

```txt
Phiếu nhập được tạo
→ tồn kho tăng
→ giá nhập trung bình cập nhật
→ trạng thái nguyên liệu cập nhật
→ trạng thái sản phẩm cập nhật
→ báo cáo cập nhật
```

---

## 20. Nhà cung cấp

Mục Nhà cung cấp dùng để quản lý nơi nhập nguyên liệu.

Chức năng:

- Thêm nhà cung cấp.
- Sửa nhà cung cấp.
- Xóa nhà cung cấp.
- Tìm kiếm nhà cung cấp.
- Liên kết với phiếu nhập.
- Xuất CSV.

Nếu nhà cung cấp đã có phiếu nhập, không nên xóa cứng để giữ lịch sử nhập hàng.

---

## 21. Khách hàng

Mục Khách hàng dùng để quản lý khách quen và khách VIP.

Chức năng:

- Thêm khách hàng.
- Sửa khách hàng.
- Xóa hoặc ngừng hoạt động khách hàng.
- Lưu số điện thoại.
- Lưu email.
- Lưu địa chỉ.
- Lưu ngày sinh.
- Lưu giới tính.
- Lưu ghi chú.
- Theo dõi điểm tích lũy.
- Theo dõi tổng chi tiêu.
- Theo dõi số lần mua.
- Theo dõi lần mua cuối.
- Xem lịch sử mua hàng.
- Tự động xếp hạng khách.
- Lọc theo hạng khách.
- Lọc theo trạng thái.
- Tìm kiếm khách hàng.

---

## 22. Khách VIP và điểm tích lũy

Website có hệ thống khách hàng thân thiết.

### Hạng khách

| Hạng | Điều kiện | Ưu đãi |
|---|---:|---:|
| Thường | Mặc định | 0% |
| Bạc | Từ 100 điểm hoặc 1.000.000đ tổng chi | Giảm 3% |
| Vàng | Từ 300 điểm hoặc 3.000.000đ tổng chi | Giảm 5% |
| VIP | Từ 800 điểm hoặc 8.000.000đ tổng chi | Giảm 10% |

### Điểm tích lũy

Quy tắc:

- 10.000đ thanh toán = 1 điểm.
- 1 điểm = giảm 1.000đ.
- Chỉ khách đã lưu thông tin mới tích điểm.
- Khách lẻ không tích điểm.
- Dùng điểm tối đa 50% hóa đơn sau giảm hạng khách.
- Nếu hủy đơn, điểm được cập nhật lại.

Ví dụ:

```txt
Khách VIP mua đơn 100.000đ
Giảm VIP 10% = 10.000đ
Còn lại 90.000đ
Dùng 20 điểm = giảm 20.000đ
Khách trả 70.000đ
Điểm cộng mới = 7 điểm
```

---

## 23. Nhân viên

Mục Nhân viên dùng để quản lý tài khoản đăng nhập.

Chức năng:

- Thêm nhân viên.
- Sửa nhân viên.
- Xóa hoặc chuyển nghỉ làm.
- Quản lý họ tên.
- Quản lý số điện thoại.
- Quản lý username.
- Quản lý mật khẩu.
- Phân quyền quản lý/nhân viên.
- Quản lý trạng thái đang làm/nghỉ làm.
- Tìm kiếm nhân viên.
- Lọc nhân viên.
- Xuất CSV.

Nếu nhân viên đã từng bán hàng, không nên xóa cứng để giữ lịch sử hóa đơn.

---

## 24. Hóa đơn và hủy đơn

Hóa đơn gồm:

- Mã hóa đơn.
- Thời gian bán.
- Nhân viên bán.
- Khách hàng.
- Hạng khách tại thời điểm mua.
- Phương thức thanh toán.
- Tiền khách đưa.
- Tiền thừa.
- Tạm tính.
- Giảm hạng khách.
- Giảm bằng điểm.
- Tổng tiền.
- Điểm cộng.
- Điểm đã dùng.
- Trạng thái hóa đơn.
- Chi tiết từng món.

Khi hủy đơn:

```txt
Đơn chuyển sang đã hủy
→ kho được hoàn lại
→ điểm đã cộng bị trừ lại
→ điểm đã dùng được hoàn lại
→ tổng chi tiêu khách cập nhật lại
→ hạng khách tính lại
→ báo cáo cập nhật lại
```

Chỉ quản lý được hủy đơn.

---

## 25. Báo cáo

Mục Báo cáo tổng hợp dữ liệu từ nhiều bảng.

Các báo cáo gồm:

- Doanh thu hôm nay.
- Số đơn hôm nay.
- Doanh thu tháng.
- Giảm giá tháng.
- Đơn đã hủy.
- Doanh thu theo ngày.
- Doanh thu theo phương thức thanh toán.
- Sản phẩm bán chạy.
- Top khách hàng.
- Thống kê khách VIP.
- Thống kê hạng khách.
- Nguyên liệu sắp hết.
- Nguyên liệu hết hàng.
- Đơn hàng gần đây.
- Xuất báo cáo CSV.

Đơn đã hủy không được tính vào doanh thu.

---

## 26. Thông báo và xác nhận

Website có thông báo khi:

- Đăng nhập thành công.
- Đăng nhập thất bại.
- Thêm dữ liệu thành công.
- Sửa dữ liệu thành công.
- Xóa dữ liệu thành công.
- Thanh toán thành công.
- Nhập hàng thành công.
- Hủy đơn thành công.
- Lỗi thiếu dữ liệu.
- Lỗi không đủ kho.
- Lỗi thiếu quyền.
- Lỗi gọi API.

Website có hộp xác nhận trước khi:

- Thanh toán.
- Xóa dữ liệu.
- Hủy đơn.
- Lưu phiếu nhập.
- Đổi trạng thái quan trọng.

---

## 27. Thời gian thực

Dự án dùng thời gian thực theo múi giờ Việt Nam.

Các phần dùng thời gian thực:

- Hóa đơn.
- Phiếu nhập.
- Lần mua cuối của khách.
- Báo cáo hôm nay.
- Báo cáo tháng.
- Đồng hồ trên giao diện.

Thời gian quan trọng được backend xử lý, không phụ thuộc hoàn toàn vào frontend.

---

## 28. Giao diện website

Giao diện được thiết kế theo phong cách hiện đại, màu chủ đạo là kem, nâu và cam.

Các phần giao diện chính:

- Trang đăng nhập 2 cột.
- Sidebar nâu đậm.
- Menu active màu cam.
- Nền chính màu kem.
- Card sản phẩm bo góc lớn.
- Bảng dữ liệu gọn gàng.
- Modal xác nhận.
- Toast thông báo.
- Ẩn thanh cuộn để giao diện gọn hơn nhưng vẫn cuộn được.

Card sản phẩm hiển thị:

- Icon đồ uống.
- Loại sản phẩm.
- Tên sản phẩm.
- Mã sản phẩm.
- Giá bán.
- Mô tả.
- Trạng thái còn hàng/hết hàng.
- Nút sửa/xóa trong trang quản lý.

---

## 29. Luồng liên kết nghiệp vụ

### 29.1. Luồng bán hàng

```txt
Menu sản phẩm
→ Bán hàng
→ Chọn khách hàng
→ Áp dụng VIP/điểm
→ Thanh toán
→ Tạo hóa đơn
→ Trừ kho
→ Cập nhật khách hàng
→ Cập nhật báo cáo
→ Cập nhật trạng thái còn/hết hàng
```

### 29.2. Luồng nhập hàng

```txt
Nhà cung cấp
→ Nhập hàng
→ Chọn nguyên liệu
→ Lưu phiếu nhập
→ Tăng kho
→ Cập nhật giá nhập
→ Cập nhật trạng thái kho
→ Cập nhật báo cáo
```

### 29.3. Luồng hủy đơn

```txt
Chi tiết hóa đơn
→ Quản lý hủy đơn
→ Hoàn kho
→ Cập nhật điểm khách
→ Tính lại hạng khách
→ Loại khỏi doanh thu
→ Cập nhật báo cáo
```

---

## 30. Điểm mạnh của dự án

Dự án có các điểm mạnh:

- Giao diện đẹp, dễ dùng.
- Không dùng công nghệ quá khó với sinh viên năm nhất.
- Frontend và backend tách riêng.
- Không lộ backend trong frontend.
- Có phân quyền quản lý/nhân viên.
- Có database lưu dữ liệu thật.
- Các chức năng liên kết với nhau.
- Có khách VIP và điểm tích lũy.
- Có trạng thái còn hàng/hết hàng.
- Có hủy đơn và hoàn kho.
- Có báo cáo tổng hợp.
- Có tài liệu giới thiệu và hướng dẫn chạy.
- Phù hợp để thuyết trình môn cơ sở dữ liệu hoặc lập trình web.

---

## 31. Hướng phát triển thêm

Nếu muốn nâng cấp thành hệ thống dùng thật hơn, có thể bổ sung:

- In hóa đơn theo khổ giấy K58/K80.
- Tạo mã QR chuyển khoản.
- Quản lý ca làm việc.
- Chấm công nhân viên.
- Quản lý bàn.
- Quản lý đơn giao hàng.
- Quản lý topping.
- Quản lý combo.
- Quản lý voucher/mã giảm giá.
- Biểu đồ doanh thu đẹp hơn.
- Sao lưu database tự động.
- Đổi SQLite sang PostgreSQL hoặc MySQL.
- Hash mật khẩu bằng bcrypt.
- Đăng nhập bằng JWT chuẩn.
- Phân quyền chi tiết hơn.
- Quản lý nhiều chi nhánh.

---

## 32. Kết luận

Website quản lý cửa hàng đồ uống là một hệ thống fullstack có đầy đủ các chức năng cơ bản để hỗ trợ hoạt động của một cửa hàng nhỏ. Dự án có giao diện dễ dùng, backend xử lý dữ liệu riêng, database lưu thông tin thật và các chức năng liên kết chặt chẽ với nhau.

Dự án phù hợp cho sinh viên học lập trình web, cơ sở dữ liệu và phát triển ứng dụng quản lý. Nếu tiếp tục nâng cấp về bảo mật, in hóa đơn, sao lưu dữ liệu và triển khai server thật, hệ thống có thể phát triển thành phần mềm quản lý cửa hàng hoàn chỉnh hơn.