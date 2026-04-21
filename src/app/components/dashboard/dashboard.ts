import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PieChartComponent } from '../pie-chart/pie-chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PieChartComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  constructor(private router: Router) {}

  onAddTransaction() {
    this.router.navigate(['/add-transaction']);
  }
}