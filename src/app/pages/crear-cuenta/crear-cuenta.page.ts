import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from 'src/app/services/api/db.service';

@Component({
  selector: 'app-crear-cuenta',
  templateUrl: './crear-cuenta.page.html',
  styleUrls: ['./crear-cuenta.page.scss'],
  standalone: false,
})
export class CrearCuentaPage implements OnInit {

  mdl_email: string ='';
  mdl_pass: string ='';
  mdl_name: string ='';
  mdl_lastname: string ='';
  mdl_id: string ='';
  mdl_gen: string ='';
  mdl_dir: string ='';
  mdl_phone: string = '';  

  constructor(private router:Router,private api: DbService ) {}

  ngOnInit() {
  }

  crearCuenta() {
      const personaData = {
        rut: this.mdl_id,
        nombre: this.mdl_name,
        apellido: this.mdl_lastname,
        email: this.mdl_email,
        contrasena: this.mdl_pass,
        tipo_persona: 'tutor', 
        direccion: this.mdl_dir
      };

      const tel = {
        rut_persona: this.mdl_id,
        numero: this.mdl_phone
      }

      this.api.crearCuenta(personaData).subscribe({
        next: (res) => {
          this.api.insertarTelefono(tel).subscribe({
            next: (res) => {
              alert('Cuenta creada exitosamente');
              this.router.navigate(['login']);
            },
            error: (err) => {
              alert('Error al insertar teléfono');
            }
          });
        },
        error: (err) => {
          alert('Error al crear cuenta' + JSON.stringify(err));
        }
      });

      

    
    }

}
