from pathlib import Path
import sys

ROOT = str(Path(__file__).resolve().parent.parent)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
    
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

try:
    from .middleware_case import CaseMiddleware
except Exception:
    from backend.middleware_case import CaseMiddleware

try:
    from .SQL.cosodulieu import khoi_tao_csdl
    # Prefer new route package if available, otherwise fall back to top-level modules
    try:
        from .routes import dangnhap
        from .routes import sanpham
        from .routes import khachhang
        from .routes import nguyenlieu
        from .routes import nhacungcap
        from .routes import nhanvien
        from .routes import donhang
        from .routes import nhaphang
        from .routes import baocao
    except Exception:
        from .routes import dangnhap
        from .routes import sanpham
        from .routes import khachhang
        from .routes import nguyenlieu
        from .routes import nhacungcap
        from .routes import nhanvien
        from .routes import donhang
        from .routes import nhaphang
        from .routes import baocao
except ImportError:
    import sys

    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from backend.SQL.cosodulieu import khoi_tao_csdl
    try:
        from backend.routes import dangnhap
        from backend.routes import sanpham
        from backend.routes import khachhang
        from backend.routes import nguyenlieu
        from backend.routes import nhacungcap
        from backend.routes import nhanvien
        from backend.routes import donhang
        from backend.routes import nhaphang
        from backend.routes import baocao
    except Exception:
        from backend.routes import dangnhap
        from backend.routes import sanpham
        from backend.routes import khachhang
        from backend.routes import nguyenlieu
        from backend.routes import nhacungcap
        from backend.routes import nhanvien
        from backend.routes import donhang
        from backend.routes import nhaphang
        from backend.routes import baocao

THU_MUC_GOC = Path(__file__).resolve().parent.parent
frontend_root = THU_MUC_GOC / "frontend"
if (frontend_root / "index.html").exists():
    THU_MUC_GIAO_DIEN = frontend_root
else:
    candidate_frontend_src = frontend_root / "src"
    if candidate_frontend_src.exists():
        THU_MUC_GIAO_DIEN = candidate_frontend_src
    else:
        THU_MUC_GIAO_DIEN = frontend_root

app = FastAPI(title="Drink shop management backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:8000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(CaseMiddleware)


@app.on_event("startup")
def khi_khoi_dong():
    khoi_tao_csdl()


@app.get("/")
def trang_chu():
    return FileResponse(THU_MUC_GIAO_DIEN / "index.html")


@app.get("/login")
def trang_dang_nhap():
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

@app.get("/frontend/{path:path}")
async def frontend_static(path: str):
    p_root = THU_MUC_GIAO_DIEN / path
    # If THU_MUC_GIAO_DIEN is frontend root, also check frontend/src
    p_src = (THU_MUC_GOC / "frontend" / "src" / path)
    if p_root.exists():
        return FileResponse(p_root)
    if p_src.exists():
        return FileResponse(p_src)
    return FileResponse(THU_MUC_GIAO_DIEN / path)

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
    uvicorn.run(app, host="127.0.0.1", port=port, reload=False)
