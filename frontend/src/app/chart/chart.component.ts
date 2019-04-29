import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
})
export class ChartComponent implements OnInit {
  public lineChartData: ChartDataSets[] = [{ data: [20.5, 20.6, 20, 21.1, 21.3, 21, 21.5, 22], label: 'Series A' }];
  public lineChartLabels: Label[] = [];

  public lineChartColors: Color[] = [
    {
      borderColor: 'yellow',
      backgroundColor: 'rgba(255,0,0,0.5)',
    },
  ];

  constructor() {}

  ngOnInit() {
    for (let i = 0; i < 25; i++) {
      this.lineChartLabels.push(i.toString());
    }
  }
}
