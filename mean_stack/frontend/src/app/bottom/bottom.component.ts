//bottom navbar component
import { ColorService } from 'src/app/color.service';
import { Component } from '@angular/core';

//rgb component
@Component({
    selector: 'app-tab',
    template: `
    <h1>
      Welcome to {{ title }}!
    </h1>
    `
  })
  
export class BottomComponent {
    constructor(private colorService : ColorService){}
    title = 'bottom component';
  }