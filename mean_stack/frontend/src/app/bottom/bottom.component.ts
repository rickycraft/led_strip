//bottom navbar component
import { ColorService } from 'src/app/services/color.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Led } from '../classes/led';
import { Observable, Subject} from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LampService } from '../services/lamp.service';
import { Lamp } from '../classes/lamp';

//rgb component
@Component({
    selector: 'bottom-navbar',
    templateUrl: './bottom.component.html',
    styleUrls: ['./bottom.component.css'],
  })
  
export class BottomComponent implements OnInit, OnDestroy{
  
  @Input() lux: number;
  lamp: Lamp = new Lamp();
  isFading: boolean = false;
  luxDebouncer: Subject<any> = new Subject();
  lampDebouncer: Subject<any> = new Subject();

  constructor(private colorService : ColorService, private lampService: LampService){
    this.colorService.status$.subscribe(data => { this.lux = data.lux; }); //only update the value we want
    this.lampService.lamp$.subscribe(data => {
      if (!data.status){  //FIX UNTIL UPDATE OF ARDUINO CODE
        this.lamp.lux = 0;
      } else {
        this.lamp.lux = data.lux;
      }
      this.lamp.status = data.status;
    });
  }

  ngOnInit(){
    this.luxDebouncer.pipe(debounceTime(200),distinctUntilChanged())
      .subscribe(event => { this.colorService.setLux(event.value); });
    this.lampDebouncer.pipe(debounceTime(200),distinctUntilChanged()) //send only after 200ms of not moving of the slider
      .subscribe( event => { this.lampService.setLux(event.value); });

    this.colorService.getStatus();
  }

  ngOnDestroy(){
    console.log('unsubscribe');
    this.luxDebouncer.unsubscribe(); //to prevent data leakege
    this.lampDebouncer.unsubscribe();
  }

  toggleLamp(){
    this.lampService.setLamp();
  }

  lampSlider(event: any){
    this.lampDebouncer.next(event);
  }

  isLedOn(){
    return (this.lux > 0)? true : false;
  }

  ledSlider(event: any){
    this.luxDebouncer.next(event);
  }

  toggleFade(){
    console.log("toggle fade");
    this.isFading = !this.isFading;
  }
}