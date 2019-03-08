//service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Led } from './led';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators'

const base_url = 'http://192.168.1.110:3000';

@Injectable()
export class ColorService {

    readonly root_url = 'http://192.168.1.110:3000';
    
    private status = new BehaviorSubject(new Led);
    status$: Observable<Led> = this.status.asObservable();

    constructor(private http: HttpClient, private route: Router){}

    getStatus(){
        this.http.get<Led>(base_url+'/status')
            .subscribe( data => {
                this.status.next(data);
            });
    }

    setLed(data: Led){
        console.log("set led ", data);
        this.http.post<Led>(this.root_url+'/rgb', data)
            .subscribe( data => {
                this.status.next(data);
            })
    }

    setColor( color, value: number){
        console.log("set color", color , value);
        let tmp = {};
        tmp[color] = value;
        this.http.post<Led>(this.root_url+'/rgb', tmp)
            .subscribe( data => {
                this.status.next(data);
            })
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
