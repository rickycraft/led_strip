//bottom navbar component
import { ColorService } from 'src/app/color.service';
import { Component, Input } from '@angular/core';
import { Led } from '../led';

//rgb component
@Component({
    selector: 'bottom-navbar',
    templateUrl: './bottom.component.html',
  })
  
export class BottomComponent {
  constructor(private colorService : ColorService){}
    
  @Input() lux: number;

  getLux(): void{
    this.colorService.getStatus()
      .subscribe( (res) => {
        this.lux = res.lux;
      });
  }
  
  setLed(){
    this.colorService.setLed(new Led(this.lux))
      .subscribe( res => {
        this.lux = res.lux;
      });
  }

  hasUpdated(event){
    this.lux = event.value;
    this.setLed();
    this.getLux();
  }
}