import { Component, OnInit, ViewChild } from '@angular/core';
import { DbService } from 'src/app/services/api/db.service';
import { NavigationExtras, Router } from '@angular/router';
import { IonModal, AlertController } from '@ionic/angular';
import { Camera } from '@capacitor/camera';

@Component({
  selector: 'app-anadir',
  templateUrl: './anadir.page.html',
  styleUrls: ['./anadir.page.scss'],
  standalone: false
})
export class AnadirPage implements OnInit {
  // Campos de la mascota
  mdl_nombre = '';
  mdl_raza = '';
  mdl_peso = '';
  mdl_color = '';
  mdl_pelaje = '';
  mdl_edad: number | null = null;
  mdl_fnac = '';
  fechaNacimientoFormateada = '';
  mdl_muerta = 0;
imagenURLProfile: string | null = null;
imagenURL1: string | null = null;
imagenURL2: string | null = null;
imagenURL3: string | null = null;


  // Para foto de perfil y nariz
  fileProfile: File | null = null;
  file1: File | null = null;
  file2: File | null = null;
  file3: File | null = null;

  rut_duenio = '';
  usuario: any = null;

  @ViewChild('modalFecha', { static: false }) modalFecha!: IonModal;

  constructor(
    private api: DbService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      this.usuario = JSON.parse(stored);
      this.rut_duenio = this.usuario.rut;
    }
  }

// Para la foto de perfil
onSelectProfile(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.fileProfile = file;
    if (this.imagenURLProfile) {
      URL.revokeObjectURL(this.imagenURLProfile);
    }
    this.imagenURLProfile = URL.createObjectURL(file);
  }
}

onSelectNose(event: any, index: number) {
  const file = event.target.files[0];
  if (file) {
    (this as any)[`file${index}`] = file;
    const oldUrl = (this as any)[`imagenURL${index}`];
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }
    (this as any)[`imagenURL${index}`] = URL.createObjectURL(file);
  }
}

  abrirCalendario() {
    this.modalFecha?.present();
  }

  onFechaSeleccionada(event: any) {
    const iso = event.detail.value;
    this.mdl_fnac = iso;
    const d = new Date(iso);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    this.fechaNacimientoFormateada = `${dia}/${mes}/${d.getFullYear()}`;
    this.modalFecha?.dismiss();
  }

  async showAlert(t: string, m: string) {
    const a = await this.alertController.create({ header: t, message: m, buttons: ['OK'] });
    await a.present();
  }

async guardarMascota() {
  if (!this.fileProfile) {
    return this.showAlert('Error', 'Debes seleccionar una foto de perfil');
  }

  const mascota = {
    rut_duenio: this.rut_duenio,
    nombre: this.mdl_nombre,
    raza: this.mdl_raza,
    peso: this.mdl_peso,
    color: this.mdl_color,
    tipo_pelaje: this.mdl_pelaje,
    edad: this.mdl_edad?.toString() || '',
    fecha_nacimiento: this.mdl_fnac,
    esta_muerta: this.mdl_muerta ? '1' : '0',
    foto_mascota_url: "https://ecofloat.space/imagenes/default.jpg" // temporal
  };

  try {
    // 1. Crear mascota en PHP
    const r1 = await fetch('https://ecofloat.space/mascota.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mascota)
    });
    const j1 = await r1.json();
    if (!r1.ok || !j1.id) {
      return this.showAlert('Error', j1.error || 'Error al crear mascota');
    }

    const petId = j1.id;

    // 2. Subir fotos con API Python
    const fd = new FormData();
    fd.append('id', petId.toString());
    if (this.fileProfile) fd.append('file_profile', this.fileProfile);
    if (this.file1) fd.append('file1', this.file1);
    if (this.file2) fd.append('file2', this.file2);
    if (this.file3) fd.append('file3', this.file3);

    const r2 = await fetch('https://ecofloat.space/register_pet', {
      method: 'POST',
      body: fd
    });
    const j2 = await r2.json();
    if (!r2.ok) {
      return this.showAlert('Error', j2.error || 'Error al subir fotos');
    }

    this.router.navigate(['/principal'], { replaceUrl: true, state: { recargar: true } });
  } catch (err) {
    console.error(err);
    this.showAlert('Error', 'Fallo la conexión: ' + (err as any).message || 'desconocido');
  }
}


  private async subirFotosNariz(petId: number) {
    const fd = new FormData();
    fd.append('pet_id', petId.toString());
    [this.file1, this.file2, this.file3].forEach((f, i) => {
      if (f) fd.append(`file${i+1}`, f);
    });

    const r = await fetch('https://ecofloat.space/register_nose', {
      method: 'POST',
      body: fd
    });
    const j = await r.json();
    if (!r.ok) {
      this.showAlert('Error', j.error || 'Error al registrar fotos de nariz');
    }
  }
}
