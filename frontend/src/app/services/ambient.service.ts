// service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Lamp } from '../classes/lamp';
import { environment } from '../../environments/environment';

@Injectable()
export class AmbientService {
  readonly device = '/ambient';
  ambient: BehaviorSubject<Lamp> = new BehaviorSubject(new Lamp());

  constructor(private http: HttpClient) {}

  setLamp() {
    this.http.get<Lamp>(environment.apiUrl + this.device + '/toggle').subscribe(
      data => {
        this.ambient.next(data);
      },
      error => {
        console.log('ambient service error ', error);
      }
    );
  }

  getStatus() {
    this.http.get<Lamp>(environment.apiUrl + this.device + '/status').subscribe(
      data => {
        this.ambient.next(data);
      },
      error => {
        // console.log('ambient service error ', error);
        this.ambient.error(error);
      }
    );
  }

  setLux(val: number) {
    this.http.post<Lamp>(environment.apiUrl + this.device + '/lux', { lux: val }).subscribe(
      data => {
        this.ambient.next(data);
      },
      error => {
        console.log('ambient service error ', error);
      }
    );
  }
}
