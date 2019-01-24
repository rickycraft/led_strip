//angular
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

//material
import {
  MatButtonModule
} from '@angular/material';

//app
import { AppComponent } from './app.component';

const routes = [
  //{path:"path", component:someComponent}
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot(routes),
    MatButtonModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
