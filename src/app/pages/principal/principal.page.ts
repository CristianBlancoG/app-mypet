import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  standalone: false,
})
export class PrincipalPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }


  //Función para acceder a perfil completo de Mascota
  perfilMascota(){
    this.router.navigate(['pet-profile']);
  }

  //Función para acceder a Historial de Vacunas
  histVacuna(){
    this.router.navigate(['hist-vacunas']);
  }
}
