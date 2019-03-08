//bottom navbar component
import { ColorService } from 'src/app/color.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Led } from '../led';
import { Observable, Subject} from 'rxjs';
import { debounceTime } from 'rxjs/operators';

//rgb component
@Component({
    selector: 'bottom-navbar',
    templateUrl: './bottom.component.html',
  })
  
export class BottomComponent implements OnInit, OnDestroy{
  
  @Input() lux: number;
  @Input() ew: boolean;
  debouncer: Subject<any> = new Subject();

  ngOnInit(){
    this.debouncer.pipe(debounceTime(500)).subscribe(event => {
      this.colorService.setLux(this.lux);
    });
  }

  ngOnDestroy(){
    console.log('unsubscribe');
    this.debouncer.unsubscribe();
  }

  constructor(private colorService : ColorService){
    this.colorService.status$
      .subscribe(data => {
        this.lux = data.lux;
        this.ew = data.ew;
      })
  }

  toggleEw(){
    this.ew = !this.ew;
    this.colorService.setEw(this.ew);
  }

  hasUpdated(event: any){
    this.lux = event.value;
    this.debouncer.next(event);
  }
}