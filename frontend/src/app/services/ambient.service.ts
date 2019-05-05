// service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { Lamp } from '../classes/lamp';

const base_url = 'http://192.168.1.110:3000';

@Injectable()
export class AmbientService {
  readonly device = '/ambient';

  ambient: BehaviorSubject<Lamp> = new BehaviorSubject(new Lamp());

  constructor(private http: HttpClient) {}

  setLamp() {
    this.http.get<Lamp>(base_url + this.device + '/toggle').subscribe(
      data => {
        this.ambient.next(data);
      },
      error => {
        console.log('ambient service error ', error);
      }
    );
  }

  getStatus() {
    this.http.get<Lamp>(base_url + this.device + '/status').subscribe(
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
    this.http.post<Lamp>(base_url + this.device + '/lux', { lux: val }).subscribe(
      data => {
        this.ambient.next(data);
      },
      error => {
        console.log('ambient service error ', error);
      }
    );
  }
}
