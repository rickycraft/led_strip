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
  </div>
  `
})
export class AppComponent {
  constructor(private colorService : ColorService){}

  getStatus(){
    this.colorService.getStatus();
  }

  title = 'frontend';
}
