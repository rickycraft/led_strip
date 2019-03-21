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

  readonly debounceTime: number = 900;

  status: Led;
  lamp: Lamp;
  colorDebouncer: Subject<any> = new Subject();
  lampDebouncer: Subject<any> = new Subject();

  constructor(private colorService : ColorService, private lampService: LampService){
    this.status = new Led();
    this.lamp = new Lamp();
    this.colorService.status$.subscribe( data => {
      this.status = data;
    })
    /*
    this.lampService.lamp$.subscribe( data => {
      this.lamp = data;
    })
    */
  }

  ngOnInit(){
    this.colorService.getStatus();
    this.lampService.getStatus();
    this.colorDebouncer.pipe(debounceTime(this.debounceTime)).subscribe(event => {
      this.colorService.setLed(this.status);
    });
    this.lampDebouncer.pipe(debounceTime(this.debounceTime), distinctUntilChanged()).subscribe(event => {
      this.lampService.setLux(event.value);
    });
  }

  setColor(event: any, color: string){
    this.status[color] = event.value;
    this.colorDebouncer.next(event);
  }
}
