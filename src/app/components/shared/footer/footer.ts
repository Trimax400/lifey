import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html'
})
export class FooterComponent {
  currentYear = signal<number>(new Date().getFullYear());
}
