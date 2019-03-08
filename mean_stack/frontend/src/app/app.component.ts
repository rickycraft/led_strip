import { Component, OnInit } from '@angular/core';
import { ColorService } from './color.service';
import { Led } from './led';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
/*
reactiveform to change dinamically the values as i move the values on the slider
debounce operator
*/
export class AppComponent implements OnInit{

  status: Led = new Led();
  debouncer: Subject<any> = new Subject();

  constructor(private colorService : ColorService){
    this.colorService.status$.subscribe( data => {
      this.status = data;
    })
  }

  ngOnInit(){
    this.colorService.getStatus();
    this.debouncer.pipe(debounceTime(200), distinctUntilChanged()).subscribe(event => {
      this.colorService.setColor( event.color, event.value);
    });
  }

  getStatus(){
    this.colorService.getStatus();  
  }

  setColor(event, color: string){
    event.color = color;
    this.debouncer.next(event);
  }

  getStatusValues(){ //but not lux
    let values = Object.entries(this.status);
    return values;
  }
}
