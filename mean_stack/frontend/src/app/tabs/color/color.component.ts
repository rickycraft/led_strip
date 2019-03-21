//color component
import { ColorService } from 'src/app/services/color.service';
import { Component } from '@angular/core';

//rgb component
@Component({
    selector: 'app-color',
    templateUrl: './color.component.html'
  })
  export class ColorsComponent {
    constructor(private colorService : ColorService){}
    title = 'colors';
  }