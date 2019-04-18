import { Colors } from './colors';
export class Led {
  red: number;
  green: number;
  blu: number;
  lux: number;

  constructor() {
    this.red = 0;
    this.green = 0;
    this.blu = 0;
    this.lux = 0;
  }

  public setColor(color: Colors): void {
    this.red = color.red;
    this.green = color.green;
    this.blu = color.blu;
  }

  public test() {
    console.log('test');
  }
}
