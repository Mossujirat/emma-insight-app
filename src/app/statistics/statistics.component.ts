// src/app/statistics/statistics.component.ts

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { StatisticsDataService } from '../services/statistic-data.service';
import { StatisticsSummary, GraphDataPoint, Ranking } from '../models/statistics.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})

export class StatisticsComponent implements OnInit, AfterViewInit {
  // Data properties
  summary: StatisticsSummary | null = null;
  graphData: GraphDataPoint[] = [];
  rankings: Ranking[] = [];
  isLoading: boolean = true;

  // Date filter properties
  dateFrom: string = '';
  dateTo: string = '';

  // Filter Panel Properties
  vehicleTypes = ['Bus', 'Cargo', 'Taxi'];
  selectedVehicleTypes: string[] = ['Bus', 'Cargo', 'Taxi']; // Default to all selected

  eventFilters = ['Warning', 'Distraction', 'Critical', 'Harsh Braking', 'Speeding Detected'];
  speedFilters = ['Avg. Speed', 'Max Speed'];
  activeGraphGroup: 'event' | 'speed' = 'event';
  selectedGraphFilters: string[] = [...this.eventFilters]; // Default to all events selected

  // Chart.js instance
  public chart: Chart | undefined;

  constructor(private statsService: StatisticsDataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Chart will be created once data is loaded
  }

  loadData(from?: string, to?: string): void {
    this.isLoading = true;
    this.statsService.getStatisticsData(from, to).subscribe(data => {
      this.summary = data.summary;
      this.graphData = data.graphData;
      this.rankings = data.rankings;
      this.isLoading = false;

      // Render chart after data is available
      // We need a slight delay to ensure the canvas element is in the DOM
      setTimeout(() => this.renderChart(), 0);
    });
  }

  // --- Filter Methods ---

  applyDateFilter(): void {
    if (this.dateFrom && this.dateTo) {
      console.log(`Applying date filter: ${this.dateFrom} to ${this.dateTo}`);
      // In a real app, this would refetch data. Here we just log it.
      this.loadData(this.dateFrom, this.dateTo);
    }
  }

  clearDateFilter(): void {
    this.dateFrom = '';
    this.dateTo = '';
    console.log('Date filter cleared.');
    this.loadData(); // Reload all data
  }

  toggleVehicleType(type: string): void {
    const index = this.selectedVehicleTypes.indexOf(type);
    if (index > -1) {
      this.selectedVehicleTypes.splice(index, 1); // Deselect
    } else {
      this.selectedVehicleTypes.push(type); // Select
    }
    console.log('Selected vehicles:', this.selectedVehicleTypes);
    // Add logic here to filter graph/rankings if needed
  }

  selectGraphFilter(filter: string, group: 'event' | 'speed'): void {
    // If switching groups, clear previous selections
    if (this.activeGraphGroup !== group) {
      this.activeGraphGroup = group;
      this.selectedGraphFilters = [];
    }
    
    // Toggle the selected filter
    const index = this.selectedGraphFilters.indexOf(filter);
    if (index > -1) {
      this.selectedGraphFilters.splice(index, 1);
    } else {
      this.selectedGraphFilters.push(filter);
    }
    
    console.log(`Active group: ${this.activeGraphGroup}, Selected filters:`, this.selectedGraphFilters);

    // Update chart visibility
    this.updateChartDatasetVisibility();
  }

  // --- Chart Methods ---

  renderChart(): void {
    if (this.chart) {
      this.chart.destroy(); // Destroy old chart instance before creating a new one
    }

    const labels = this.graphData.map(d => d.month);
    
    this.chart = new Chart('statisticsChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Warning',
            data: this.graphData.map(d => d.warning),
            borderColor: '#facc15', // Yellow
            backgroundColor: '#facc15',
            tension: 0.3,
            hidden: !this.selectedGraphFilters.includes('Warning')
          },
          {
            label: 'Distraction',
            data: this.graphData.map(d => d.distraction),
            borderColor: '#fb923c', // Orange
            backgroundColor: '#fb923c',
            tension: 0.3,
            hidden: !this.selectedGraphFilters.includes('Distraction')
          },
          {
            label: 'Critical',
            data: this.graphData.map(d => d.critical),
            borderColor: '#f87171', // Red
            backgroundColor: '#f87171',
            tension: 0.3,
            hidden: !this.selectedGraphFilters.includes('Critical')
          },
          {
            label: 'Harsh Braking',
            data: this.graphData.map(d => d.harshBraking),
            borderColor: '#4b5563', // Gray
            backgroundColor: '#4b5563',
            tension: 0.3,
            hidden: !this.selectedGraphFilters.includes('Harsh Braking')
          },
          {
            label: 'Speeding Detected',
            data: this.graphData.map(d => d.speedingDetected),
            borderColor: '#60a5fa', // Blue
            backgroundColor: '#60a5fa',
            tension: 0.3,
            hidden: !this.selectedGraphFilters.includes('Speeding Detected')
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Hide default legend since we have a custom one
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total Events per 10 KM'
            }
          }
        }
      }
    });
  }

  updateChartDatasetVisibility(): void {
    if (!this.chart) return;
    this.chart.data.datasets.forEach(dataset => {
      // The label of the dataset should match the filter name
      const label = dataset.label || '';
      dataset.hidden = !this.selectedGraphFilters.includes(label);
    });
    this.chart.update();
  }
}