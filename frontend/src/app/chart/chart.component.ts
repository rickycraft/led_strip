import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label, BaseChartDirective } from 'ng2-charts';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  constructor(private weatherService: WeatherService) {
    // weatherService.getAvgH(new Date('2019-04-22'));
  }
  public chartLabels: Label[] = [];
  public t_data: ChartDataSets[] = [
    {
      data: [10, 20],
      label: 'temp',
    },
  ];
  public t_chartColor: Color[] = [
    {
      borderColor: 'yellow',
      backgroundColor: 'rgba(255,0,0,0.5)',
    },
  ];
  public t_options: ChartOptions = {
    responsive: true,
    aspectRatio: 1.7,
    scales: {
      yAxes: [
        {
          ticks: {
          suggestedMin: 10,
          suggestedMax: 30, // this.getEdge(this.t_data[0].data).max,
          },
        },
      ],
    },
  };
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  getEdge(arr: any[]): any {
    const list: number[] = arr.map(val => {
      return parseInt(val, 10);
    });
    const min: number = parseInt( Math.min(...list).toFixed(0), 10 ) - 2;
    const max: number = parseInt( Math.max(...list).toFixed(0), 10 ) + 2;
    console.log(min);
    return { min: min, max: max };
  }

  ngOnInit() {
    for (let i = 0; i < 24; i++) {
      this.chartLabels.push(i.toString() + ':00');
    }
  }

  public updateChart(list: number[]) {
    // test values
    list = [21, 21, 22, 23, 24, 23, 22, 21, 20, 21, 22, 23, 24, 23, 22, 21, 20, 22, 25, 23, 21, 20, 22, 25];
    list.forEach( (val, i) => {
      this.t_data[0].data[i] = val;
    });
    // this.t_options.scales.yAxes[0].ticks.min
    // this.chart.options.scales.yAxes[0].ticks.suggestedMax = 28;
    this.chart.update();
    console.log('updated');
  }
}
