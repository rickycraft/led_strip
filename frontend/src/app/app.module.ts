// angular import
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatButtonModule,
  MatSliderModule,
  MatListModule,
  MatIconModule,
  MatTabsModule,
  MatToolbarModule,
  MatCardModule,
  MatMenuModule,
  MatSnackBarModule,
} from '@angular/material';
import 'hammerjs';

// app component
import { AppComponent } from './app.component';
import { BottomComponent } from './bottom/bottom.component';
import { ChartComponent } from './chart/chart.component';
// app services
import { ColorService } from './services/color.service';
import { LampService } from './services/lamp.service';
import { AmbientService } from './services/ambient.service';
import { EwService } from './services/elwire.service';
import { ChartsModule } from 'ng2-charts';

const routes: Routes = [{ path: 'chart', component: ChartComponent }];

@NgModule({
  declarations: [AppComponent, BottomComponent, ChartComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    HttpModule,
    ChartsModule,
    FormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatListModule,
    MatSliderModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatTabsModule,
    MatMenuModule,
    MatSnackBarModule,
  ],
  providers: [ColorService, LampService, AmbientService, EwService],
  bootstrap: [AppComponent],
})
export class AppModule {}
