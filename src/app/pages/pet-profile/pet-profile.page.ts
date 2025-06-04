import { Component, OnInit } from '@angular/core';
import { DbService } from 'src/app/services/api/db.service';
import { NavigationExtras, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-pet-profile',
  templateUrl: './pet-profile.page.html',
  styleUrls: ['./pet-profile.page.scss'],
  standalone: false,
})

export class PetProfilePage implements OnInit {
mascota: any;
  isEditing = false;
  originalData: any;
  errorMsg = '';
  
  constructor( private router: Router,private alertController: AlertController,private loadingController: LoadingController,private api: DbService) { 
    
   const navigation = this.router.getCurrentNavigation();
    this.mascota = navigation?.extras?.state?.['mascota'];
    if (this.mascota) {
      this.originalData = {...this.mascota};
    }
  }

  ngOnInit() {
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.mascota = {...this.originalData};
    }
  }

  async saveChanges() {
  const loading = await this.loadingController.create({
    message: 'Guardando cambios...',
  });
  await loading.present();

  try {
    // Asegurémonos de convertir los tipos de datos correctamente
    const datosActualizados = this.mascota;



    this.api.updatePet(datosActualizados).subscribe(
      (response: any) => {
        loading.dismiss();
        if (response && response.success) {
          this.originalData = {...this.mascota};
          this.isEditing = false;
          this.showAlert('Éxito', 'Datos actualizados correctamente');
        } else {
          this.errorMsg = response?.error || 'Error en el servidor al guardar!';
          console.error('Error del servidor:', response);
        }
      },
      (error) => {
        loading.dismiss();
        this.errorMsg = 'Error de conexión: ' + (error.message || error.statusText || 'Error desconocido');
        console.error('Error HTTP:', error);
      }
    );
  } catch (error:any) {
    loading.dismiss();
    this.errorMsg = 'Error al preparar datos: ' + error.message;
    console.error('Error local:', error);
  }
}

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  changeImage() {
    // Implementar lógica para cambiar imagen
    console.log('Cambiar imagen');
  }

  cerrarSesion() {
    // Lógica para cerrar sesión
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
 
  goBack() {
 let extras :NavigationExtras ={
  replaceUrl: true
  
    }
    localStorage.removeItem('mascota');
    this.router.navigate(['/principal',extras]);
  }

}
