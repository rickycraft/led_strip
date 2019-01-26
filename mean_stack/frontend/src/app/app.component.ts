import { Component } from '@angular/core';
import { ColorService } from './services/color.service';

@Component({
  selector: 'app-root',
  template: `
  <div style="text-align:center">
  <h1>
    Welcome to {{ title }}!
  </h1>
  </div>
  `
})
export class AppComponent {
  constructor(private colorService : ColorService){}

  ngOnInit(){
    //on init this block gets executed
  }
  title = 'frontend';
}
