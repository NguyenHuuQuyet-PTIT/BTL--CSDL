# Hướng dẫn sử dụng

## 1) Tải code từ GitHub

```powershell
git clone <link-repo>
cd "BTL CSDL"
```

Nếu không dùng Git thì tải ZIP trên GitHub, giải nén rồi mở thư mục dự án bằng VS Code.

## 2) Cài môi trường

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

Nếu bị chặn activate trên PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

## 3) Cấu hình database

Mặc định backend dùng MySQL:

- host: `127.0.0.1`
- port: `3312`
- user: `root`
- password: rỗng
- db: `quanlycuahangdouong`

Thông số này nằm ở file `backend/SQL/db.py`. Nếu máy bạn khác thì sửa lại cho khớp.

## 4) Chạy dự án

```powershell
python backend\chaybackend.py
```

Mở web tại:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/docs`

## 5) Lỗi hay gặp

- Thiếu thư viện: chạy lại `pip install -r backend\requirements.txt`
- Bận cổng 8000: tìm PID rồi `taskkill /PID <pid> /F`
- Không kết nối MySQL: kiểm tra service MySQL và lại cấu hình trong `backend/SQL/db.py`