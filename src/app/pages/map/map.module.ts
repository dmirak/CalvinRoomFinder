import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapPage } from './map.page';
import { ExploreContainerComponentModule } from '../../components/explore-container/explore-container.module';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MapPageRoutingModule } from './map-routing.module';

import { NavMenuComponentModule } from 'src/app/components/nav-menu/nav-menu.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    MapPageRoutingModule,
    NavMenuComponentModule,
  ],
  declarations: [MapPage],
})
export class MapPageModule { }
