// service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Led } from '../classes/led';
import { Observable, BehaviorSubject } from 'rxjs';
import { Colors } from '../classes/colors';

const base_url = 'http://192.168.1.110:3000';

@Injectable()
export class ColorService {
  readonly root_url = 'http://192.168.1.110:3000';

  private status = new BehaviorSubject<Led>(new Led());
  status$: Observable<Led> = this.status.asObservable();
  private status_val: Led = new Led();

  constructor(private http: HttpClient, private route: Router) {
    this.status$.subscribe(data => {
      this.status_val = data;
    });
  }

  getStatus() {
    this.http.get<Led>(base_url + '/rgb/status').subscribe(
      data => {
        this.status.next(data);
      },
      error => {
        console.log('Get status ', error);
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
        console.log('Set led ', error);
      }
    );
  }

  setColor(color: string, value: number) {
    console.log('set color', color, value);
    const tmp = {};
    tmp[color] = value;
    this.http.post<Led>(this.root_url + '/rgb/color', tmp).subscribe(data => {
      const tmp_status = this.status_val;
      tmp_status[color] = data[color];
      this.status.next(tmp_status);
    });
  }

  setColorName(name: String) {
    // set color by name
    const curr_color: Led = this.status_val;
    switch (name.toLowerCase()) {
      case 'fuchsia':
        curr_color.setColor(Colors.fuchsia());
        break;
      case 'yellow':
        curr_color.setColor(Colors.yellow());
        break;
      case 'white':
        curr_color.setColor(Colors.white());
        break;
    }
    this.setLed(curr_color);
  }

  setLux(data: number) {
    console.log('set lux ', data);
    this.http.post<Led>(this.root_url + '/rgb/color', { lux: data }).subscribe(data => {
      this.status.next(data);
    });
  }

  toggleFade() {}
}
