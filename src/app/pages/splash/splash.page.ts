import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DbLocalService } from 'src/app/services/dblocal.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false,
})
export class SplashPage implements OnInit {

  constructor(private router:Router, private db: DbLocalService) { }

  ngOnInit() {

    //Función para abrir la base de datos local
    this.db.abrirDB();

    //Función para pantalla Splash temporal
    setTimeout(() => {
      this.router.navigate(['login']);
    }, 2000);
  }

}
