import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  mdl_email: string = '';
  mdl_pass: string = '';

  constructor(private router: Router) { 
  }

  ngOnInit() {
  }

  //Función para navegar a la pantalla Principal
  navegar() {
    this.router.navigate(['principal']);
  }

  //Función para navegar a pantalla Crear Cuenta
  navegarCrearCuenta() {
    this.router.navigate(['crear-cuenta']);
  }
}
