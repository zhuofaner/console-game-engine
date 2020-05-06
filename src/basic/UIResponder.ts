import * as ansi from "ansi";
import { stdout, stdin } from "process";
import { Stream } from "stream";
import { ReadStream, WriteStream } from "tty";
import { WrappedStream } from "./declarations";

let listeners = [];

const prefix = '\u001b';
const keys = {
  right: `${prefix}[C`,
  up: `${prefix}[A`,
  left: `${prefix}[D`,
  down: `${prefix}[B`,
  exit: '\u0003',
  space: ' '
}

export default class UIResponder {
    output: WrappedStream;
    input: ReadStream;
    cursor: ansi.Cursor;
    constructor(output = <WrappedStream>stdout, input = stdin) {
        this.output = output;
        this.input = input;

    /* 此处不知道具体的Stream子类 有待查询*/
    // (<any>this.input).setRawMode(true);
    (<any>this.input).setEncoding('utf8');

    this.cursor = ansi(this.output).hide();

    this.input.addListener('data', data => {
      let always = listeners.filter(listener => {
        return listener.key === '';
      });

      always.forEach(listener => listener.fn(data));

      let key = Object.keys(keys).find((value, i) => {
        return keys[value] === data;
      });

        if ( key === 'exit' ) {
            this.output.write('\u001b[2J\u001b[0;0H');
            process.exit();
        }

      let match = listeners.filter(listener => {
        return listener.key === key || listener.key === data;
      });

      match.forEach(listener => listener.fn(data));
    })
  }

  public get columns() {
    // for debug
    if(this.output.columns == undefined){
      return 241;
    }
    return this.output.columns;
  }

  public get rows() {
    // for debug
    if(this.output.columns == undefined){
      return 49;
    }
    return this.output.rows;
  }
  /** 清屏 */
  clear() {
    this.output.write('\u001b[2J\u001b[0;0H');
    return this;
  }

  write(content: string) {
    this.cursor.write(content);
  }
  /** 按键监听 */
  onKey(key, fn) {
    if (typeof key === 'function') {
      fn = key;
      key = '';
    }
    listeners.push({ key, fn });
  }

  public get center() {
    return {
      x: this.output.columns / 2,
      y: this.output.rows / 2
    }
  }

  line(from, to) {
    let delta = {
      x: to.x - from.x,
      y: to.y - from.y
    }

    let error = 0;

    let deltaerr = Math.abs(delta.y / delta.x);

    let { y } = from;

    for (let x = from.x; x < to.x; x++) {
      this.cursor.goto(x, y);
      this.write('.');
      error += deltaerr;

      while (error >= 0.5) {
        this.cursor.goto(x, y);
        this.write('.');
        y += Math.sign(delta.y);

        error -= 1;
      }
    }
  }
}
