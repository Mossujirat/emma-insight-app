import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { StatisticsDataService } from '../services/statistic-data.service';
import { StatisticModel, GraphDataPoint, Ranking } from '../models/statistics.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})

export class StatisticsComponent implements OnInit, AfterViewChecked {
  // Data properties
  summary: { allVehicles: number, allTrips: number, totalKilometers: number } | null = null;
  rankings: Ranking[] = [];
  isLoading: boolean = true;

  // Raw data from API
  private rawApiData: StatisticModel | null = null;
  private chartRenderPending = false;

  // Date filter properties
  dateFrom: string = '';
  dateTo: string = '';

  // Filter Panel Properties
  vehicleTypes = ['Bus', 'Cargo', 'Taxi'];
  selectedVehicleTypes: string[] = ['Bus', 'Cargo', 'Taxi'];

  eventFilters = ['Warning', 'Distraction', 'Critical', 'Harsh Braking', 'Speeding Detected'];
  speedFilters = ['Avg. Speed', 'Max Speed'];
  activeGraphGroup: 'event' | 'speed' = 'event';
  selectedGraphFilters: string[] = ['Warning', 'Critical']; // Default selection

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
    this.statsService.getStatisticsData(from, to).subscribe(data => {
      this.rawApiData = data; // เก็บข้อมูลดิบจาก API
      this.summary = data.summary;
      // Transform ranking data once
      this.rankings = data.rankingTable.map(rankItem => ({
        rank: rankItem.driverRanking,
        id: rankItem.driverId,
        licensePlateNo: rankItem.carLicenseNo,
        name: rankItem.driverName,
        vehicles: rankItem.vehicleType,
        warningDuration: `${rankItem.warningDuration} times/hour`,
        quantity: rankItem.quantity,
      }));

      this.isLoading = false;
      this.chartRenderPending = true; // บอกให้วาดกราฟ
    });
  }

  // --- Filter Methods ---

  applyDateFilter(): void {
    this.loadData(this.dateFrom, this.dateTo);
  }

  clearDateFilter(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.loadData();
  }

  toggleVehicleType(type: string): void {
    const index = this.selectedVehicleTypes.indexOf(type);
    if (index > -1) {
      this.selectedVehicleTypes.splice(index, 1);
    } else {
      this.selectedVehicleTypes.push(type);
    }
    this.processDataAndRenderChart(); // ประมวลผลและวาดกราฟใหม่
  }

  selectGraphFilter(filter: string, group: 'event' | 'speed'): void {
    if (this.activeGraphGroup !== group) {
      this.activeGraphGroup = group;
      this.selectedGraphFilters = []; // เคลียร์ของเก่าเมื่อสลับกลุ่ม
    }

    const index = this.selectedGraphFilters.indexOf(filter);
    if (index > -1) {
      this.selectedGraphFilters.splice(index, 1);
    } else {
      this.selectedGraphFilters.push(filter);
    }

    this.processDataAndRenderChart(); // ประมวลผลและวาดกราฟใหม่
  }

  // --- NEW: Core Data Processing Method ---
  processDataAndRenderChart(): void {
    if (!this.rawApiData) return;

    const dailyData = this.rawApiData.dailyData;
    const dates = Object.keys(dailyData).sort();
    const graphData: GraphDataPoint[] = [];

    // ฟังก์ชันสำหรับรวมยอดจากประเภทรถที่ถูกเลือก
    const sumSelectedVehicleTypes = (data: { [key: string]: number }): number => {
      let sum = 0;
      for (const vehicle of this.selectedVehicleTypes) {
        sum += data[vehicle] || 0;
      }
      return sum;
    };

    for (const dateString of dates) {
      const dailyStat = dailyData[dateString];
      const date = new Date(dateString);
      const dayMonthLabel = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

      graphData.push({
        month: dayMonthLabel,
        warning: sumSelectedVehicleTypes(dailyStat.warning),
        critical: sumSelectedVehicleTypes(dailyStat.critical),
        distraction: sumSelectedVehicleTypes(dailyStat.distraction),
        speedingDetected: sumSelectedVehicleTypes(dailyStat.speeding),
        harshBraking: sumSelectedVehicleTypes(dailyStat.harshBraking),
        avgSpeed: sumSelectedVehicleTypes(dailyStat.avgSpeed),
        maxSpeed: sumSelectedVehicleTypes(dailyStat.maxSpeed)
      });
    }

    this.renderChart(graphData); // ส่งข้อมูลที่ประมวลผลแล้วไปวาดกราฟ
  }


  // --- UPDATED: Chart Method now accepts data ---
  renderChart(graphData: GraphDataPoint[]): void {
    const canvas = document.getElementById('statisticsChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = graphData.map(d => d.month);
    const yAxisLabel = this.activeGraphGroup === 'event' ? 'Total Events per 10 KM' : 'Speed (Km/h)';

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          // Event Datasets
          { label: 'Warning', data: graphData.map(d => d.warning), borderColor: '#facc15', backgroundColor: '#facc15', tension: 0.3 },
          { label: 'Distraction', data: graphData.map(d => d.distraction), borderColor: '#fb923c', backgroundColor: '#fb923c', tension: 0.3 },
          { label: 'Critical', data: graphData.map(d => d.critical), borderColor: '#f87171', backgroundColor: '#f87171', tension: 0.3 },
          { label: 'Harsh Braking', data: graphData.map(d => d.harshBraking), borderColor: '#4b5563', backgroundColor: '#4b5563', tension: 0.3 },
          { label: 'Speeding Detected', data: graphData.map(d => d.speedingDetected), borderColor: '#60a5fa', backgroundColor: '#60a5fa', tension: 0.3 },
          // Speed Datasets
          { label: 'Avg. Speed', data: graphData.map(d => d.avgSpeed), borderColor: '#34d399', backgroundColor: '#34d399', tension: 0.3 },
          { label: 'Max Speed', data: graphData.map(d => d.maxSpeed), borderColor: '#a78bfa', backgroundColor: '#a78bfa', tension: 0.3 },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { maxTicksLimit: 7 } },
          y: {
            beginAtZero: true,
            title: { display: true, text: yAxisLabel }
          }
        }
      }
    });

    this.updateChartDatasetVisibility(); // อัปเดตการแสดงผลทันทีหลังสร้าง
  }

  updateChartDatasetVisibility(): void {
    if (!this.chart) return;
    this.chart.data.datasets.forEach(dataset => {
      const label = dataset.label || '';
      dataset.hidden = !this.selectedGraphFilters.includes(label);
    });
    this.chart.update();
  }
}