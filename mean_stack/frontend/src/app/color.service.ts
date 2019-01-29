//service
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Led } from './led';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

const base_url = 'http://192.168.1.110:3000';

@Injectable()
export class ColorService {

    readonly root_url = 'http://192.168.1.110:3000';
    
    private status: Led;

    constructor(private http: HttpClient, private route: Router){}

    getStatus(): Observable<Led> {
        return this.http.get<Led>(base_url+'/status');
    }

    setLed(data: Led): Observable<Led>{
        return this.http.post<Led>(this.root_url+'/rgb', data);
    }
   
}
