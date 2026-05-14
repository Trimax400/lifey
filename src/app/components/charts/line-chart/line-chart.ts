import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.html',
})
export class LineChartComponent {
  @Input() data: { label: string }[] = [];
  @Input() paths: { income: string, expenses: string, balance: string } = { income: '', expenses: '', balance: '' };
  @Input() title: string = $localize`:@@lineChart.defaultTitle:History`;
}
