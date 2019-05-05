// service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Sensor } from '../classes/sensor';

const base_url = 'http://192.168.1.110:3000';

@Injectable()
export class WeatherService {
  sensor: BehaviorSubject<Sensor[]> = new BehaviorSubject([new Sensor()]);

  constructor(private http: HttpClient) {}

  getAvgH(date: Date) {
    this.http
      .post<Sensor[]>(base_url + '/weather/avgH/a', {
        year: date.getFullYear(),
        month: date.getMonth() + 1, // Start from 0 in JS
        day: date.getDate(),
      })
      .subscribe(
        data => {
          this.sensor.next(data);
          console.log(data);
        },
        error => {
          console.log('weather service ', error);
        }
      );
  }

  getAvgType(date: Date, type: String): number[] {
    this.getAvgH(date);
    let res: number[];
    switch (type) {
      case 't':
        res = this.sensor.value.map(data => data.temp);
        break;
      case 'h':
        res = this.sensor.value.map(data => data.humi);
        break;
      case 'b':
        res = this.sensor.value.map(data => data.bar);
        break;
    }
    return res;
  }

  getAvg(date: Date) {}
}
