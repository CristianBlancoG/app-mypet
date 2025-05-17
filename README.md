# MyPet 🐾

**MyPet** es una aplicación móvil desarrollada con Ionic y Angular que permite registrar y gestionar información de mascotas. Ideal para dueños de mascotas, veterinarias o refugios.

## 🚀 Características

- Registro de mascotas (pendiente)
- Cámara para scannear trufa de perros (pendiente)
- Base de datos local con SQLite (para el local storage)
- Pronta conexión a servicios en la nube (APIs)

## 🛠 Tecnologías

- Ionic 8
- Angular 19
- Node.js 22
- SQLite (cordova-sqlite-storage)

##🛠 Requisitos previos

- Tener Ionic, Angular y Capacitor instalados
- Tener Android Studio y SDKs configurados
- Haber hecho: npm install en el proyecto

## 📦 Instalación

```bash
npm install 
ionic build    #Genera archivos en carpeta /www, la cual usará el Capacitor para la app nativa
ionic cap sync    #Asegura que los plugins y configuraciones esté sincronizados con la plataforma android
ionic cap open android    #abrirá la carpeta android/ como proyecto nativo en android studio

📱 Ejecución
ionic serve        # Para navegador
ionic cap run android  # Para dispositivo/emulador Android

