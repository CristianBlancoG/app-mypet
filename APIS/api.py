import os
import cv2
import numpy as np
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import json

# ── Config ─────────────────────────────────
BASE = "/var/www/ecofloat/imagenes/procesadas"
PHP_MASCOTA = "https://ecofloat.space/mascota.php"
PHP_FOTONARIZ = "https://ecofloat.space/foto_nariz.php"
MONGO_URI = "mongodb://petuser:787107847zZ@localhost:27017/petdb?authSource=petdb"
DB_NAME = "petdb"
COLLECTION = "fotonariz"
ORB_NFEAT = 2000
RATIO_TEST_THRESHOLD = 0.75
MIN_DESCRIPTORS = 30
RECHAZO_UMBRAL_SCORE = 0.1

app = Flask(__name__)
CORS(app)

mongo = MongoClient(MONGO_URI)[DB_NAME][COLLECTION]
orb = cv2.ORB_create(ORB_NFEAT)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

def preprocess(img_gray):
    cl = clahe.apply(img_gray)
    invGamma = 1.0 / 0.5
    table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(256)]).astype("uint8")
    return cv2.LUT(cl, table)

@app.route("/register_pet", methods=["POST"])
def register_pet():
    form = request.form.to_dict()
    files = request.files
    pet_id = form.get("id")
    if not pet_id:
        return jsonify({"error": "Falta el ID"}), 400

    folder = os.path.join(BASE, pet_id)
    os.makedirs(folder, exist_ok=True)

    if "file_profile" in files:
        files["file_profile"].save(os.path.join(folder, "profile.jpg"))
        url = f"https://ecofloat.space/imagenes/procesadas/{pet_id}/profile.jpg"
        requests.post(PHP_MASCOTA, json={"id": pet_id, "foto_mascota_url": url}, timeout=5)

    urls = []
    for i in (1, 2, 3):
        key = f"file{i}"
        if key in files:
            dest = os.path.join(folder, f"{i}.jpg")
            files[key].save(dest)
            public_url = f"https://ecofloat.space/imagenes/procesadas/{pet_id}/{i}.jpg"
            urls.append(public_url)
            requests.post(PHP_FOTONARIZ, json={"mascota_id": pet_id, "url": public_url}, timeout=5)

    if urls:
        mongo.update_one({"pet_id": pet_id}, {"$set": {"urls": urls}}, upsert=True)

    return jsonify({"status": "ok", "pet_id": pet_id, "urls": urls})

@app.route("/search_nose", methods=["POST"])
def search_nose():
    debug_info = {}
    if "file" not in request.files:
        return jsonify({"match": None, "score": 0, "urls": []}), 400

    tmp = os.path.join(BASE, "q.jpg")
    request.files["file"].save(tmp)
    img_q = cv2.imread(tmp, cv2.IMREAD_GRAYSCALE)
    img_q = preprocess(img_q)
    kp_q, desc_q = orb.detectAndCompute(img_q, None)
    if desc_q is None or len(kp_q) < MIN_DESCRIPTORS:
        return jsonify({"match": None, "score": 0, "urls": []})

    best_score = 0
    best_pet = None

    for doc in mongo.find({}, {"pet_id": 1, "urls": 1}):
        pet_id = doc["pet_id"]
        urls = doc.get("urls", [])
        total_good_matches = 0
        distances = []

        for i, url in enumerate(urls, start=1):
            path = os.path.join(BASE, pet_id, f"{i}.jpg")
            if not os.path.exists(path):
                continue
            img_db = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
            img_db = preprocess(img_db)
            kp_db, desc_db = orb.detectAndCompute(img_db, None)
            if desc_db is None or len(kp_db) < MIN_DESCRIPTORS:
                continue

            matches = bf.knnMatch(desc_q, desc_db, k=2)
            good_matches = [m for m, n in matches if m.distance < RATIO_TEST_THRESHOLD * n.distance]
            total_good_matches += len(good_matches)
            distances.extend([m.distance for m in good_matches])

        if total_good_matches == 0:
            continue

        min_kp = min(len(kp_q), len(kp_db))
        score = total_good_matches / min_kp if min_kp > 0 else 0

        if distances:
            mean_dist = np.mean(distances)
            dist_penalty = np.exp(-mean_dist / 50)
            score *= dist_penalty

        if score > best_score:
            best_score = score
            best_pet = pet_id

    if best_score < RECHAZO_UMBRAL_SCORE:
        return jsonify({"match": None, "score": round(best_score * 100, 2), "urls": []})

    # Recuperar nombre y dueño
    nombre_mascota = best_pet
    duenio = None
    try:
        r_mascota = requests.get(PHP_MASCOTA, params={"id": int(best_pet)}, timeout=5)
        mascota_raw = r_mascota.content.decode("utf-8-sig").strip()
        debug_info["mascota_url"] = r_mascota.url
        debug_info["mascota_status_code"] = r_mascota.status_code
        debug_info["mascota_raw"] = mascota_raw[:500]

        if not mascota_raw or not mascota_raw.startswith(('[', '{')):
            raise ValueError("La respuesta JSON está vacía o mal formada")

        mascota_list = json.loads(mascota_raw)
        debug_info["mascota_type"] = str(type(mascota_list))

        if isinstance(mascota_list, list) and len(mascota_list) > 0:
            mascota_data = mascota_list[0]
        elif isinstance(mascota_list, dict):
            mascota_data = mascota_list
        else:
            raise ValueError("La estructura JSON no es ni lista ni dict")

        nombre_mascota = mascota_data.get("nombre", best_pet)
        rut = mascota_data.get("rut_duenio")

    except Exception as e:
        debug_info["json_error"] = str(e)
        rut = None

    try:
        if rut:
            r_persona = requests.get("https://ecofloat.space/persona.php", params={"rut": rut}, timeout=5)
            persona = r_persona.json()
            debug_info["persona_raw"] = persona

            r_tel = requests.get("https://ecofloat.space/telefono.php", params={"rut": rut}, timeout=5)
            telefono = r_tel.json().get("numero", "No disponible")

            duenio = {
                "email": persona.get("email", "No disponible"),
                "nombre": f"{persona.get('nombre', '')} {persona.get('apellido', '')}".strip(),
                "telefono": telefono
            }

    except Exception as e:
        debug_info["duenio_error"] = str(e)

    urls = mongo.find_one({"pet_id": best_pet})["urls"]

    return jsonify({
        "match": best_pet,
        "score": round(best_score * 100, 2),
        "urls": urls,
        "duenio": duenio,
        "nombre_mascota": nombre_mascota,
        "debug": debug_info
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
