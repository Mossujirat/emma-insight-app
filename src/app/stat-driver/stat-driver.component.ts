import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-stat-driver',
  standalone: false,
  templateUrl: './stat-driver.component.html',
  styleUrls: ['./stat-driver.component.css']
})
export class StatDriverComponent implements OnInit, AfterViewInit {
  // Sample data to match the new UI
  driver = {
    name: 'Somkid',
    details: 'B005, AD-1234 (Bus)'
  };

  // Stats for the cards on the right
  summaryStats = {
    speedingDetected: 9,
    distance: 598,
    avgSpeed: 55,
    maxSpeed: 170,
    timePerTrip: '1 hr 28 min',
    totalDrivingTime: '12 hr 45 min'
  };

  // Data for the main chart
  chartData = {
    labels: ['05 Nov 25', '08 Nov 25', '11 Nov 25', '14 Nov 25'],
    datasets: [
      {
        label: 'Yawning',
        data: [300, 250, 200, 220],
        borderColor: '#FFC107',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Eye',
        data: [600, 500, 400, 450],
        borderColor: '#FFFFFF',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Micro-Sleep',
        data: [550, 450, 350, 400],
        borderColor: '#FF6384',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Sleep',
        data: [700, 650, 600, 750],
        borderColor: '#36A2EB',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Distraction',
        data: [250, 200, 150, 180],
        borderColor: '#9966FF',
        tension: 0.4,
        fill: false,
      }
    ]
  };

  // Data for the Trip Log table
  tripLog = [
    { date: '14/05/2025', startTime: '11:55 AM', distance: '09 Km', duration: '20 min', avgSpeed: '49 Km/h' },
    { date: '14/05/2025', startTime: '11:05 AM', distance: '12 Km', duration: '1 hr 01 min', avgSpeed: '30 Km/h' },
    { date: '14/05/2025', startTime: '06:49 AM', distance: '58 Km', duration: '3 hr 03min', avgSpeed: '55 Km/h' },
    { date: '13/05/2025', startTime: '11:00 AM', distance: '23 Km', duration: '1 hr', avgSpeed: '65 Km/h' },
    { date: '13/05/2025', startTime: '09:21 AM', distance: '29 Km', duration: '40 min', avgSpeed: '65 Km/h' },
    { date: '12/05/2025', startTime: '08:00 AM', distance: '19 Km', duration: '15 min', avgSpeed: '75 Km/h' },
  ];

  public mainChart: Chart | undefined;
  detectedEventFilters: string[] = ['Yawning', 'Eye', 'Micro-Sleep', 'Sleep', 'Distraction'];
  activeEventFilters: string[] = [...this.detectedEventFilters];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // In a real app, you would fetch the driver data here using the driverId from the route
  }

  ngAfterViewInit(): void {
    this.createMainChart();
  }

  goBack(): void {
    // Navigate back to the main statistics page
    this.router.navigate(['/dashboard/statistics']);
  }

  // Toggles the visibility of datasets in the chart
  toggleEventFilter(filter: string): void {
    const index = this.activeEventFilters.indexOf(filter);
    if (index > -1) {
      this.activeEventFilters.splice(index, 1);
    } else {
      this.activeEventFilters.push(filter);
    }
    this.updateChartDatasetVisibility();
  }

  // Checks if a filter button should be in the "active" state
  isFilterActive(filter: string): boolean {
    return this.activeEventFilters.includes(filter);
  }

  private createMainChart(): void {
    const canvas = document.getElementById('mainDriverChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Chart canvas element not found!');
      return;
    }

    this.mainChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.chartData.labels,
        datasets: this.chartData.datasets.map(ds => ({
          ...ds,
          pointRadius: 0, // Hide points
          borderWidth: 2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Hide default legend, we have custom buttons
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total Events per 10 KM',
              color: 'rgba(255, 255, 255, 0.7)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        }
      }
    });
  }

  private updateChartDatasetVisibility(): void {
    if (!this.mainChart) return;
    this.mainChart.data.datasets.forEach(dataset => {
      // The `hidden` property controls dataset visibility
      dataset.hidden = !this.activeEventFilters.includes(dataset.label || '');
    });
    this.mainChart.update();
  }
}