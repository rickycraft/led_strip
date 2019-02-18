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

  }