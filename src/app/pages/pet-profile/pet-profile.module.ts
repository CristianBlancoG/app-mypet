import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PetProfilePageRoutingModule } from './pet-profile-routing.module';

import { PetProfilePage } from './pet-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PetProfilePageRoutingModule
  ],
  declarations: [PetProfilePage]
})
export class PetProfilePageModule {}
