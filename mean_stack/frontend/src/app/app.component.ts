import { Component, OnInit } from '@angular/core';
import { ColorService } from './services/color.service';
import { Led } from './classes/led';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LampService } from './services/lamp.service';
import { AmbientService } from './services/ambient.service';
import { EwService } from './services/elwire.service';
import { ElWire } from './classes/elwire';

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
  readonly debounceTime: number = 900;

  status: Led;
  ew: ElWire;
  colorDebouncer: Subject<any> = new Subject();
  lampDebouncer: Subject<any> = new Subject();

  constructor(
    private colorService: ColorService,
    private lampService: LampService,
    private ambientService: AmbientService,
    private ewService: EwService
  ) {
    this.status = new Led();
    this.colorService.status$.subscribe(data => {
      this.status = data;
    });
    this.ewService.ew$.subscribe(data => {
      this.ew = data;
    });
  }

  ngOnInit() {
    this.colorService.getStatus();
    this.lampService.getStatus();
    this.colorDebouncer.pipe(debounceTime(this.debounceTime)).subscribe(event => {
      this.colorService.setLed(this.status);
    });
    this.lampDebouncer
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged()
      )
      .subscribe(event => {
        this.lampService.setLux(event.value);
      });
  }

  setColor(event: any, color: string) {
    this.status[color] = event.value;
    this.colorDebouncer.next(event);
  }

  toggleEw() {
    this.ewService.setEw(!this.ew.status);
  }

  update() {
    this.colorService.getStatus();
    this.lampService.getStatus();
    this.ambientService.getStatus();
  }
}
