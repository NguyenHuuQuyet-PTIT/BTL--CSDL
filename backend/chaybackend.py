from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from cosodulieu import khoi_tao_csdl, SCHEMA_SQL
import dangnhap
import sanpham
import khachhang
import nguyenlieu
import nhacungcap
import nhanvien
import donhang
import nhaphang
import baocao

THU_MUC_GOC = Path(__file__).resolve().parent.parent
THU_MUC_GIAO_DIEN = THU_MUC_GOC / "frontend"
THU_MUC_BACKEND = THU_MUC_GOC / "backend"

app = FastAPI(title="Drink shop management backend")

# Khi backend tự phục vụ frontend thì frontend gọi cùng domain, không cần mở CORS rộng.
# Dòng này để tiện chạy thử nếu sinh viên mở frontend riêng bằng port khác.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:8000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def khi_khoi_dong():
    khoi_tao_csdl()
    # Ghi file SQL tham khảo nếu chưa có.
    duong_dan_sql = THU_MUC_BACKEND / "database.sql"
    if not duong_dan_sql.exists():
        duong_dan_sql.write_text(SCHEMA_SQL, encoding="utf-8")

@app.get("/")
def trang_chu():
    return FileResponse(THU_MUC_GIAO_DIEN / "index.html")

@app.get("/login")
def trang_dang_nhap():
    # Cho phép mở đường dẫn /login giống bản demo Netlify.
    return FileResponse(THU_MUC_GIAO_DIEN / "index.html")

@app.get("/kiemtra")
def kiem_tra():
    return {"message": "Backend is running", "api": "/docs"}

@app.get("/style.css")
def file_style():
    return FileResponse(THU_MUC_GIAO_DIEN / "style.css", media_type="text/css")

@app.get("/api.js")
def file_api():
    return FileResponse(THU_MUC_GIAO_DIEN / "api.js", media_type="application/javascript")

@app.get("/app.js")
def file_app():
    return FileResponse(THU_MUC_GIAO_DIEN / "app.js", media_type="application/javascript")

# Vẫn giữ đường dẫn /frontend để tiện kiểm tra file tĩnh khi cần.
app.mount("/frontend", StaticFiles(directory=THU_MUC_GIAO_DIEN), name="frontend")

app.include_router(dangnhap.router)
app.include_router(sanpham.router)
app.include_router(khachhang.router)
app.include_router(nguyenlieu.router)
app.include_router(nhacungcap.router)
app.include_router(nhanvien.router)
app.include_router(donhang.router)
app.include_router(nhaphang.router)
app.include_router(baocao.router)

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("chaybackend:app", host="0.0.0.0", port=port, reload=False)
