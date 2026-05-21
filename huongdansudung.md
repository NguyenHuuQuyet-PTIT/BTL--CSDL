# Hướng dẫn chạy và sử dụng website quản lý cửa hàng đồ uống

## 1. Yêu cầu trước khi chạy

Máy cần cài:

- Python 3.10 trở lên.
- Trình duyệt web như Chrome, Edge hoặc Firefox.
- VS Code nếu muốn mở và chỉnh sửa code.

Kiểm tra Python bằng lệnh:

```bash
python --version
```

Nếu máy không nhận lệnh `python`, thử:

```bash
py --version
```

Nếu chưa có Python, hãy cài Python và nhớ tích chọn `Add Python to PATH` khi cài đặt trên Windows.

---

## 2. Mở đúng thư mục dự án

Sau khi giải nén project, thư mục dự án cần có dạng:

```txt
quanlycuahangdouong/
├── backend/
├── frontend/
├── gioithieu.md
└── huongdansudung.md
```

Trong thư mục `backend` cần có file:

```txt
chaybackend.py
requirements.txt
```

Trong thư mục `frontend` cần có:

```txt
index.html
style.css
api.js
app.js
```

Không cần file `overrides.css`, `.bat` hoặc `.sh`.

---

## 3. Mở Terminal tại thư mục dự án

Có thể mở bằng một trong các cách:

- Mở VS Code rồi chọn `Terminal` → `New Terminal`.
- Hoặc mở CMD/PowerShell tại thư mục dự án.

Sau đó vào thư mục backend:

```bash
cd backend
```

---

## 4. Tạo môi trường ảo Python

Chạy lệnh:

```bash
python -m venv venv
```

Kích hoạt môi trường ảo trên Windows:

```bash
venv\Scripts\activate
```

Nếu dùng macOS hoặc Linux:

```bash
source venv/bin/activate
```

Sau khi kích hoạt thành công, terminal thường hiện thêm chữ `(venv)` ở đầu dòng.

---

## 5. Cài thư viện cần thiết

Vẫn đang ở thư mục `backend`, chạy:

```bash
pip install -r requirements.txt
```

Lệnh này dùng để cài các thư viện cần thiết cho backend như FastAPI và Uvicorn.

---

## 6. Chạy backend

Vẫn ở thư mục `backend`, chạy:

```bash
python chaybackend.py
```

Nếu chạy thành công, terminal sẽ hiện server đang chạy ở cổng `8000`.

---

## 7. Mở website

Mở trình duyệt và truy cập:

```txt
http://127.0.0.1:8000
```

Không nên mở trực tiếp file `frontend/index.html`, vì nếu mở trực tiếp bằng file thì API có thể không hoạt động đúng.

---

## 8. Tài khoản đăng nhập mẫu

Tài khoản quản lý:

```txt
username: admin
password: admin
```

Tài khoản nhân viên:

```txt
username: staff
password: staff
```

Quản lý sẽ nhìn thấy đầy đủ các mục như Menu, Kho hàng, Nhập hàng, Nhà cung cấp, Nhân viên và Báo cáo.

Nhân viên chỉ nhìn thấy các chức năng phù hợp như Tổng quan, Bán hàng và Khách hàng.

---

## 9. Trang kiểm tra API

FastAPI có trang kiểm tra API tại:

```txt
http://127.0.0.1:8000/docs
```

Có thể dùng trang này để xem backend đã chạy chưa và kiểm tra các API của hệ thống.

---

## 10. Cách chạy lại ở những lần sau

Nếu đã từng cài thư viện rồi, những lần sau chỉ cần:

```bash
cd backend
venv\Scripts\activate
python chaybackend.py
```

Sau đó mở:

```txt
http://127.0.0.1:8000
```

---

## 11. Một số lỗi thường gặp

### 11.1. Không chạy được `python chaybackend.py`

Kiểm tra xem đã đứng đúng thư mục `backend` chưa.

Đúng:

```bash
cd backend
python chaybackend.py
```

Sai thường gặp là chạy ở ngoài thư mục dự án hoặc chỉ chạy riêng file `chaybackend.py` mà thiếu các file backend khác.

### 11.2. Báo thiếu thư viện

Chạy lại:

```bash
pip install -r requirements.txt
```

Nếu chưa kích hoạt môi trường ảo thì chạy:

```bash
venv\Scripts\activate
```

rồi cài lại thư viện.

### 11.3. Port 8000 đã bị dùng

Nếu báo lỗi cổng `8000` đã được sử dụng, có thể server cũ vẫn đang chạy.

Cách xử lý:

- Quay lại terminal cũ và bấm `Ctrl + C`.
- Sau đó chạy lại:

```bash
python chaybackend.py
```

### 11.4. Giao diện chưa cập nhật sau khi sửa CSS

Bấm:

```txt
Ctrl + F5
```

để tải lại trang và xóa cache CSS cũ.

### 11.5. Vào web bị mất CSS hoặc JavaScript

Kiểm tra thư mục `frontend` có đủ các file:

```txt
index.html
style.css
api.js
app.js
```

Trong `index.html` chỉ cần nạp:

```html
<link rel="stylesheet" href="./style.css" />
```

Không cần nạp:

```html
<link rel="stylesheet" href="./overrides.css" />
```

---

## 12. Tóm tắt lệnh chạy nhanh

Chạy lần đầu:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python chaybackend.py
```

Chạy từ lần sau:

```bash
cd backend
venv\Scripts\activate
python chaybackend.py
```

Mở web:

```txt
http://127.0.0.1:8000
```

Mở API docs:

```txt
http://127.0.0.1:8000/docs