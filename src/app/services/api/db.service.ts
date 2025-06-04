import { Injectable } from '@angular/core';
import { HttpClient , HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  mascota_api: string = 'https://ecofloat.space/mascota.php';
  persona_api: string = 'https://ecofloat.space/persona.php';
  vacunas_api: string = 'https://ecofloat.space/historial_vacunacion.php';
  telefono_api: string = 'https://ecofloat.space/telefono.php'

  constructor(private http: HttpClient) { }

  mascotaListar(rut: string) {
    const params = new HttpParams()
      .set('rut', rut);

    return this.http.get(this.mascota_api, {params});
    
  }

  crearCuenta(data: any) {
    return this.http.post(this.persona_api,data);
  }

   login(rut: string, contrasena: string) {
    const params = new HttpParams()
      .set('rut', rut)
      .set('contrasena', contrasena);

    return this.http.get(this.persona_api, { params });
  }

  updatePet(data: any) {
  return this.http.post(this.mascota_api, data);
}

obtenerHistorialVacunas(mascotaId: string) {
 const params = new HttpParams()
      .set('mascota_id', mascotaId);

    return this.http.get(this.vacunas_api, { params });
}

agregarVacuna(data: any) {
  return this.http.post(this.vacunas_api, data);
}

obtenerTelefono(rut: string){
  const params = new HttpParams()
      .set('rut', rut)

    return this.http.get(this.telefono_api, { params });
}

insertarTelefono(data: any){
  return this.http.post(this.telefono_api, data);
}

actualizarUsuario(data: any){
  data.accion = 'actualizar';
   return this.http.post(this.persona_api, data);
}

actualizarTelefono(data: any){
  data.accion = 'actualizar';
   return this.http.post(this.telefono_api, data);
}

}
