// src/app/stat-driver/stat-driver.component.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Chart from 'chart.js/auto';
import { StatisticDriverDataService } from '../services/statistic-driver-data.service';
import { StatisticDriverModel } from '../models/statistic-driver.model';

@Component({
  selector: 'app-stat-driver',
  standalone: false,
  templateUrl: './stat-driver.component.html',
  styleUrls: ['./stat-driver.component.css']
})
export class StatDriverComponent implements OnInit, AfterViewInit, OnDestroy {
  // Use @ViewChild to get a reliable reference to the canvas element
  @ViewChild('mainDriverChart') chartCanvas: ElementRef<HTMLCanvasElement> | undefined;

  // Component State
  driverId: string | null = null;
  driverData: StatisticDriverModel | null = null;
  isLoading = true;
  hasError = false;
  private unsubscribe$ = new Subject<void>();

  // Date Filters
  dateFrom: string = '';
  dateTo: string = '';
  minSelectableDate: string = ''; // New: To store the minimum date available from API
  maxSelectableDate: string = ''; // New: To store the maximum date available from API

  // Chart State
  public chart: Chart | undefined;
  detectedEventFilters: string[] = ['Yawning', 'Eye', 'Micro-Sleep', 'Sleep', "Distraction"];
  activeEventFilters: string[] = [...this.detectedEventFilters];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private statsDriverService: StatisticDriverDataService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef to manually trigger view updates
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(params => {
        this.driverId = params.get('driverId');
        if (this.driverId) {
          this.loadDriverData();
        } else {
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }

  // ngAfterViewInit runs once after the view is initialized.
  ngAfterViewInit(): void {
    // If data somehow loaded before the view was ready, render the chart now.
    if (this.driverData) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.chart?.destroy(); // Clean up the chart instance
  }

  loadDriverData(from?: string, to?: string): void {
    if (!this.driverId) return;

    this.isLoading = true;
    this.hasError = false;
    this.chart?.destroy(); // Destroy any old chart before loading new data

    this.statsDriverService.getStatisticDriverData(this.driverId, from, to)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.driverData = data;
          this.isLoading = false;

          // Set initial date range from API if not already set by user's filter
          if (data.minDate && data.maxDate) {
            this.minSelectableDate = data.minDate;
            this.maxSelectableDate = data.maxDate;
            // Only set dateFrom and dateTo if they haven't been explicitly filtered
            if (!from && !to) {
              this.dateFrom = data.startDate || data.minDate;
              this.dateTo = data.endDate || data.maxDate;
            }
          }
          
          // Sort dailyTripLog by date in descending order (latest first)
          if (this.driverData.dailyTripLog) {
            this.driverData.dailyTripLog.sort((a, b) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
          }

          // Manually tell Angular to update the view now that data is loaded.
          // This makes the canvas element available via the *ngIf.
          this.cdr.detectChanges(); 
          // Now that the view is guaranteed to be updated, we can render the chart.
          this.renderChart();
        },
        error: () => {
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }

  renderChart(): void {
    // This check is the key: it ensures both the canvas element and the data are ready.
    if (!this.chartCanvas || !this.driverData?.dailyData) {
      return; 
    }

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const dailyData = this.driverData.dailyData;
    const allDates = Object.keys(dailyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const labels = allDates.map(dateString => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    const datasets = [
        { label: 'Yawning', data: allDates.map(date => dailyData[date].yawning), borderColor: '#FFC107' },
        { label: 'Eye', data: allDates.map(date => dailyData[date].eye), borderColor: '#DC3545' },
        { label: 'Micro-Sleep', data: allDates.map(date => dailyData[date].microsleep), borderColor: '#17A2B8' },
        { label: 'Sleep', data: allDates.map(date => dailyData[date].sleep), borderColor: '#17b83aff' },
        { label: 'Distraction', data: allDates.map(date => dailyData[date].distraction), borderColor: '#6F42C1' },
      ].map(ds => ({ ...ds, tension: 0.4, backgroundColor: ds.borderColor, fill: false, pointRadius: 2, borderWidth: 2 }));

    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            display: true,
            position: 'bottom',
            labels: {
              color: 'white',
              filter: (item) => !item.hidden
            }
          } 
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Event Count', color: 'rgba(255, 255, 255, 0.7)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
          },
          x: { ticks: { maxTicksLimit: 7 } },
        }
      }
    });

    this.updateChartDatasetVisibility();
  }
  
  confirmDateChange(): void {
    if (this.dateFrom && this.dateTo) {
      this.loadDriverData(this.dateFrom, this.dateTo);
    } else {
      console.warn('Please select both From and To dates.');
    }
  }

  clearDateFilter(): void {
    if (this.driverData) { 
      this.dateFrom = this.driverData.minDate || ''; 
      this.dateTo = this.driverData.maxDate || ''; 
    }
    this.loadDriverData(this.dateFrom, this.dateTo); 
  }

  goBack(): void {
    this.router.navigate(['/dashboard/statistics']);
  }

  toggleEventFilter(filter: string): void {
    const index = this.activeEventFilters.indexOf(filter);
    if (index > -1) {
      this.activeEventFilters.splice(index, 1);
    } else {
      this.activeEventFilters.push(filter);
    }
    this.updateChartDatasetVisibility();
  }

  isFilterActive(filter: string): boolean {
    return this.activeEventFilters.includes(filter);
  }

  private updateChartDatasetVisibility(): void {
    if (!this.chart?.data.datasets) return;
    this.chart.data.datasets.forEach(dataset => {
      dataset.hidden = !this.activeEventFilters.includes(dataset.label || '');
    });
    this.chart.update();
  }
}