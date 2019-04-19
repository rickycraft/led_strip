// service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Led } from '../classes/led';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { Colors } from '../classes/colors';
import { MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

const base_url = 'http://192.168.1.110:3000';

@Injectable()
export class ColorService {
  readonly root_url: string = 'http://192.168.1.110:3000';
  readonly snackErrorTime: number = 2000;

  status = new BehaviorSubject<Led>(new Led());

  constructor(private http: HttpClient, private route: Router, private snackBar: MatSnackBar) {}

  getStatus() {
    this.http.get<Led>(base_url + '/rgb/status').subscribe(
      data => {
        // console.log('led status \n', this.status.value, '\n', this.status.value);
        this.status.next(data);
      },
      error => {
        // this.openSnack(error.name);
        this.status.next(new Led());
        this.status.error(error);
      }
    );
  }

  setLed(data: Led) {
    console.log('set led ', data);
    this.http.post<Led>(this.root_url + '/rgb/color', data).subscribe(
      data => {
        this.status.next(data);
      },
      error => {
        this.openSnack(error.name);
      }
    );
  }

  setColorName(name: String) {
    // set color by name
    const curr_color: Led = this.status.getValue();
    switch (name.toLowerCase()) {
      case 'fuchsia':
        this.setColor(Colors.fuchsia());
        break;
      case 'yellow':
        this.setColor(Colors.yellow());
        break;
      case 'white':
        this.setColor(Colors.white());
        break;
      case 'warm':
        this.setColor(Colors.warm());
        break;
      case 'cyan':
        this.setColor(Colors.cyan());
        break;
    }
  }

  setLux(data: number) {
    console.log('set lux ', data);
    this.http.post<Led>(this.root_url + '/rgb/color', { lux: data }).subscribe(
      data => {
        this.status.next(data);
      },
      error => {
        this.openSnack(error.name);
      }
    );
  }

  toggleFade() {}

  openSnack(message: string) {
    this.snackBar.open(message, 'LED STRIP', {
      duration: this.snackErrorTime,
    });
  }

  setColor(color: Colors) {
    const led: Led = new Led();
    led.red = color.red;
    led.green = color.green;
    led.blu = color.blu;
    delete led.lux;
    this.setLed(led);
  }
}
