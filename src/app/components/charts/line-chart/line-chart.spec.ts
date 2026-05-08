import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { LineChartComponent } from './line-chart';

describe('LineChartComponent', () => {
  let component: LineChartComponent;
  let fixture: ComponentFixture<LineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs & Rendering', () => {
    
    it('should display the default title', () => {
      const titleEl = fixture.debugElement.query(By.css('h3')).nativeElement;
      expect(titleEl.textContent.trim()).toBe('History');
    });

    it('should display a custom title when provided via Input', () => {
      fixture.componentRef.setInput('title', 'My Custom Chart');
      fixture.detectChanges();
      
      const titleEl = fixture.debugElement.query(By.css('h3')).nativeElement;
      expect(titleEl.textContent.trim()).toBe('My Custom Chart');
    });

    it('should display "Not enough data" message when data has 1 or 0 items', () => {
      fixture.componentRef.setInput('data', [{ label: 'January' }]);
      fixture.detectChanges();

      const emptyMessageEl = fixture.debugElement.query(By.css('.text-slate-500'));
      const svgEl = fixture.debugElement.query(By.css('svg'));

      expect(emptyMessageEl.nativeElement.textContent.trim()).toBe('Not enough data for history chart.');
      expect(svgEl).toBeNull();
    });

    it('should render the SVG paths and labels when data has more than 1 item', () => {
      fixture.componentRef.setInput('data', [{ label: 'Jan' }, { label: 'Feb' }]);
      fixture.componentRef.setInput('paths', {
        income: 'M 0,0 L 100,100',
        expenses: 'M 0,10 L 100,110',
        balance: 'M 0,20 L 100,120'
      });
      fixture.detectChanges();

      const svgEl = fixture.debugElement.query(By.css('svg'));
      expect(svgEl).toBeTruthy();

      const paths = fixture.debugElement.queryAll(By.css('path'));
      expect(paths.length).toBe(3);
      expect(paths[0].nativeElement.getAttribute('d')).toBe('M 0,0 L 100,100');
      expect(paths[1].nativeElement.getAttribute('d')).toBe('M 0,10 L 100,110');
      expect(paths[2].nativeElement.getAttribute('d')).toBe('M 0,20 L 100,120');

      const labels = fixture.debugElement.queryAll(By.css('.text-slate-400'));
      expect(labels.length).toBe(2);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Jan');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Feb');
    });
  });
});
