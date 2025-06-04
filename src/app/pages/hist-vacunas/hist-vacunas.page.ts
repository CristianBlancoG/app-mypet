import { Component, OnInit } from '@angular/core';
import { DbService } from 'src/app/services/api/db.service';
import { ActivatedRoute,NavigationExtras, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-hist-vacunas',
  templateUrl: './hist-vacunas.page.html',
  styleUrls: ['./hist-vacunas.page.scss'],
  standalone: false,
})
export class HistVacunasPage implements OnInit {
mascota: any;
historial: any = [];

  mdl_tipo: string = '';
  mdl_aplicacion: string = '';
  mdl_renovacion: string = '';

  mascotaId: string = '';
  isEditing = false;
  errorMsg: any;
  loadingController: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private api: DbService,
    private alertController: AlertController) { 
  const navigation = this.router.getCurrentNavigation();
    this.mascota = navigation?.extras?.state?.['mascota'];

  }



  ngOnInit() {
    this.mascotaId = this.mascota.id;
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.api.obtenerHistorialVacunas(this.mascotaId).subscribe({
      next: (data) => this.historial = data,
      error: (err) => console.error('Error al cargar historial:', err),
    });
  }

agregarVacuna() {


  try {
    const nuevaVacuna = {
      mascota_id: this.mascota.id,
      tipo_vacuna: this.mdl_tipo,
      fecha_aplicacion: this.mdl_aplicacion,
      fecha_renovacion: this.mdl_renovacion || null,
    };
    this.api.agregarVacuna(nuevaVacuna).subscribe(
      (response: any) => {
        if (response && response.success) {
          this.showAlert('Éxito', 'Vacuna agregada correctamente');
          this.cargarHistorial();
          this.resetForm();
          this.isEditing = false;
        } else {
          this.errorMsg = response?.error || 'Error en el servidor al guardar vacuna';
        }
      },
      (error) => {
        this.errorMsg = 'Error de conexión: ' + (error.message || error.statusText || 'Error desconocido');
      }
    );
  } catch (error: any) {
    this.errorMsg = 'Error local al agregar vacuna: ' + error.message;
    console.error('Error local:', error);
  }
}


  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

    resetForm() {
    this.mdl_tipo = '';
    this.mdl_aplicacion = '';
    this.mdl_renovacion = '';
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }



}
