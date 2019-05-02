import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartPoint } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
})
export class ChartComponent implements OnInit {
  public lineChartData: ChartDataSets[] = [
    {
      data: [22.3, 23.0, 23.4, 23.3, 23.3, 23.3, 23.2, 23.2, 23.1, 23.2, 23.4, 23.6, 23.8, 23.9, 24.0],
      label: 'temp',
    },
    /*{
      data: [55, 52, 50, 50, 50, 50, 50, 50, 50, 49, 49, 48, 47, 47, 47],
      label: 'Humi',
    },*/
  ];
  public lineChartLabels: Label[] = [];

  public lineChartColors: Color[] = [
    {
      borderColor: 'yellow',
      backgroundColor: 'rgba(255,0,0,0.5)',
    },
  ];

  public lineChartOptions: ChartOptions = {
    scales: {
      yAxes: [
        {
          ticks: {
            suggestedMin: this.getEdge().min,
            suggestedMax: this.getEdge().max,
          },
        },
      ],
    },
  };

  getEdge(): any {
    const newData: any[] = this.lineChartData[0].data;
    newData.map(val => {
      return parseInt(val);
    });
    const min: number = parseInt(Math.min(...newData).toFixed(0)) - 2;
    const max: number = parseInt(Math.max(...newData).toFixed(0)) + 2;
    console.log('min', min);
    console.log('max', max);
    return { min: min, max: max };
  }

  constructor() {}

  ngOnInit() {
    for (let i = 0; i < 15; i++) {
      this.lineChartLabels.push(i.toString() + ':00');
    }
    this.getEdge();
  }
}
