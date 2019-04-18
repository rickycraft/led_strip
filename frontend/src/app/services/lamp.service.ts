// service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { Lamp } from '../classes/lamp';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class LampService {
  readonly base_url = 'http://192.168.1.110:3000';
  readonly device = '/lamp';
  readonly snackErrorTime: number = 2000;

  lamp = new BehaviorSubject(new Lamp());

  constructor(private http: HttpClient, private route: Router, private snackBar: MatSnackBar) {}

  setLamp() {
    this.http.get<Lamp>(this.base_url + this.device + '/toggle').subscribe(
      data => {
        this.lamp.next(data);
      },
      error => {
        this.openSnack(error.name);
      }
    );
  }

  getStatus() {
    this.http.get<Lamp>(this.base_url + this.device + '/status').subscribe(
      data => {
        this.lamp.next(data);
      },
      error => {
        this.openSnack(error.name);
      }
    );
  }

  setLux(val: number) {
    this.http.post<Lamp>(this.base_url + this.device + '/lux', { lux: val }).subscribe(
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
