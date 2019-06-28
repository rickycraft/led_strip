import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
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

  chart: any = [];

  ngOnInit() {
    const chartLabels = [];
    for (let i = 0; i < 24; i++) {
      chartLabels.push(i.toString() + ':00');
    }

    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: [1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1],
            borderColor: '#3cba9f',
            fill: false,
          },
          {
            data: [1, 2, 3, 4, 5],
            borderColor: '#ffcc00',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        aspectRatio: 1.7,
        legend: {
          display: false,
        },
        scales: {
          yAxes: [
            {
              ticks: {
                suggestedMin: 0,
                suggestedMax: 10,
              },
            },
          ],
        },
      },
    });
  }
}
