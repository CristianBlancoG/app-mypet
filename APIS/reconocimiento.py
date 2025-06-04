from PIL import Image
import math
import cv2
import numpy as np
import os

IMAGES_INPUT_DIR = "/var/www/ecofloat/imagenes"
IMAGES_OUTPUT_DIR = "/var/www/ecofloat/imagenes/procesadas"
os.makedirs(IMAGES_OUTPUT_DIR, exist_ok=True)

def escagris(img):
    arr = img.load()
    for x in range(img.size[0]):
        for y in range(img.size[1]):
            arr[x,y] = img.getpixel((x,y))
    return arr

def binarizacion(img, umbral):
    arr = img.load()
    for x in range(img.size[0]):
        for y in range(img.size[1]):
            p = img.getpixel((x,y))
            arr[x,y] = 255 if p > umbral else 0
    return arr

def adelgazamiento(img, mascaraH, mascaraV):
    arr = img.load()
    for x in range(1,img.size[0]-1):
        for y in range(1,img.size[1]-1):
            vecinos = [img.getpixel((x+i, y+j)) for i in [-1,0,1] for j in [-1,0,1]]
            Gx = sum(h*v for h, v in zip(sum(mascaraH, []), vecinos))
            Gy = sum(h*v for h, v in zip(sum(mascaraV, []), vecinos))
            valor = min(255, math.sqrt(Gx*Gx + Gy*Gy))
            arr[x-1,y-1] = int(valor)
    return arr

def poda(img, mascaraH, mascaraV):
    arr = img.load()
    for x in range(1,img.size[0]-1):
        for y in range(1,img.size[1]-1):
            vecinos = [img.getpixel((x+i, y+j)) for i in [-1,0,1] for j in [-1,0,1]]
            Gx = sum(h*v for h, v in zip(sum(mascaraH, []), vecinos))
            Gy = sum(h*v for h, v in zip(sum(mascaraV, []), vecinos))
            valor = min(255, math.sqrt(Gx*Gx + Gy*Gy))
            arr[x-1,y-1] = int(valor)
    return arr

def preprocesar_y_guardar_temp(img_path):
    huella = Image.open(img_path).convert("L")
    escagris(huella)
    escala_path = os.path.join(IMAGES_OUTPUT_DIR, "escalagrisu.tif")
    huella.save(escala_path)

    huella = Image.open(escala_path).convert("L")
    binarizacion(huella, 128)
    bin_path = os.path.join(IMAGES_OUTPUT_DIR, "binarizacion.tif")
    huella.save(bin_path)

    img = Image.open(bin_path).convert("L")
    adelgazamiento(img, [[0,0,0],[0,1,0],[1,1,1]], [[0,0,0],[1,1,0],[0,1,0]])
    adel_path = os.path.join(IMAGES_OUTPUT_DIR, "imgAdelgazada.tif")
    img.save(adel_path)

    img = Image.open(adel_path).convert("L")
    poda(img, [[0,0,0],[0,1,0],[0,0,0]], [[0,0,0],[0,1,0],[0,0,0]])
    poda_path = os.path.join(IMAGES_OUTPUT_DIR, "imgpoda.tif")
    img.save(poda_path)

    return poda_path

def comparar_patrones(img1_path, img2_path, output_folder):
    output_path = os.path.join(output_folder, "orb_matches.png")

    img1 = cv2.imread(img1_path, cv2.IMREAD_GRAYSCALE)
    img2 = cv2.imread(img2_path, cv2.IMREAD_GRAYSCALE)
    if img1 is None or img2 is None:
        raise ValueError("No se pudieron cargar las imágenes para comparar")

    img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
    orb = cv2.ORB_create()
    kp1, des1 = orb.detectAndCompute(img1, None)
    kp2, des2 = orb.detectAndCompute(img2, None)
    if des1 is None or des2 is None:
        raise ValueError("No se detectaron descriptores")

    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = sorted(bf.match(des1, des2), key=lambda x: x.distance)
    good_matches = [m for m in matches if m.distance < 70]

    similitud = len(good_matches) / len(matches) * 100 if matches else 0

    nombre_archivo = "orb_matches.png"
    output_path = os.path.join(output_folder, nombre_archivo)
    img_matches = cv2.drawMatches(img1, kp1, img2, kp2, good_matches, None, flags=2)
    img_matches_rgb = cv2.cvtColor(img_matches, cv2.COLOR_BGR2RGB)
    Image.fromarray(img_matches_rgb).save(output_path)

    # Construir URL pública
    url_publica = f"https://ecofloat.space/imagenes/{nombre_archivo}"
    return similitud, url_publica
