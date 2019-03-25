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

  private ambient = new BehaviorSubject(new Lamp());
  ambient$: Observable<Lamp> = this.ambient.asObservable();

  constructor(private http: HttpClient, private route: Router) {}

  setLamp() {
    this.http.get<Lamp>(base_url + this.device + '/toggle').subscribe(
      data => {
        this.ambient.next(data);
      },
      error => {
        console.log('Error ', error);
      }
    );
  }

  getStatus() {
    this.http.get<Lamp>(base_url + this.device + '/status').subscribe(
      data => {
        this.ambient.next(data);
      },
      error => {
        console.log('Error ', error);
      }
    );
  }

  setLux(val: number) {
    this.http
      .post<Lamp>(base_url + this.device + '/lux', { lux: val })
      .subscribe(
        data => {
          this.ambient.next(data);
        },
        error => {
          console.log('Error ', error);
        }
      );
  }
}
