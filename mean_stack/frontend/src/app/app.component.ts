import { Component, OnInit } from '@angular/core';
import { ColorService } from './color.service';
import { Led } from './led';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
/*
reactiveform to change dinamically the values as i move the values on the slider
debounce operator
*/
export class AppComponent {
  constructor(private colorService : ColorService){
    this.status = new Led(0,0,0,0,false);
  }

  status: Led;

  ngOnInit(){
    this.getStatus();
  }

  getStatus(){
    this.colorService.getStatus()
      .subscribe( (res) => {
        this.status = res;
        console.log(res);
      });
  }

  setLed(){
    this.colorService.setLed(this.status)
      .subscribe( res => {
        this.status = res;
      });
  }

  getStatusValues(){
    return Object.values(this.status);
  }

  title = 'frontend';
}
