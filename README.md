# Hướng dẫn cài nhanh website quản lý cửa hàng đồ uống

## 1. Yêu cầu trước khi chạy

Máy cần có:

- Python 3.10 trở lên
- Trình duyệt Chrome, Edge hoặc Firefox
- VS Code nếu muốn mở và sửa code

Kiểm tra Python:

```bash
python --version
```

Nếu không được thì thử:

```bash
py --version
```

Nếu máy chưa có Python, hãy cài Python và nhớ tích chọn **Add Python to PATH** khi cài.

---

## 2. Mở thư mục dự án

Sau khi giải nén project, mở thư mục dự án bằng VS Code hoặc CMD/PowerShell.

Cấu trúc cần có:

```txt
quanlycuahangdouong/
├── backend/
├── frontend/
├── gioithieu.md
└── huongdansudung.md
```

Trong `backend` cần có:

```txt
chaybackend.py
requirements.txt
```

Trong `frontend` cần có:

```txt
index.html
style.css
api.js
app.js
```

---

## 3. Cài và chạy lần đầu

Mở Terminal tại thư mục dự án, chạy lần lượt:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python chaybackend.py
```

Nếu dùng macOS/Linux thì dòng kích hoạt môi trường ảo là:

```bash
source venv/bin/activate
```

---

## 4. Mở website

Sau khi chạy `python chaybackend.py`, mở trình duyệt và vào:

```txt
http://127.0.0.1:8000
```

Trang kiểm tra API:

```txt
http://127.0.0.1:8000/docs
```

---

## 5. Tài khoản đăng nhập mẫu

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

---

## 6. Chạy lại từ lần sau

Nếu đã cài thư viện rồi, lần sau chỉ cần:

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

## 7. Lỗi thường gặp

### Lỗi thiếu thư viện

Chạy lại:

```bash
pip install -r requirements.txt
```

### Lỗi port 8000 đã được dùng

Tắt server cũ bằng `Ctrl + C`, rồi chạy lại:

```bash
python chaybackend.py
```

### Giao diện chưa cập nhật

Bấm:

```txt
Ctrl + F5
```

để tải lại trang và xóa cache.

### Mở web bị mất CSS hoặc JavaScript

Không mở trực tiếp file `index.html`.

Cần chạy backend rồi mở:

```txt
http://127.0.0.1:8000
```

---

## 8. Tóm tắt nhanh

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python chaybackend.py
```

Mở web:

```txt
http://127.0.0.1:8000
```
