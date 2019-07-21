// service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Sensor } from '../classes/sensor';
import { environment } from '../../environments/environment';

@Injectable()
export class WeatherService {
  sensor: BehaviorSubject<Sensor[]> = new BehaviorSubject([new Sensor()]);

  constructor(private http: HttpClient) {}

  getAvgH(startDate: Date, endDate: Date) {
    this.http
      .post<Sensor[]>(environment.apiUrl + '/weather/avgH', {
        start: startDate,
        end: endDate,
      })
      .subscribe(
        data => {
          this.sensor.next(data);
        },
        error => {
          console.error('weather service ', error);
        }
      );
  }
}
