import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  declarations: [PetProfilePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PetProfilePageModule {}
