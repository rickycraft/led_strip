import { ColorService } from 'src/app/color.service';
import { Component } from '@angular/core';

//rgb component
@Component({
    selector: 'app-rgb',
    template: `
    <h1>
      Welcome to {{ title }}!
    </h1>
    `
  })
  export class RgbComponent {
    constructor(private colorService : ColorService){}
    title = 'rgb';
  }
  