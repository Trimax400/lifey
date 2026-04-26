import { Component, ElementRef, OnInit, OnChanges, SimpleChanges, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.html',
  styleUrls: ['./pie-chart.css']
})
export class PieChartComponent implements OnInit, OnChanges {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  @Input() data: { label: string, value: number }[] = [];
  @Input() emptyMessage: string = 'No data available.';

  private margin = 20;
  private width = 600;
  private height = 400;
  private radius = Math.min(400, this.height) / 2 - this.margin;

  private svg: any;
  private colors: any;

  ngOnInit(): void {
    this.createSvg();
    this.createColors();
    this.drawChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chartContainer) {
      this.createSvg();
      this.createColors();
      this.drawChart();
    }
  }

  private createSvg(): void {
    d3.select(this.chartContainer.nativeElement).select('svg').remove();

    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${this.height / 2}, ${this.height / 2})`);
  }

  private createColors(): void {
    this.colors = d3.scaleOrdinal()
      .domain(this.data.map(d => d.label))
      .range(d3.schemeSet2);
  }

  private drawChart(): void {
    if (!this.data || this.data.length === 0) return;

    const pie = d3.pie<any>().value((d: any) => d.value);
    const total = d3.sum(this.data, d => d.value);

    const arcGenerator = d3.arc()
      .innerRadius(this.radius * 0.5)
      .outerRadius(this.radius)
      .cornerRadius(8);

    const arcHover = d3.arc()
      .innerRadius(this.radius * 0.5)
      .outerRadius(this.radius + 10)
      .cornerRadius(8);

    let activeSlice: string | null = null;

    const arcs = this.svg
      .selectAll('pieces')
      .data(pie(this.data))
      .enter()
      .append('path')
      .attr('class', (d: any) => `pie-slice slice-${d.data.label.replace(/\s+/g, '-')}`)
      .attr('d', arcGenerator)
      .attr('fill', (d: any) => this.colors(d.data.label))
      .attr('stroke', '#ffffff')
      .style('stroke-width', '3px')
      .style('cursor', 'pointer');

    arcs.on('mouseover', (event: any, d: any) => {
      d3.select(event.currentTarget)
        .transition().duration(200)
        .attr('d', (d: any) => arcHover(d))
        .style('opacity', 0.85);
    })
      .on('mouseout', (event: any, d: any) => {
        const isActive = activeSlice === d.data.label;
        d3.select(event.currentTarget)
          .transition().duration(200)
          .attr('d', isActive ? arcHover(d) : arcGenerator(d))
          .style('opacity', isActive ? 1 : (activeSlice ? 0.3 : 1));
      });

    const legendItemSpacing = 45;
    const legendHeight = (this.data.length - 1) * legendItemSpacing + 20;

    const legendGroup = this.svg.append('g')
      .attr('transform', `translate(${this.radius + 40}, ${-legendHeight / 2})`);

    const legend = legendGroup.selectAll('.legend')
      .data(this.data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d: any, i: number) => `translate(0, ${i * legendItemSpacing})`)
      .style('cursor', 'pointer');

    legend.append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('rx', 4)
      .attr('fill', (d: any) => this.colors(d.label));

    legend.append('text')
      .attr('x', 30)
      .attr('y', 15)
      .text((d: any) => d.label)
      .style('font-size', '16px')
      .style('font-family', 'sans-serif')
      .style('fill', '#333')
      .style('alignment-baseline', 'middle');

    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 32)
      .attr('x2', 250)
      .attr('y2', 32)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .style('display', (d: any, i: number) => i === this.data.length - 1 ? 'none' : 'block');

    legend.append('text')
      .attr('x', 250)
      .attr('y', 15)
      .text((d: any) => `${d.value} (${Math.round((d.value / total) * 100)}%)`)
      .style('font-size', '16px')
      .style('font-family', 'sans-serif')
      .style('fill', '#333')
      .style('alignment-baseline', 'middle')
      .style('text-anchor', 'end');

    legend.on('mouseover', (event: any, d: any) => {
      const className = `.slice-${d.label.replace(/\s+/g, '-')}`;
      this.svg.select(className)
        .transition().duration(200)
        .attr('d', (sliceData: any) => arcHover(sliceData))
        .style('opacity', 0.85);
    });

    legend.on('mouseout', (event: any, d: any) => {
      const className = `.slice-${d.label.replace(/\s+/g, '-')}`;
      const isActive = activeSlice === d.label;

      this.svg.select(className)
        .transition().duration(200)
        .attr('d', (sliceData: any) => isActive ? arcHover(sliceData) : arcGenerator(sliceData))
        .style('opacity', isActive ? 1 : (activeSlice ? 0.3 : 1));
    });

    legend.on('click', (event: any, d: any) => {
      const className = `.slice-${d.label.replace(/\s+/g, '-')}`;
      const isCurrentlyActive = activeSlice === d.label;

      if (isCurrentlyActive) {
        this.svg.selectAll('.pie-slice')
          .transition().duration(200)
          .attr('d', (sliceData: any) => arcGenerator(sliceData))
          .style('opacity', 1);
        activeSlice = null;
      } else {
        this.svg.selectAll('.pie-slice')
          .transition().duration(200)
          .attr('d', (sliceData: any) => arcGenerator(sliceData))
          .style('opacity', 0.3);

        this.svg.select(className)
          .transition().duration(200)
          .attr('d', (sliceData: any) => arcHover(sliceData))
          .style('opacity', 1);

        activeSlice = d.label;
      }
    });
  }
}