import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  // Data for Overall System Status
  normalStatus = { percentage: 50 };
  warningStatus = { percentage: 35 };
  criticalStatus = { percentage: 15 };

  warningDetected: number = 34;
  criticalDetected: number = 14;
  speedingDetected: number = 32;

  // Data for Rankings Table
  rankings = [
    { rank: 1, id: 'B001', licensePlateNo: 'AD-1234', name: 'Sarawut', vehicles: 'Bus', warningDuration: '89 times', quantity: 89 },
    { rank: 2, id: 'C001', licensePlateNo: 'AD-1234', name: 'Moss Sujirat', vehicles: 'Cargo', warningDuration: '20 times/hour', quantity: 78 },
    { rank: 3, id: 'B003', licensePlateNo: 'AD-1234', name: 'Kajslee', vehicles: 'Bus', warningDuration: '19 times/hour', quantity: 70 },
    { rank: 4, id: 'C004', licensePlateNo: 'AD-1234', name: 'Tasaya', vehicles: 'Cargo', warningDuration: '15 times/hour', quantity: 65 },
    { rank: 5, id: 'B002', licensePlateNo: 'AD-1234', name: 'Aleeya', vehicles: 'Bus', warningDuration: '10 times/hour', quantity: 50 },
  ];

  constructor() { }

  ngOnInit(): void {
    // No specific initialization for this overview page for now
  }
}