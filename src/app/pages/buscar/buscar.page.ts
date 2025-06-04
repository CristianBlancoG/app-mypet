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
  resultado: number | null = null;
  imagenComparativa: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  subirYComparar(event: any) {
    this.archivoSeleccionado = event.target.files[0];
    this.mostrarAlerta('Imagen seleccionada', `Nombre: ${this.archivoSeleccionado?.name}`);
  }

  enviarImagen() {
    if (!this.archivoSeleccionado) {
      this.mostrarAlerta('Error', 'No se ha seleccionado una imagen.');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);

    this.http.post<any>('http://178.156.132.72:5000/comparar', formData)
      .subscribe({
        next: (res) => {
          if (res && res.similitud && res.imagen_resultado) {
            this.resultado = res.similitud;
            this.imagenComparativa = res.imagen_resultado;
            this.mostrarAlerta('Comparación exitosa', `Similitud: ${res.similitud}%`);
          } else {
            this.mostrarAlerta('Respuesta inválida del servidor', JSON.stringify(res));
          }
        },
        error: (err) => {
          console.error('Error al comparar imagen', err);
          let mensaje = 'No se pudo comparar la imagen. Intenta de nuevo.';

          if (err.error && typeof err.error === 'string') {
            mensaje += '\n\nDetalle: ' + err.error;
          } else if (err.error && err.error.error) {
            mensaje += '\n\nDetalle: ' + err.error.error;
          } else if (err.message) {
            mensaje += '\n\nMensaje: ' + err.message;
          }

          this.mostrarAlerta('Error al subir la imagen', mensaje);
        }
      });
  }

  mostrarAlerta(titulo: string, mensaje: string) {
    alert(`${titulo}\n\n${mensaje}`);
  }
}
