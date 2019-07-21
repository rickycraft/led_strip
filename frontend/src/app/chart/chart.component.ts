import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';
import { WeatherService } from '../services/weather.service';
import { MatDatepickerInputEvent } from '@angular/material';
import { Sensor } from '../classes/sensor';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  dataset: Sensor[];
  startDate: Date;
  endDate: Date;
  chart: any = [];

  @ViewChild('temps', { static: true }) temps: ElementRef;

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.createChart();
    this.weatherService.sensor.subscribe(val => {
      this.dataset = val;
      this.updateChart();
    });
  }

  changeDate(isStart: boolean, event: MatDatepickerInputEvent<Date>) {
    if (isStart) {
      if (event.value > this.endDate || !this.endDate) {
        this.endDate = event.value;
      }
      this.startDate = event.value;
    } else {
      this.endDate = event.value;
    }
  }

  search() {
    // send a search request to the server using the service
    console.log('searching');
    this.weatherService.getAvgH(this.startDate, this.endDate);
  }

  updateChart() {
    this.chart.data.datasets.forEach(datasets => {
      datasets.data = this.dataset;
    });
    console.log(this.chart.data.datasets[0].data);
    this.chart.update();
  }

  createChart() {
    const chartLabels = [];
    for (let i = 0; i < 24; i++) {
      chartLabels.push(i.toString() + ':00');
    }

    Chart.defaults.global.legend.display = false;
    Chart.defaults.global.aspectRatio = 2.5;
    Chart.defaults.global.responsive = true;
    Chart.defaults.global.elements.line.fill = false;

    const ctx = this.temps.nativeElement.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: [1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1],
            borderColor: '#3cba9f',
            label: 'test label',
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
