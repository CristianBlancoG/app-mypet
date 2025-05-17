import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistVacunasPage } from './hist-vacunas.page';

const routes: Routes = [
  {
    path: '',
    component: HistVacunasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistVacunasPageRoutingModule {}
