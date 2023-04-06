import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortDays'
})
export class SortDaysPipe implements PipeTransform {

  transform(value: any[], args?: any): any {
    console.log('Value: ' + value + 'Args: ' + args);
    return value.sort((a, b) => a.order - b.order);
  }
}
