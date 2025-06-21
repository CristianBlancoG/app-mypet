import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from 'src/app/services/api/db.service';
import { validateRut } from '@fdograph/rut-utilities';
import * as bcrypt from 'bcryptjs'; // Para el hash de contraseñas

@Component({
  selector: 'app-crear-cuenta',
  templateUrl: './crear-cuenta.page.html',
  styleUrls: ['./crear-cuenta.page.scss'],
  standalone: false
})
export class CrearCuentaPage {
  // Modelos
  mdl_email: string = '';
  mdl_pass: string = '';
  mdl_name: string = '';
  mdl_lastname: string = '';
  mdl_id: string = '';
  mdl_gen: string = '';
  mdl_dir: string = '';
  mdl_phone: string = '';
  rutVisual: string = '';
  
  // Estados de validación
  rutValido: boolean = false;
  emailValido: boolean = false;
  passValida: boolean = false;
  formValido: boolean = false;
  rutCompleto: boolean = false;

  constructor(private router: Router, private api: DbService) {}

  // Valida y formatea RUT
  formatearRutVisual(event: any) {
    const input = event.target as HTMLInputElement;
    let rut = input.value.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
    
    this.mdl_id = rut;
    
    if (rut === '') {
      this.rutVisual = '';
      this.rutValido = false;
      this.rutCompleto = false;
      return;
    }
    
 // Solo formatear si tiene más de 1 caracter o si estamos borrando
    if (rut.length > 1 || this.rutCompleto) {
        // Separar cuerpo y DV
        let cuerpo = rut.slice(0, -1);
        let dv = rut.slice(-1);
        
        // Formatear visualmente con puntos
        let cuerpoFormateado = '';
        for (let i = 0, j = 1; i < cuerpo.length; i++, j++) {
            cuerpoFormateado = cuerpo[cuerpo.length - 1 - i] + cuerpoFormateado;
            if (j % 3 === 0 && j < cuerpo.length) {
                cuerpoFormateado = '.' + cuerpoFormateado;
            }
        }
        
        // Actualizar valor visual
        this.rutVisual = cuerpoFormateado + '-' + dv;
        
        // Validar solo si tiene el formato completo (con DV)
        if (rut.length > 7) {
            this.rutValido = validateRut(this.rutVisual);
            this.rutCompleto = true;
        } else {
            this.rutValido = false;
            this.rutCompleto = false;
        }
    } else {
        // Mientras se escribe (primer caracter)
        this.rutVisual = rut;
        this.rutValido = false;
        this.rutCompleto = false;
    }
    
    this.validarFormulario();
}

validarRutCompleto() {
    if (this.mdl_id && this.mdl_id.length > 0) {
        this.rutValido = validateRut(this.rutVisual);
        this.rutCompleto = true;
    }
    this.validarFormulario();
}

  // Valida email
  validarEmail() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.emailValido = emailRegex.test(this.mdl_email.trim());
    this.validarFormulario();
  }

  // Valida contraseña
  validarPassword() {
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    this.passValida = passRegex.test(this.mdl_pass);
    this.validarFormulario();
  }

  // Valida todo el formulario
  validarFormulario() {
    // Aplicar trim a todos los campos
    const nombreTrim = this.mdl_name.trim();
    const apellidoTrim = this.mdl_lastname.trim();
    const direccionTrim = this.mdl_dir.trim();
    
    // Validar longitudes máximas (100 caracteres)
    const camposValidos = 
      nombreTrim.length <= 100 && 
      apellidoTrim.length <= 100 && 
      direccionTrim.length <= 100;
    
      this.formValido = 
      this.rutValido &&
      this.emailValido &&
      this.passValida &&
      camposValidos &&
      nombreTrim.length > 0 &&
      apellidoTrim.length > 0 &&
      direccionTrim.length > 0 &&
      !!this.mdl_gen &&
      this.mdl_phone.trim().length > 0;
  }

  // Crea hash de contraseña
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async crearCuenta() {
    if (!this.formValido) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }

    try {
      // Aplicar trim a los campos
      const nombreTrim = this.mdl_name.trim();
      const apellidoTrim = this.mdl_lastname.trim();
      const direccionTrim = this.mdl_dir.trim();
      
      // Crear hash de contraseña
      const hashedPassword = await this.hashPassword(this.mdl_pass);

      const personaData = {
        rut: this.mdl_id,
        nombre: nombreTrim,
        apellido: apellidoTrim,
        email: this.mdl_email.trim(),
        contrasena: hashedPassword,
        tipo_persona: 'tutor',
        direccion: direccionTrim,
        genero: this.mdl_gen
      };

      const tel = {
        rut_persona: this.mdl_id,
        numero: this.mdl_phone.trim()
      };

      this.api.crearCuenta(personaData).subscribe({
        next: (res) => {
          this.api.insertarTelefono(tel).subscribe({
            next: (res) => {
              alert('Cuenta creada exitosamente');
              this.router.navigate(['login']);
            },
            error: (err) => {
              alert('Error al insertar teléfono: ' + err.message);
            }
          });
        },
        error: (err) => {
          alert('Error al crear cuenta: ' + (err.error?.message || err.message));
        }
      });
    } catch (error) {
      alert('Error inesperado: ' + (error as Error).message);
    }
  }
}