import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchedulePageRoutingModule } from './schedule-routing.module';

import { SchedulePage } from './schedule.page';
import { SortDaysPipe } from 'src/app/pipes/sort-days.pipe';
import { FilterByDayPipe } from 'src/app/pipes/filter-by-day.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchedulePageRoutingModule,
  ],
  declarations: [SchedulePage, SortDaysPipe, FilterByDayPipe]
})
export class SchedulePageModule { }
