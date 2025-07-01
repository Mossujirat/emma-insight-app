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

  // Chart State
  public chart: Chart | undefined;
  detectedEventFilters: string[] = ['Warning', 'Critical', 'Distraction', 'Speeding', 'Harsh Braking'];
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
        { label: 'Warning', data: allDates.map(date => dailyData[date].warning), borderColor: '#FFC107' },
        { label: 'Critical', data: allDates.map(date => dailyData[date].critical), borderColor: '#DC3545' },
        { label: 'Distraction', data: allDates.map(date => dailyData[date].distraction), borderColor: '#6F42C1' },
        { label: 'Speeding', data: allDates.map(date => dailyData[date].speeding), borderColor: '#17A2B8' },
        { label: 'Harsh Braking', data: allDates.map(date => dailyData[date].harshBraking), borderColor: '#28A745' }
      ].map(ds => ({ ...ds, tension: 0.4, fill: false, pointRadius: 2, borderWidth: 2 }));

    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Event Count', color: 'rgba(255, 255, 255, 0.7)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
          },
          x: {
            grid: { display: false },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
          }
        }
      }
    });

    this.updateChartDatasetVisibility();
  }
  
  confirmDateChange(): void {
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