import { Component, OnInit, ViewChild  } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DbService } from 'src/app/services/api/db.service';
import { NavigationExtras, Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { AlertController, LoadingController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


@Component({
  selector: 'app-anadir',
  templateUrl: './anadir.page.html',
  styleUrls: ['./anadir.page.scss'],
  standalone: false
})
export class AnadirPage implements OnInit{
  mdl_nombre = '';
  mdl_raza = '';
  mdl_peso = '';
  mdl_color = '';
  mdl_pelaje = '';
  mdl_edad: number | null = null;
  mdl_fnac = '';
 fechaNacimientoFormateada: string = '';
  mdl_muerta = 0;
  imagenURL = '';

  rut_duenio: string= ''; 

  usuario: any = null;
  loadingController: any;

@ViewChild('modalFecha', { static: false }) modalFecha!: IonModal;
  constructor(private api: DbService, private router: Router, private alertController: AlertController) {}
  ngOnInit() {
    const storedUser = localStorage.getItem('usuario');
  if (storedUser) {
    this.usuario = JSON.parse(storedUser);
    this.rut_duenio = this.usuario.rut;
  }throw new Error('Method not implemented.');
  }

 subirImagen(event: any) {
  const archivo = event.target.files[0];
  const formData = new FormData();
  formData.append('archivo', archivo);

  fetch('https://ecofloat.space/subida.php', {
    method: 'POST',
    body: formData
  })
  .then(async res => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error del servidor (${res.status}): ${text}`);
    }
    return res.json();
  })
  .then(data => {
    this.imagenURL = 'https://ecofloat.space/imagenes/' + data.nombreArchivo;
  })
  .catch(err => {
    this.showAlert('Error al subir la imagen', err.message || 'Error desconocido');
  });
}


  guardarMascota() {
  const datos = {
    rut_duenio: this.rut_duenio,
    nombre: this.mdl_nombre,
    raza: this.mdl_raza,
    peso: this.mdl_peso,
    color: this.mdl_color,
    tipo_pelaje: this.mdl_pelaje,
    edad: this.mdl_edad,
    fecha_nacimiento: this.mdl_fnac,
    esta_muerta: this.mdl_muerta ? 1 : 0,
    foto_mascota_url: this.imagenURL
  };

  this.api.updatePet(datos).subscribe({
    next: () => {
      const extras: NavigationExtras = {
        replaceUrl: true,
        state: { recargar: true } // <- señal para que /home recargue
      };
this.router.navigate(['/principal'], extras);

    },
    error: () => {
      alert('Error al guardar mascota');
    }
  });
  }

  onFechaSeleccionada(event: any) {
    const fechaISO = event.detail.value; // formato: 2025-05-29
    this.mdl_fnac = fechaISO;

    // Formatear a DD/MM/AAAA
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    this.fechaNacimientoFormateada = `${dia}/${mes}/${anio}`;

    // Cerrar modal
    this.modalFecha?.dismiss();
  }

  abrirCalendario() {
    this.modalFecha?.present();
  }

  async showAlert(titulo: string, mensaje: string) {
  const alert = await this.alertController.create({
    header: titulo,
    message: mensaje,
    buttons: ['OK']
  });
  await alert.present();
}

async seleccionarImagenes() {
  try {
    const image = await Camera.pickImages({
      quality: 80,
      limit: 5
    });

    if (image && image.photos.length > 0) {
      for (const photo of image.photos) {
        const base64 = await this.readAsBase64(photo.webPath!);
        await this.subirFotoNariz(base64);
      }
      this.showAlert('Éxito', 'Fotos subidas correctamente');
    }
  } catch (error) {
    console.error('Error al seleccionar imágenes', error);
  }
}

// Convertir a base64
async readAsBase64(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();
  return await this.convertBlobToBase64(blob) as string;
}

convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

async subirFotoNariz(base64: string) {
  const nombre = `foto_${Date.now()}.jpg`;

  const formData = new FormData();
  formData.append('archivo', base64);
  formData.append('nombre', nombre);

  const response = await fetch('https://ecofloat.space/subida_base64.php', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  const urlFinal = 'https://ecofloat.space/imagenes/' + result.nombreArchivo;

  // Guardar en tabla FotoNariz



}

}



