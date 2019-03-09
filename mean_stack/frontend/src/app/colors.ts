import { Led } from './led';
export class Colors{
    red: number;
    green: number;
    blu: number;

    static pink(): Colors{
        return new Colors(25,0,25);
    }

    static yellow(): Colors{
        return new Colors(25,25,0);
    }

    static white(): Colors{
        return new Colors(25,25,25);
    }

    setColor(r: number, g: number, b: number){
        this.red = r;
        this.green = g;
        this.blu = b;
    }

    constructor(r: number, g: number, b: number){
        this.setColor(r,g,b);
    }
}