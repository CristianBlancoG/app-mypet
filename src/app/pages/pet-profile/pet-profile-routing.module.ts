import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetProfilePage } from './pet-profile.page';

const routes: Routes = [
  {
    path: '',
    component: PetProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PetProfilePageRoutingModule {}
