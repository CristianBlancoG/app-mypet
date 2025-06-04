import { Component, OnInit } from '@angular/core';
import { NavigationExtras ,Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { DbService } from 'src/app/services/api/db.service';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  standalone: false,
})
export class AjustesPage implements OnInit {
  usuario: any = null;
  isEditing = false;
  datosOriginales: any;
  nuevaContrasena = '';
  confirmarContrasena = '';

  constructor(
    private router: Router,
    private api: DbService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      this.usuario = JSON.parse(storedUser);
      this.datosOriginales = {...this.usuario};
      
      // Cargar teléfono si existe
      this.cargarTelefono();
    }
  }

 async cargarTelefono() {
  try {
    const response: any = await this.api.obtenerTelefono(this.usuario.rut).toPromise();
    
    // Verificar si la respuesta tiene datos y no es un error
    if (response && !response.error && response.numero) {
      this.usuario.telefono = response.numero;
      this.datosOriginales.telefono = response.numero;
    } else if (response && response.error) {
      console.warn('El teléfono no existe para este usuario:', response.error);
      this.usuario.telefono = '';
      this.datosOriginales.telefono = '';
    } else {
      // Caso donde la respuesta no tiene el formato esperado
      console.warn('Formato de respuesta inesperado:', response);
      this.usuario.telefono = '';
      this.datosOriginales.telefono = '';
    }
  } catch (error: any) {
    console.error('Error al cargar teléfono:', error);
    this.mostrarAlerta('Error', 'No se pudo cargar el número de teléfono');
    this.usuario.telefono = '';
    this.datosOriginales.telefono = '';
  }
}

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.usuario = {...this.datosOriginales};
      this.nuevaContrasena = '';
      this.confirmarContrasena = '';
    }
  }

  cancelarEdicion() {
    this.toggleEdit();
  }

guardarCambios() {
  if (this.nuevaContrasena && this.nuevaContrasena !== this.confirmarContrasena) {
    this.mostrarAlerta('Error', 'Las contraseñas no coinciden');
    return;
  }

  const datosActualizados = {
    rut: this.usuario.rut,
    nombre: this.usuario.nombre,
    apellido: this.usuario.apellido,
    email: this.usuario.email,
    contrasena: this.nuevaContrasena.trim() !== '' ? this.nuevaContrasena : this.usuario.contrasena,
    tipo_persona: 'tutor',
    direccion: this.usuario.direccion
  };

  const tel = {
    rut_persona: this.usuario.rut,
    numero: this.usuario.telefono
  }

  this.api.actualizarUsuario(datosActualizados).subscribe(
    (respuesta: any) => {
      if (respuesta && respuesta.success) {
        this.datosOriginales = { ...this.usuario };
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.api.actualizarTelefono(tel).subscribe
        this.mostrarAlerta('Éxito', 'Datos actualizados correctamente');
        this.isEditing = false;
        this.nuevaContrasena = '';
        this.confirmarContrasena = '';
      } else {
        this.mostrarAlerta('Error', respuesta?.error || 'Error al guardar los cambios');
      }
    },
    (error) => {
      this.mostrarAlerta('Error', 'Error de conexión: ' + (error.message || error.statusText || 'Error desconocido'));
    }
  );
}


  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();

  
  }
    goBack() {
 let extras :NavigationExtras ={
  replaceUrl: true,
        state: { recargar: true }
  
    }

    this.router.navigate(['/principal',extras]);
  }

}