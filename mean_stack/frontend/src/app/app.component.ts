import { Component, OnInit } from '@angular/core';
import { ColorService } from './color.service';
import { Led } from './led';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
  <div style="text-align:center">
  <h1>
    Welcome to {{ title?.ciao }}!
  </h1>
  <button (click)="getStatus()">GetStatus</button>
  <ul>
    <li>{{ status?.red }} </li>
    <li>{{ status?.green }} </li>
    <li>{{ status?.blu }} </li>
    <li>{{ status?.lux }} </li>
  </ul>
  </div>
  `
})
export class AppComponent {
  constructor(private colorService : ColorService){}

  status: Led;

  getStatus(){
    let status$ = this.colorService.getStatus();
    status$.subscribe( (status) => {
      this.status = status;
      console.log(status);
    })
  }

  title = 'frontend';
}
