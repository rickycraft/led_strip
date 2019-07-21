// service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ElWire } from '../classes/elwire';
import { environment } from '../../environments/environment';

@Injectable()
export class EwService {
  readonly device = '/ew';

  ew: BehaviorSubject<ElWire> = new BehaviorSubject(new ElWire());

  constructor(private http: HttpClient, private route: Router) {}

  setEw(status: boolean) {
    const route = status ? '/on' : '/off';
    this.http.get<ElWire>(environment.apiUrl + this.device + route).subscribe(
      data => {
        this.ew.next(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  getStatus() {
    this.http.get<ElWire>(environment.apiUrl + this.device + '/status').subscribe(data => {
      this.ew.next(data);
    });
  }
}
