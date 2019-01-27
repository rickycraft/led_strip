//color component
import { ColorService } from 'src/app/color.service';
import { Component } from '@angular/core';

//rgb component
@Component({
    selector: 'app-colors',
    template: `
    <h1>
      Welcome to {{ title }}!
    </h1>
    `
  })
  export class ColorsComponent {
    constructor(private colorService : ColorService){}
    title = 'colors';
  }