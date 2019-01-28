export class Led {
    red: number;
    green: number;
    blu: number;
    lux: number;
    ew: boolean;

    constructor(red: number, green: number,blu: number,lux: number,ew: boolean,){
      this.red = red;
      this.green = green;
      this.blu = blu;
      this.lux = lux;
      this.ew = ew;
    }
  }