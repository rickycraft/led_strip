//service
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Led } from './led';
import { Observable } from 'rxjs';

@Injectable()
export class ColorService {

    readonly root_url = 'http://192.168.1.110:3000';
    
    constructor(private http: HttpClient, private route: Router){}

    getStatus() {
        let status =  this.http.get(this.root_url+'/status');
        status.subscribe( (res) => {
            console.log(res);
            return res;
        })
    }

    setLed(data: Led){
        this.http.post(this.root_url+'/rgb', data);
    }
   
}
