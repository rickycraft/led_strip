import { Led } from './led';
export class Colors{
    red: number;
    green: number;
    blu: number;

    static fuchsia(): Colors{
        return new Colors(25,0,25);
    }

    static yellow(): Colors{
        return new Colors(25,25,0);
    }

    static cyan(): Colors{
        return new Colors(0,25,25);
    }

    static purple(): Colors{
        return new Colors(13,0,13);
    }

    static warm(): Colors{
        return new Colors(25,10,0);
    }

    static cold(): Colors{
        return new Colors(10,20,25);
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