//service
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class ColorService {
    
    constructor(private http: HttpClient, private route: Router){}

}
