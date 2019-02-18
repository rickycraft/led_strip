//bottom navbar component
import { ColorService } from 'src/app/color.service';
import { Component, Input } from '@angular/core';

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

  setLux(): void{
    this.colorService.setLux(this.lux)
      .subscribe( res => {
        this.lux = res;
      })
  }
}