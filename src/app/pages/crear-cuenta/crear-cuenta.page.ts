import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
  

  constructor(private router:Router ) {}

  ngOnInit() {
  }

  //Función para crear cuenta
  crearCuenta(){
    this.router.navigate(['login']);

  }

}
