import { Pipe, PipeTransform } from '@angular/core';
import { getCategoryLabel } from '../utils/category.utils';

@Pipe({
  name: 'categoryLabel',
  standalone: true
})
export class CategoryLabelPipe implements PipeTransform {
  transform(value: string): string {
    return getCategoryLabel(value);
  }
}
