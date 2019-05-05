import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label, BaseChartDirective } from 'ng2-charts';
import { flattenStyles } from '@angular/platform-browser/src/dom/dom_renderer';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  constructor(private weatherService: WeatherService) {
    // weatherService.getAvgH(new Date('2019-04-22'));
  }
  public chartLabels: Label[] = [];
  public t_chartData: ChartDataSets[] = [
    {
      data: new Array<number>(24),
      label: 'temp',
    },
  ];
  public t_chartColor: Color[] = [
    {
      borderColor: 'yellow',
      backgroundColor: 'rgba(255,0,0,0.5)',
    },
  ];
  public t_chartOptions: ChartOptions = {
    aspectRatio: 1.7,
    scales: {
      yAxes: [
        {
          ticks: {
            suggestedMin: this.getEdge(this.t_chartData[0].data).min,
            suggestedMax: this.getEdge(this.t_chartData[0].data).max,
          },
        },
      ],
    },
  };
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  getEdge(list: any[]): any {
    const newData: any[] = list.map(val => {
      return parseInt(val);
    });
    const min: number = parseInt(Math.min(...newData).toFixed(0)) - 2;
    const max: number = parseInt(Math.max(...newData).toFixed(0)) + 2;
    return { min: min, max: max };
  }

  ngOnInit() {
    for (let i = 0; i < 24; i++) {
      this.chartLabels.push(i.toString() + ':00');
      this.t_chartData[0].data[i] = 20;
    }
    console.log(this.t_chartData[0].data);
    this.chart.update();
  }

  updateChart() {
    this.chart.update();
  }
}
