// bottom navbar component
import { ColorService } from 'src/app/services/color.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Led } from '../classes/led';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LampService } from '../services/lamp.service';
import { Lamp } from '../classes/lamp';
import { AmbientService } from '../services/ambient.service';

// rgb component
@Component({
  selector: 'bottom-navbar',
  templateUrl: './bottom.component.html',
  styleUrls: ['./bottom.component.css'],
})
export class BottomComponent implements OnInit, OnDestroy {
  lux: number;
  isFading = false;
  isAvailable = {
    rgb: false,
    ambient: false,
  };

  lamp: Lamp = new Lamp();
  ambient: Lamp = new Lamp();

  luxDebouncer: Subject<any> = new Subject();
  lampDebouncer: Subject<any> = new Subject();
  ambientDebouncer: Subject<any> = new Subject();

  constructor(
    private colorService: ColorService,
    private lampService: LampService,
    private ambientService: AmbientService
  ) {
    this.colorService.status.subscribe(
      data => {
        this.lux = data.lux;
        this.isAvailable.rgb = true;
      },
      error => {
        console.log('rgb not aviable');
        this.isAvailable.rgb = false;
      }
    ); // only update the value we want
    this.lampService.lamp.subscribe(data => {
      this.lamp = data;
    });
    this.ambientService.ambient.subscribe(
      data => {
        this.ambient = data;
        this.isAvailable.ambient = true;
      },
      error => {
        console.log('ambient error aviable');
        this.isAvailable.ambient = false;
      }
    );
    this.isAvailable.ambient = false;
    this.isAvailable.rgb = false;
  }

  ngOnInit() {
    // subscribe to debouncer for sliders
    this.luxDebouncer
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(event => {
        this.colorService.setLux(event.value);
      });
    this.lampDebouncer
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      ) // send only after 200ms of not moving of the slider
      .subscribe(event => {
        this.lampService.setLux(event.value);
      });
    this.ambientDebouncer
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(event => {
        this.ambientService.setLux(event.value);
      });
    // getting status to check if available
  }

  ngOnDestroy() {
    console.log('unsubscribe');
    this.luxDebouncer.unsubscribe(); // to prevent data leakege
    this.lampDebouncer.unsubscribe();
    this.ambientDebouncer.unsubscribe();
  }

  toggleLamp() {
    this.lampService.setLamp();
  }

  lampSlider(event: any) {
    this.lampDebouncer.next(event);
  }

  toggleAmbient() {
    this.ambientService.setLamp();
  }

  ambientSlider(event: any) {
    this.ambientDebouncer.next(event);
  }

  isLedOn() {
    return this.lux > 0 ? true : false;
  }

  ledSlider(event: any) {
    this.luxDebouncer.next(event);
  }

  toggleFade() {
    console.log('toggle fade');
    this.isFading = !this.isFading;
  }
}
