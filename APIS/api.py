from flask import Flask, request, jsonify
import os
from reconocimiento import preprocesar_y_guardar_temp, comparar_patrones
import traceback
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = '/var/www/ecofloat/imagenes'
REF_IMG = '/var/www/ecofloat/imagenes/nariz_perro_referencia-1.tif'


os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/comparar', methods=['POST'])
def comparar():
    if 'archivo' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400

    archivo = request.files['archivo']
    ruta_guardada = os.path.join(UPLOAD_FOLDER, archivo.filename)
    archivo.save(ruta_guardada)


    try:
        img_pre = preprocesar_y_guardar_temp(ruta_guardada)
        similitud, img_final = comparar_patrones(img_pre, REF_IMG, UPLOAD_FOLDER)

        return jsonify({
            'similitud': round(similitud, 2),
            'imagen_resultado': img_final
        })
    except Exception as e:
        traceback_str = traceback.format_exc()  
        print(traceback_str) 
        return jsonify({'error': str(e), 'traceback': traceback_str}), 500 


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
