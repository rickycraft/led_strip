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
  debouncer: Subject<any> = new Subject();

  ngOnInit(){
    //this.debouncer.next('initvalue');
    this.debouncer.pipe(debounceTime(500)).subscribe(event => {
      //console.log(event.value);
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
      })
  }

  hasUpdated(event){
    this.lux = event.value;
    this.debouncer.next(event);
  }
}