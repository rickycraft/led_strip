// angular import
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
} from '@angular/material';
import 'hammerjs';

// app component
import { AppComponent } from './app.component';
import { ColorsComponent } from './tabs/color/color.component';
import { BottomComponent } from './bottom/bottom.component';
// app services
import { ColorService } from './services/color.service';
import { LampService } from './services/lamp.service';
import { AmbientService } from './services/ambient.service';

const routes = [
  // {path:"", component:PostComponent}
];

@NgModule({
  declarations: [AppComponent, ColorsComponent, BottomComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    HttpModule,
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
  ],
  providers: [ColorService, LampService, AmbientService],
  bootstrap: [AppComponent],
})
export class AppModule {}
