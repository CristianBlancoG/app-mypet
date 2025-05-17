import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistVacunasPageRoutingModule } from './hist-vacunas-routing.module';

import { HistVacunasPage } from './hist-vacunas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistVacunasPageRoutingModule
  ],
  declarations: [HistVacunasPage]
})
export class HistVacunasPageModule {}
