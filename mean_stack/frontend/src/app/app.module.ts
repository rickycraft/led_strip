//angular import
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  MatButtonModule
} from '@angular/material';

//app component
import { AppComponent } from './app.component';
import { ColorService } from './services/color.service';
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
    RgbComponent,
    ColorsComponent,
    MatButtonModule
  ],
  providers: [ColorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
