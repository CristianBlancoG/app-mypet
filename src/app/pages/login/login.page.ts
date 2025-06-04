import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from 'src/app/services/api/db.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  mdl_rut: string = '';
  mdl_pass: string = '';

  constructor(private router: Router,private api: DbService) { 
  }

  ngOnInit() {
  }

  //Función para navegar a la pantalla Principal
 navegar() {
  this.api.login(this.mdl_rut, this.mdl_pass).subscribe({
    next: (user) => {
      console.log('Usuario autenticado:', user);
      // Guardar en localStorage
      localStorage.setItem('usuario', JSON.stringify(user));
      this.router.navigate(['principal']);
    },
    error: (err) => {
      console.error('Error de login:', err);
      alert('Rut o contraseña incorrectos.');
    }
  });
}


  //Función para navegar a pantalla Crear Cuenta
  navegarCrearCuenta() {
    this.router.navigate(['crear-cuenta']);
  }
}
