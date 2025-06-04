import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DbService } from 'src/app/services/api/db.service';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
    standalone: true,
  imports: [
    CommonModule,
    IonicModule,
  ]
})
export class PrincipalPage {
  mascotas: any[] = [];
  errorMsg: string = '';
  usuario: any = null;


  constructor(private router: Router,private api: DbService) {}

  ionViewWillEnter() {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      this.usuario = JSON.parse(storedUser);
      this.cargarMascotas(this.usuario.rut);
    }

  const nav = this.router.getCurrentNavigation();
  const state = nav?.extras?.state;

  if (this.usuario?.rut && (state?.['recargar'] || true)) {
    this.cargarMascotas(this.usuario.rut);
  }
  }

  cargarMascotas(rut:string) {
    this.api.mascotaListar(rut).subscribe({
      next: (data: any) => {
        this.mascotas = data;
        if (!data || data.length === 0) {
          this.errorMsg = 'No se encontraron mascotas.';
        }
      },
      error: (err) => {
        this.errorMsg = 'Error al obtener mascotas: ' + JSON.stringify(err);
      },
    });
  }

  perfilMascota(mascota: any) {
    let extras :NavigationExtras ={
    state: {
      mascota: mascota
    }
  }
    this.router.navigate(['pet-profile'],extras);
  }

  histVacuna(mascota: any) {
   let extras :NavigationExtras ={
    state: {
      mascota: mascota
    }
  }
    this.router.navigate(['hist-vacunas'],extras);
    }

  cerrarSesion() {

    let extras :NavigationExtras ={
  replaceUrl: true
    }
  localStorage.removeItem('usuario');
  this.router.navigate(['login'],extras);
}

ajustes() {

  this.router.navigate(['ajustes']);
}

anadir() {

   let extras :NavigationExtras ={
  replaceUrl: true
    }

  this.router.navigate(['anadir',extras]);
}

analizar() {
 let extras :NavigationExtras ={
  replaceUrl: true
    }
  this.router.navigate(['buscar']),extras;
}

}
