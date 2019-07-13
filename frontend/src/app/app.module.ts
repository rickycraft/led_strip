// angular import
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import 'hammerjs';

// app component
import { AppComponent } from './app.component';
import { BottomComponent } from './bottom/bottom.component';
import { ChartComponent } from './chart/chart.component';
import { LedComponent } from './led/led.component';
// app services
import { ColorService } from './services/color.service';
import { LampService } from './services/lamp.service';
import { AmbientService } from './services/ambient.service';
import { EwService } from './services/elwire.service';
import { WeatherService } from './services/weather.service';
// all material modules
import { MAT_DATE_LOCALE } from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MaterialModule } from './material.module';

const routes: Routes = [
  { path: 'chart', component: ChartComponent },
  { path: 'led', component: LedComponent },
  { path: '', component: LedComponent },
  { path: '**', component: LedComponent },
];

@NgModule({
  declarations: [AppComponent, BottomComponent, ChartComponent, LedComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { useHash: true }),
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
    MatMomentDateModule,
    MaterialModule,
  ],
  providers: [
    ColorService,
    LampService,
    AmbientService,
    EwService,
    WeatherService,
    {provide: MAT_DATE_LOCALE, useValue: 'it-IT'}],
  bootstrap: [AppComponent],
})
export class AppModule {}
