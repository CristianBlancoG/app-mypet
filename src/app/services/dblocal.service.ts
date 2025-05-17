import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DbLocalService {

  private db: SQLiteObject | null = null;

  constructor(private sqlite: SQLite) { }


  //Función asincrona para abrir la DB | el 'create' crea una base de datos o abre una ya creada
  async abrirDB(){
    this.db = await this.sqlite.create({
      name: "mypet.db",
      location: "default"
    });
    
  }
}
