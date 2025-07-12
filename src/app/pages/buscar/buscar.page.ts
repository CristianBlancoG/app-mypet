import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: false
})
export class BuscarPage {
  archivoSeleccionado: File | null = null;
  imagenURL: string | null = null;
  resultado: number | null = null;
  matchId: string | null = null;
  urls: string[] = [];
  duenio: any = null;
  cargando = false;
  nombreMascota: string | null = null;
  baseApi = 'https://ecofloat.space';

  constructor(private http: HttpClient, private router: Router) {}

  subirYComparar(e: any) {
    this.archivoSeleccionado = e.target.files[0];
    if (this.archivoSeleccionado) {
      this.imagenURL = URL.createObjectURL(this.archivoSeleccionado);
    }
  }

  buscarNariz() {
    if (!this.archivoSeleccionado) return;

    const fd = new FormData();
    fd.append('file', this.archivoSeleccionado);
    this.cargando = true;

    this.http.post<any>(`${this.baseApi}/search_nose`, fd)
      .subscribe(res => {
        this.cargando = false;

        if (res.match === null) {
          alert("No se encontró coincidencia");
          this.nombreMascota = null;
          this.duenio = null;
          return;
        }

        this.resultado = res.score;
        this.matchId = res.match;
        this.urls = res.urls || [];
        this.duenio = res.duenio || null;
        this.nombreMascota = res.nombre_mascota || null;

      }, err => {
        console.error(err);
        alert('Error al buscar coincidencia');
        this.cargando = false;
      });
  }

  irAInicio() {
    this.router.navigate(['/principal']);
  }
}
