import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortDays'
})
export class SortDaysPipe implements PipeTransform {

  transform(value: any[], args?: any): any {
    return value.sort((a, b) => a.order - b.order);
  }
}
