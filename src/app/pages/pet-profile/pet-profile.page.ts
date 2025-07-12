import { Component, OnInit } from '@angular/core';
import { DbService } from 'src/app/services/api/db.service';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';



@Component({
  selector: 'app-pet-profile',
  templateUrl: './pet-profile.page.html',
  styleUrls: ['./pet-profile.page.scss'],
  standalone: false
})
export class PetProfilePage implements OnInit {
  mascota: any;
  isEditing = false;
  originalData: any;
  errorMsg = '';
  fotosNariz: any[] = [];
  rutDuenio: any;


  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private api: DbService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.mascota = navigation?.extras?.state?.['mascota'];
    if (this.mascota) {
      this.originalData = { ...this.mascota };
    }
  }

  ngOnInit() {
    this.cargarFotosNariz(this.mascota.id);

  }

  cargarFotosNariz(mascotaId: number) {
  this.api.obtenerFotosNariz(mascotaId).subscribe({
    next: (res: any) => {
      // Suponiendo que res es un array con {id, mascota_id, url}
      if (Array.isArray(res) && res.length > 0) {
        this.fotosNariz = res.slice(0, 3); // Tomar solo las primeras 3 fotos
      } else {
        this.fotosNariz = [];
      }
    },
    error: err => {
      console.error("Error cargando fotos nariz:", err);
      this.fotosNariz = [];
    }
  });
}

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.mascota = { ...this.originalData };
    }
  }

  async saveChanges() {
    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
    });
    await loading.present();

    try {
      const datosActualizados = this.mascota;
      this.api.updatePet(datosActualizados).subscribe(
        (response: any) => {
          loading.dismiss();
          if (response && response.success) {
            this.originalData = { ...this.mascota };
            this.isEditing = false;
            this.showAlert('Éxito', 'Datos actualizados correctamente');
          } else {
            this.errorMsg = response?.error || 'Error en el servidor al guardar!';
          }
        },
        (error: any) => {
          loading.dismiss();
          this.errorMsg = 'Error de conexión: ' + (error.message || 'Error desconocido');
        }
      );
    } catch (error: any) {
      loading.dismiss();
      this.errorMsg = 'Error al preparar datos: ' + error.message;
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  goBack() {
    const extras: NavigationExtras = { replaceUrl: true };
    localStorage.removeItem('mascota');
    this.router.navigate(['/principal', extras]);
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

slideOpts = {
  initialSlide: 0,
  speed: 400,
  slidesPerView: 1.1,
  spaceBetween: 10,
  breakpoints: {
    640: {
      slidesPerView: 2.2
    },
    992: {
      slidesPerView: 3.2
    }
  }
};


}
