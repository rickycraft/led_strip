import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { WeatherService } from '../services/weather.service';
import { MatDatepickerInputEvent } from '@angular/material';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  constructor(private weatherService: WeatherService) {
    // weatherService.getAvgH(new Date('2019-04-22'));
  }

  startDate: Date;
  endDate: Date;
  chart: any = [];

  changeDate(isStart: boolean, event: MatDatepickerInputEvent<Date>) {
    if (isStart) {
      if (this.endDate && event.value > this.endDate) {
        this.endDate = event.value;
      }
      this.startDate = event.value;
    } else {
      this.endDate = event.value;
    }
  }

  search() {
    // send a search request to the server using the service
    console.log('search');
  }

  ngOnInit() {
    const chartLabels = [];
    for (let i = 0; i < 24; i++) {
      chartLabels.push(i.toString() + ':00');
    }

    Chart.defaults.global.legend.display = false;
    Chart.defaults.global.aspectRatio = 2.2;
    Chart.defaults.global.responsive = true;
    Chart.defaults.global.elements.line.fill = false;

    this.chart = new Chart('temps', {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: [1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1],
            borderColor: '#3cba9f',
            label: 'test label'
          },
          {
            data: [1, 2, 3, 4, 5],
            borderColor: '#ffcc00'
          },
        ],
      },
      options: {
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
