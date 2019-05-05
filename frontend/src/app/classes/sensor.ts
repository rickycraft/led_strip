export class Sensor {
  temp: number;
  bar: number;
  humi: number;

  constructor() {
    this.temp = 0;
    this.bar = 1000;
    this.humi = 0;
  }
}
