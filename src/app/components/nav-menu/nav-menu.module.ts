import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NavMenuComponent } from './nav-menu.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  declarations: [NavMenuComponent],
  exports: [NavMenuComponent]
})
export class NavMenuComponentModule { }
