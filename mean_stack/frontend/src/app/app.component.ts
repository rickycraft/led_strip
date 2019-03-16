import { Component, OnInit } from '@angular/core';
import { ColorService } from './color.service';
import { Led } from './led';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LampService } from './lamp.service';
import { Lamp } from './lamp';

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
  lamp: Lamp = new Lamp();
  colorDebouncer: Subject<any> = new Subject();
  lampDebouncer: Subject<any> = new Subject();

  constructor(private colorService : ColorService, private lampService: LampService){
    this.colorService.status$.subscribe( data => {
      this.status = data;
    })
    this.lampService.lamp$.subscribe( data => {
      this.lamp = data;
    })
  }

  ngOnInit(){
    this.colorService.getStatus();
    this.lampService.getStatus();
    this.colorDebouncer.pipe(debounceTime(200), distinctUntilChanged()).subscribe(event => {
      this.colorService.setColor(event.color, event.value);
    });
    this.lampDebouncer.pipe(debounceTime(200), distinctUntilChanged()).subscribe(event => {
      this.lampService.setLux(event.value);
    });
  }

  setColor(event: any, color: string){
    event.color = color;
    this.colorDebouncer.next(event);
  }

  setLampLux(event: any){
    this.lampDebouncer.next(event);
  }

  setLamp(){
    this.lampService.setLamp();
  }
}
