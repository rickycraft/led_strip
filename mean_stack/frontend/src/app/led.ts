export class Led {
    red: number;
    green: number;
    blu: number;
    lux: number;
    ew: boolean;

    constructor(lux?: number, red?: number, green?: number,blu?: number){
      this.red = red;
      this.green = green;
      this.blu = blu;
      this.lux = lux;
    }

  }