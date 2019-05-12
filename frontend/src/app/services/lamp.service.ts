// service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Lamp } from '../classes/lamp';
import { MatSnackBar } from '@angular/material';
import { environment } from '../../environments/environment';

@Injectable()
export class LampService {
  readonly device = '/lamp';
  readonly snackErrorTime: number = 2000;

  lamp = new BehaviorSubject(new Lamp());

  constructor(private http: HttpClient, private route: Router, private snackBar: MatSnackBar) {}

  setLamp() {
    this.http.get<Lamp>(environment.apiUrl + this.device + '/toggle').subscribe(
      data => {
        this.lamp.next(data);
      },
      error => {
        this.openSnack(error.name);
      }
    );
  }

  getStatus() {
    this.http.get<Lamp>(environment.apiUrl + this.device + '/status').subscribe(
      data => {
        this.lamp.next(data);
      },
      error => {
        this.openSnack(error.name);
      }
    );
  }

  setLux(val: number) {
    this.http.post<Lamp>(environment.apiUrl + this.device + '/lux', { lux: val }).subscribe(
      data => {
        this.lamp.next(data);
      },
      error => {
        this.openSnack(error.name);
      }
    );
  }

  openSnack(message: string) {
    this.snackBar.open(message, 'LAMP', {
      duration: this.snackErrorTime,
    });
  }
}
