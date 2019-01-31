//angular import
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule} from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatButtonModule,
  MatSliderModule,
  MatListModule,
  MatIconModule
} from '@angular/material';
import { MatToolbarModule } from '@angular/material/toolbar';
import 'hammerjs';

//app component
import { AppComponent } from './app.component';
import { ColorService } from './color.service';
import { RgbComponent } from "./tabs/rgb/rgb.component";
import { ColorsComponent } from './tabs/color/color.component';
import { BottomComponent } from './bottom/bottom.component';


const routes = [
  //{path:"", component:PostComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    RgbComponent,
    ColorsComponent,
    BottomComponent
  ],
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
    MatToolbarModule
  ],
  providers: [ColorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
