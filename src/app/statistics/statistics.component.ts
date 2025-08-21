// src/app/statistics/statistics.component.ts

import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { StatisticsDataService } from '../services/statistic-data.service';
import { StatisticModel, GraphDataPoint, Ranking, StatisticsSummary } from '../models/statistics.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})

export class StatisticsComponent implements OnInit, AfterViewChecked {
  summary: StatisticsSummary | null = null;
  rankings: Ranking[] = [];
  sortedRankings: Ranking[] = [];
  isLoading: boolean = true;
  hasError: boolean = false; 
  private rawApiData: StatisticModel | null = null;
  private chartRenderPending = false;
  dateFrom: string = '';
  dateTo: string = '';
  minSelectableDate: string = '';
  maxSelectableDate: string = '';

  activeRankingFilter: 'warning' | 'critical' = 'warning';
  sortOrder: 'highToLow' | 'lowToHigh' = 'highToLow';
  searchText: string = '';

  vehicleTypes = ['Bus', 'Cargo', 'Taxi'];
  selectedVehicleTypes: string[] = ['Bus', 'Cargo', 'Taxi'];
  eventFilters = ['Warning', 'Distraction', 'Critical', 'Speeding Detected'];
  speedFilters = ['Avg. Speed', 'Max Speed'];
  activeGraphGroup: 'event' | 'speed' = 'event';
  selectedGraphFilters: string[] = [...this.eventFilters]; 
  public chart: Chart | undefined;

  constructor(private statsService: StatisticsDataService) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewChecked(): void {
    if (this.chartRenderPending) {
      this.processDataAndRenderChart();
      this.chartRenderPending = false;
    }
  }

  loadData(from?: string, to?: string): void {
    this.isLoading = true;
    this.hasError = false;

    this.statsService.getStatisticsData(from, to).subscribe({
      // --- เปลี่ยนมาใช้รูปแบบ Object เพื่อรองรับ error callback ---
      next: data => { // ทำงานเมื่อ API สำเร็จ
        this.rawApiData = data;
        this.summary = data.summary;
        
        this.rankings = data.rankingTable.map(rankItem => ({
            id: rankItem.driverId, 
            licensePlateNo: rankItem.carLicenseNo,
            name: rankItem.driverName, 
            vehicles: rankItem.vehicleType,
            warningDuration: rankItem.warningDuration,
            criticalDuration: rankItem.criticalDuration,
            durationDisplay: '', // จะถูกกำหนดค่าในภายหลัง
            quantitywarning: rankItem.quantitywarning,
            quantitycritical: rankItem.quantitycritical
        }));

        if (!from && !to && this.rawApiData) {
          this.dateFrom = this.rawApiData.startDate;
          this.dateTo = this.rawApiData.endDate;
          this.minSelectableDate = this.rawApiData.minDate;
          this.maxSelectableDate = this.rawApiData.maxDate;
        }
        
        this.isLoading = false; 
        this.chartRenderPending = true;
        this.applyRankingSortAndFilter();
      },
      error: err => { // --- ทำงานเมื่อ API ล้มเหลว ---
        console.error('Failed to load statistics data:', err);
        this.isLoading = false; // ปิด Loading
        this.hasError = true;  // เปิดโหมดแสดงผล Error
      }
    });
  }

  refreshData(): void {
    this.loadData(this.dateFrom, this.dateTo);
  }

  confirmDateChange(): void {
    this.loadData(this.dateFrom, this.dateTo);
  }

  clearDateFilter(): void {
    if (this.rawApiData) {
      this.dateFrom = this.rawApiData.minDate;
      this.dateTo = this.rawApiData.maxDate;
    }
    this.loadData();
  }

  setRankingFilter(filter: 'warning' | 'critical'): void {
    this.activeRankingFilter = filter;
    this.applyRankingSortAndFilter();
  }

  // อัปเดตฟังก์ชัน applyRankingSortAndFilter ให้รองรับการค้นหา
  applyRankingSortAndFilter(): void {
    if (!this.rankings || this.rankings.length === 0) {
      this.sortedRankings = [];
      return;
    }

    // 1. เริ่มจากข้อมูลทั้งหมด
    let tempRankings = [...this.rankings];

    // 2. กรองข้อมูลด้วย searchText (Search Filter)
    if (this.searchText && this.searchText.trim() !== '') {
      const lowercasedSearchText = this.searchText.toLowerCase().trim();
      tempRankings = tempRankings.filter(rank => 
        rank.id.toLowerCase().includes(lowercasedSearchText) ||
        rank.licensePlateNo.toLowerCase().includes(lowercasedSearchText) ||
        rank.name.toLowerCase().includes(lowercasedSearchText)
      );
    }

    // 3. จัดเรียงข้อมูล (Sorting) จากข้อมูลที่ผ่านการกรองแล้ว
    const sortProperty = this.activeRankingFilter === 'warning' ? 'warningDuration' : 'criticalDuration';
    
    tempRankings.sort((a, b) => {
      const valA = a[sortProperty];
      const valB = b[sortProperty];
      return this.sortOrder === 'highToLow' ? valB - valA : valA - valB;
    });

    // 4. อัปเดตข้อความที่จะแสดงผล
    tempRankings.forEach(r => {
      const duration = r[sortProperty];
      r.durationDisplay = `${duration} times/hour`;
    });
    
    this.sortedRankings = tempRankings;
  }

  toggleVehicleType(type: string): void {
    const index = this.selectedVehicleTypes.indexOf(type);
    if (index > -1) this.selectedVehicleTypes.splice(index, 1);
    else this.selectedVehicleTypes.push(type);
    this.processDataAndRenderChart();
  }

  selectGraphFilter(filter: string, group: 'event' | 'speed'): void {
    if (this.activeGraphGroup !== group) {
      this.activeGraphGroup = group;
      this.selectedGraphFilters = [];
    }
    const index = this.selectedGraphFilters.indexOf(filter);
    if (index > -1) this.selectedGraphFilters.splice(index, 1);
    else this.selectedGraphFilters.push(filter);
    this.processDataAndRenderChart();
  }

  processDataAndRenderChart(): void {
    if (!this.rawApiData) {
      this.isLoading = false;
      return;
    }
    
    const dailyData = this.rawApiData.dailyData;
    const allDates = Object.keys(dailyData).sort();
    const graphData: GraphDataPoint[] = [];

    const sumSelectedVehicleTypes = (data: { [key: string]: number }): number => {
      let sum = 0;
      if (!data) return 0;
      for (const vehicle of this.selectedVehicleTypes) sum += data[vehicle] || 0;
      return sum;
    };

    for (const dateString of allDates) {
      const isAfterFrom = !this.dateFrom || dateString >= this.dateFrom;
      const isBeforeTo = !this.dateTo || dateString <= this.dateTo;
      if (isAfterFrom && isBeforeTo) {
        const dailyStat = dailyData[dateString];
        const date = new Date(dateString);
        const dayMonthLabel = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        graphData.push({
          date: dayMonthLabel,
          warning: sumSelectedVehicleTypes(dailyStat.warning),
          critical: sumSelectedVehicleTypes(dailyStat.critical),
          distraction: sumSelectedVehicleTypes(dailyStat.distraction),
          speedingDetected: sumSelectedVehicleTypes(dailyStat.speeding),
          avgSpeed: sumSelectedVehicleTypes(dailyStat.avgSpeed),
          maxSpeed: sumSelectedVehicleTypes(dailyStat.maxSpeed)
        });
      }
    }
    this.renderChart(graphData);
  }

  renderChart(graphData: GraphDataPoint[]): void {
    const canvas = document.getElementById('statisticsChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.chart) this.chart.destroy();

    const labels = graphData.map(d => d.date);
    const yAxisLabel = this.activeGraphGroup === 'event' ? 'Total Events per 10 KM' : 'Speed (Km/h)';

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Warning', data: graphData.map(d => d.warning), borderColor: '#facc15' },
          { label: 'Distraction', data: graphData.map(d => d.distraction), borderColor: '#fb923c' },
          { label: 'Critical', data: graphData.map(d => d.critical), borderColor: '#f87171' },
          { label: 'Speeding Detected', data: graphData.map(d => d.speedingDetected), borderColor: '#60a5fa' },
          { label: 'Avg. Speed', data: graphData.map(d => d.avgSpeed), borderColor: '#34d399' },
          { label: 'Max Speed', data: graphData.map(d => d.maxSpeed), borderColor: '#a78bfa' },
        ].map(ds => ({...ds, backgroundColor: ds.borderColor, tension: 0.3}))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { 
          legend: { 
            display: true,
            position: 'bottom', // This is what you need to change
            labels: {
              filter: (item) => !item.hidden
            }
          } 
        },
        scales: {
          x: { ticks: { maxTicksLimit: 7 } },
          y: { beginAtZero: true, title: { display: true, text: yAxisLabel } }
        }
      }
    });
    this.updateChartDatasetVisibility();
  }

  updateChartDatasetVisibility(): void {
    if (!this.chart) return;
    this.chart.data.datasets.forEach(dataset => {
      dataset.hidden = !this.selectedGraphFilters.includes(dataset.label || '');
    });
    this.chart.update();
  }
}