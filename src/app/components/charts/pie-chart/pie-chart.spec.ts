import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { PieChartComponent } from './pie-chart';

describe('PieChartComponent', () => {
  let component: PieChartComponent;
  let fixture: ComponentFixture<PieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs & Rendering', () => {
    
    it('should display the default empty message and hide container when no data is provided', () => {
      const emptyMessageEl = fixture.debugElement.query(By.css('.text-slate-500')).nativeElement;
      const chartContainer = fixture.debugElement.query(By.css('.chart-wrapper > div:first-child')).nativeElement;
      
      expect(emptyMessageEl.textContent.trim()).toBe('No data available.');
      expect(chartContainer.classList.contains('hidden')).toBe(true);
    });

    it('should display a custom empty message when provided via Input', () => {
      fixture.componentRef.setInput('emptyMessage', 'Nothing to see here');
      fixture.detectChanges();
      
      const emptyMessageEl = fixture.debugElement.query(By.css('.text-slate-500')).nativeElement;
      expect(emptyMessageEl.textContent.trim()).toBe('Nothing to see here');
    });

    it('should render the SVG pie slices and legends when data is provided', () => {
      fixture.componentRef.setInput('data', [
        { label: 'A', value: 40 },
        { label: 'B', value: 60 }
      ]);
      fixture.detectChanges();

      const chartContainer = fixture.debugElement.query(By.css('.chart-wrapper > div:first-child')).nativeElement;
      expect(chartContainer.classList.contains('hidden')).toBe(false);

      const slices = fixture.debugElement.queryAll(By.css('.pie-slice'));
      expect(slices.length).toBe(2);

      const legends = fixture.debugElement.queryAll(By.css('.legend'));
      expect(legends.length).toBe(2);
      
      expect(legends[0].nativeElement.textContent).toContain('A40 (40%)');
      expect(legends[1].nativeElement.textContent).toContain('B60 (60%)');
    });
  });
});
