# api_nose_search.py

import os
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from starlette.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from PIL import Image

app = FastAPI(title="Dog Nose Search & Register API")

# --- CONFIGURACIÓN ---
BASE_IMAGES_DIR    = "/var/www/ecofloat/imagenes/procesadas"
DESCRIPTORS_DIR    = BASE_IMAGES_DIR
OUTPUT_MATCHES_DIR = "/var/www/ecofloat/imagenes/matches"
STATIC_URL_PREFIX  = "/matches"

ORB_NFEATURES      = 1000
DISTANCE_THRESHOLD = 70

# Asegura directorios
os.makedirs(BASE_IMAGES_DIR, exist_ok=True)
os.makedirs(OUTPUT_MATCHES_DIR, exist_ok=True)

# Sirve los matches
app.mount(STATIC_URL_PREFIX, StaticFiles(directory=OUTPUT_MATCHES_DIR), name="matches")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

# --- PRECARGA EN MEMORIA ---
base_descriptors = {}
for fname in os.listdir(DESCRIPTORS_DIR):
    if not fname.endswith(".descs.npy"):
        continue
    pet_img_name = fname.replace(".descs.npy", "")
    desc_path    = os.path.join(DESCRIPTORS_DIR, fname)
    try:
        base_descriptors[pet_img_name] = np.load(desc_path)
    except:
        pass
print(f"[Startup] {len(base_descriptors)} descriptores cargados.")

# --- ORB y Matcher ÚNICOS ---
orb = cv2.ORB_create(ORB_NFEATURES)
bf  = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

def preprocess_orb_bgr(img_bgr: np.ndarray):
    gray  = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    eq    = cv2.equalizeHist(gray)
    kps, d = orb.detectAndCompute(eq, None)
    return kps, d

def compare_descs(d1: np.ndarray, d2: np.ndarray) -> float:
    if d1 is None or d2 is None:
        return 0.0
    matches = bf.match(d1, d2)
    if not matches:
        return 0.0
    good = [m for m in matches if m.distance < DISTANCE_THRESHOLD]
    return len(good) / len(matches) * 100.0

# --- ENDPOINT: REGISTRO DE UNA NUEVA MASCOTA ---
@app.post("/register_nose")
async def register_nose(
    pet_id: str = Form(...),
    file: UploadFile = File(...)
):
    # 1. Lee la imagen
    data = await file.read()
    npimg = np.frombuffer(data, np.uint8)
    img_bgr = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise HTTPException(400, "Imagen inválida")

    # 2. Guarda la imagen original
    img_fname = f"{pet_id}.jpg"
    img_path  = os.path.join(BASE_IMAGES_DIR, img_fname)
    cv2.imwrite(img_path, img_bgr)

    # 3. Extrae y guarda descriptores ORB
    _, desc = preprocess_orb_bgr(img_bgr)
    if desc is None:
        raise HTTPException(422, "No se detectaron descriptores")
    desc_path = os.path.join(DESCRIPTORS_DIR, f"{pet_id}.descs.npy")
    np.save(desc_path, desc)

    # 4. Actualiza memoria
    base_descriptors[img_fname] = desc

    return {"status": "ok", "pet_id": pet_id}

# --- ENDPOINT: BÚSQUEDA DE COINCIDENCIA ---
@app.post("/search_nose")
async def search_nose(file: UploadFile = File(...)):
    # 1. Carga la imagen de consulta
    data = await file.read()
    npimg = np.frombuffer(data, np.uint8)
    img_q_bgr = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    if img_q_bgr is None:
        raise HTTPException(400, "Imagen inválida")

    # 2. Extrae ORB de consulta
    kp_q, desc_q = preprocess_orb_bgr(img_q_bgr)
    if desc_q is None:
        return JSONResponse({"error": "No se detectaron descriptores"}, status_code=422)

    # 3. Compara contra base en memoria
    best_score = 0.0
    best_name  = None
    best_desc  = None

    for name, desc_base in base_descriptors.items():
        score = compare_descs(desc_q, desc_base)
        if score > best_score:
            best_score = score
            best_name  = name
            best_desc  = desc_base

    if best_name is None:
        return {"match": None, "score": 0.0}

    # 4. Dibuja matches
    base_path = os.path.join(BASE_IMAGES_DIR, best_name)
    base_bgr  = cv2.imread(base_path)
    kp_b, _   = preprocess_orb_bgr(base_bgr)

    matches = bf.match(desc_q, best_desc)
    matches = sorted(matches, key=lambda m: m.distance)
    good    = [m for m in matches if m.distance < DISTANCE_THRESHOLD]

    draw = cv2.drawMatches(img_q_bgr, kp_q, base_bgr, kp_b, good, None, flags=2)
    out_fname = f"match_{best_name}"
    out_path  = os.path.join(OUTPUT_MATCHES_DIR, out_fname)
    cv2.imwrite(out_path, draw)

    return {
        "match":       best_name,
        "score":       round(best_score, 2),
        "match_image": f"{STATIC_URL_PREFIX}/{out_fname}"
    }
