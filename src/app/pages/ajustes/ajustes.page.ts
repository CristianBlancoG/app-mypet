import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { DbService } from 'src/app/services/api/db.service';
import { validateRut } from '@fdograph/rut-utilities';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  standalone: false
})
export class AjustesPage implements OnInit {
  usuario: any = null;
  isEditing = false;
  datosOriginales: any;
  nuevaContrasena = '';
  confirmarContrasena = '';
  formValido = false;
  emailValido = true;
  passValida = true;

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
      this.cargarTelefono();
      this.validarFormulario();
    }
  }

  async cargarTelefono() {
    try {
      const response: any = await this.api.obtenerTelefono(this.usuario.rut).toPromise();
      if (response && !response.error && response.numero) {
        this.usuario.telefono = response.numero;
        this.datosOriginales.telefono = response.numero;
      } else {
        this.usuario.telefono = '';
        this.datosOriginales.telefono = '';
      }
    } catch (error) {
      console.error('Error al cargar teléfono:', error);
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
    this.validarFormulario();
  }

  cancelarEdicion() {
    this.toggleEdit();
  }

  // Validaciones
  validarEmail() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.emailValido = emailRegex.test(this.usuario.email?.trim() || '');
    this.validarFormulario();
  }

  validarPassword() {
    if (this.nuevaContrasena) {
      const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      this.passValida = passRegex.test(this.nuevaContrasena) && 
                       this.nuevaContrasena === this.confirmarContrasena;
    } else {
      this.passValida = true; // No hay cambio de contraseña
    }
    this.validarFormulario();
  }

  validarFormulario() {
    if (!this.isEditing) {
      this.formValido = false;
      return;
    }

    const camposValidos = 
      (this.usuario.nombre?.trim()?.length || 0) <= 100 && 
      (this.usuario.apellido?.trim()?.length || 0) <= 100 && 
      (this.usuario.direccion?.trim()?.length || 0) <= 100;

    this.formValido = 
      this.emailValido &&
      this.passValida &&
      camposValidos &&
      this.usuario.nombre?.trim() &&
      this.usuario.apellido?.trim() &&
      this.usuario.email?.trim() &&
      this.usuario.direccion?.trim();
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async guardarCambios() {
    if (!this.formValido) {
      this.mostrarAlerta('Error', 'Por favor complete todos los campos correctamente');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
    });
    await loading.present();

    try {
      // Aplicar trim a los campos
      const datosActualizados = {
        rut: this.usuario.rut,
        nombre: this.usuario.nombre.trim(),
        apellido: this.usuario.apellido.trim(),
        email: this.usuario.email.trim(),
        contrasena: this.nuevaContrasena 
          ? await this.hashPassword(this.nuevaContrasena)
          : this.usuario.contrasena,
        tipo_persona: 'tutor',
        direccion: this.usuario.direccion.trim()
      };

      const tel = {
        rut_persona: this.usuario.rut,
        numero: this.usuario.telefono?.trim() || ''
      };

      this.api.actualizarUsuario(datosActualizados).subscribe(
        async (respuesta: any) => {
          if (respuesta?.success) {
            await this.api.actualizarTelefono(tel).toPromise();
            this.datosOriginales = { ...this.usuario };
            localStorage.setItem('usuario', JSON.stringify(this.usuario));
            this.mostrarAlerta('Éxito', 'Datos actualizados correctamente');
            this.isEditing = false;
            this.nuevaContrasena = '';
            this.confirmarContrasena = '';
          } else {
            this.mostrarAlerta('Error', respuesta?.error || 'Error al guardar los cambios');
          }
        },
        (error) => {
          this.mostrarAlerta('Error', 'Error de conexión: ' + (error.message || error.statusText));
        }
      );
    } catch (error) {
      this.mostrarAlerta('Error', 'Error inesperado al procesar los cambios');
    } finally {
      loading.dismiss();
    }
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
    let extras: NavigationExtras = {
      replaceUrl: true,
      state: { recargar: true }
    };
    this.router.navigate(['/principal'], extras);
  }
}