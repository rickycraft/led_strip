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
export class AppComponent implements OnInit {

  status$ = this.colorService.status$;
  status: Led = new Led();

  constructor(private colorService : ColorService){
    this.status$.subscribe( data => {
      this.status = data;
    })
  }

  ngOnInit(){
    this.colorService.getStatus();
  }

  getStatus(){
    this.colorService.getStatus();  
  }

  setLed(){
    this.colorService.setLed({
        red:25,
        green:10,
        blu: 5,
        lux:10,
        ew: null
      });
  }

  getStatusValues(){ //but not lux
    let values = Object.entries(this.status);
    values.pop();
    return values;
  }
}
