// service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { ElWire } from '../classes/elwire';

const base_url = 'http://192.168.1.110:3000';

@Injectable()
export class EwService {
  readonly device = '/ew';

  private ew = new BehaviorSubject(new ElWire());
  ew$: Observable<ElWire> = this.ew.asObservable();

  constructor(private http: HttpClient, private route: Router) {}

  setEw(status: boolean) {
    const route = status ? '/on' : '/off';
    this.http.get<ElWire>(base_url + this.device + route).subscribe(
      data => {
        this.ew.next(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  getStatus() {
    this.http.get<ElWire>(base_url + this.device + '/status').subscribe(data => {
      this.ew.next(data);
    });
  }
}
