//service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Led } from '../classes/led';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators'
import { Colors } from '../classes/colors';
import { Lamp } from '../classes/lamp';

const base_url = 'http://192.168.1.110:3000';

@Injectable()
export class LampService {

    readonly root_url = 'http://192.168.1.110:3000';
    
    private lamp = new BehaviorSubject(new Lamp);
    lamp$: Observable<Lamp> = this.lamp.asObservable();
    private lamp_val: Lamp = new Lamp();

    constructor(private http: HttpClient, private route: Router){
        this.lamp$.subscribe( data => {
            this.lamp_val = data;
          })
    }

    setLamp(){
        this.http.get<Lamp>(base_url+'/lamp')
            .subscribe( data => {
                this.lamp.next(data);
            }, error => {
                console.log("Error ", error);
            });
    }

    getStatus(){
        this.http.get<Lamp>(base_url+'/lamp/status')
            .subscribe( data => {
                this.lamp.next(data);
            }, error => {
                console.log("Error ", error);
            });
    }

    setLux(val: number){
        this.http.post<Lamp>(base_url+'/lamp/lux', { lux: val })
            .subscribe( data => {
                this.lamp.next(data);
            }, error => {
                console.log("Error ", error);
            });
    }
}
