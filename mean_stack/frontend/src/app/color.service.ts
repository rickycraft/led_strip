//service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Led } from './led';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators'
import { Colors } from './colors';

const base_url = 'http://192.168.1.110:3000';

@Injectable()
export class ColorService {

    readonly root_url = 'http://192.168.1.110:3000';
    
    private status = new BehaviorSubject(new Led);
    status$: Observable<Led> = this.status.asObservable();
    private status_val: Led = new Led();

    constructor(private http: HttpClient, private route: Router){
        this.status$.subscribe( data => {
            this.status_val = data;
          })
    }

    getStatus(){
        this.http.get<Led>(base_url+'/status')
            .subscribe( data => {
                this.status.next(data);
            }, error => {
                console.log("Error ", error);
            });
    }

    setLed(data: Led){
        console.log("set led ", data);
        this.http.post<Led>(this.root_url+'/rgb', data)
            .subscribe( data => {
                this.status.next(data);
            })
    }

    setColor(color: any, value: number){
        console.log("set color", color , value);
        let tmp = {};
        tmp[color] = value;
        this.http.post<Led>(this.root_url+'/rgb', tmp)
            .subscribe( data => {
                this.status.next(data);
            })
    }

    setColorName(name: String){ //set color by name
        let curr_color: Led = this.status_val;
        switch (name) {
            case "pink":
                curr_color.setColor(Colors.pink());
                break;
            case "yellow":
                curr_color.setColor(Colors.yellow());
                break;
            case "white":
                curr_color.setColor(Colors.white());
                break;
        }
        this.setLed(curr_color);
    }
    
    setLux(data: number){
        console.log("set lux ", data);
        this.http.post<Led>(this.root_url+'/rgb', {lux: data})
            .subscribe( data => {
                this.status.next(data);
            })
    }

    setEw(data: boolean){ //TODO control of sync of data
        console.log("set ew ", data);
        this.http.get<Led>(this.root_url+'/ew')
            .subscribe( data => {
                this.status.next(data);
            })
    }
}
