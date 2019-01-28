//angular import
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule} from '@angular/http';
import {
  MatButtonModule,
  MatSliderModule,
  MatListModule
} from '@angular/material';
import 'hammerjs';

//app component
import { AppComponent } from './app.component';
import { ColorService } from './color.service';
import { RgbComponent } from "./tabs/rgb/rgb.component";
import { ColorsComponent } from './tabs/color/color.component';


const routes = [
  //{path:"", component:PostComponent}
]

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    HttpModule,
    FormsModule,
    MatButtonModule,
    MatListModule,
    MatSliderModule
  ],
  providers: [ColorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
