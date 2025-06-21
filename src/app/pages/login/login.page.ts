import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from 'src/app/services/api/db.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  mdl_rut: string = '';
  mdl_pass: string = '';
  rutValido: boolean = false;
  rutVisual: string = '';

  constructor(private router: Router, private api: DbService) {}

  private validateRut(rut: string): boolean {
    const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (cleanRut.length < 2) return false;

    const rutBody = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    let suma = 0, multiplo = 2;
    for (let i = rutBody.length - 1; i >= 0; i--) {
      suma += parseInt(rutBody.charAt(i)) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalc = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    return dv === dvCalc;
  }

formatearRutVisual(event: any) {
  const input = event.target as HTMLInputElement;
  let rut = input.value.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
  this.mdl_rut = rut;

  if (rut === '') {
    this.rutVisual = '';
    this.rutValido = false;
    return;
  }

  let cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1);

  let formateado = cuerpo.split('').reverse().reduce((acc, cur, i) =>
    acc + cur + (i > 0 && (i + 1) % 3 === 0 ? '.' : ''), '');
  formateado = formateado.split('').reverse().join('');

  this.rutVisual = `${formateado}-${dv}`;
  this.rutValido = this.validateRut(this.rutVisual);
}


  navegar() {
    if (!this.rutValido) return alert('RUT inválido');
    if (!this.mdl_rut || !this.mdl_pass) return alert('Completa los campos');

    this.api.login(this.mdl_rut.trim(), this.mdl_pass.trim()).subscribe({
      next: (user) => {
        localStorage.setItem('usuario', JSON.stringify(user));
        this.router.navigate(['principal']);
      },
      error: () => alert('Credenciales incorrectas')
    });
  }

  navegarCrearCuenta() {
    this.router.navigate(['crear-cuenta']);
  }
}
