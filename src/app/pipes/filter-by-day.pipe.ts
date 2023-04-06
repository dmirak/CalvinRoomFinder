import { Pipe, PipeTransform } from '@angular/core';
import { ScheduleItem, Day } from '../../assets/data/ScheduleItem';

@Pipe({
  name: 'filterByDay'
})

export class FilterByDayPipe implements PipeTransform {
  transform(items: ScheduleItem[], day: any): ScheduleItem[] {
    const filteredItems = items.filter(item => item.days.includes(day.name));
    return filteredItems.sort((a, b) => {
      const aTime = new Date(`2000-01-01T${a.time}`);
      const bTime = new Date(`2000-01-01T${b.time}`);
      return aTime.getHours() - bTime.getHours();
    });
  }
}
