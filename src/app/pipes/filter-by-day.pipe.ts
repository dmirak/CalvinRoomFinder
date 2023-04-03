import { Pipe, PipeTransform } from '@angular/core';
import { ScheduleItem, Day } from '../../assets/data/ScheduleItem';

@Pipe({
  name: 'filterByDay'
})

export class FilterByDayPipe implements PipeTransform {
  transform(items: ScheduleItem[], day: any): ScheduleItem[] {
    return items.filter(item => item.days.includes(day.name));
  }
}
