import { stdout, stdin } from "process";
import { LoopSound } from "./basic/LoopSound";

// stdin.setRawMode(true);
stdin.setEncoding('utf8');
console.log("stdin:",stdin);
console.log("stdout:",stdout);

let mp3loader = require("audio-loader");
let mp3play = require("audio-play");
// const sound = require("sound-play");
// sound.play("./res/sound/csgo_trailer.mp3").then(promise=>console.log(promise));
let DuLoop = new LoopSound("./res/sound/du.mp3");
DuLoop.loop(5);
// let dusoundstop = false;
// function soundplay(){
//     sound.play("./res/sound/du.mp3").then(
//         promise=>soundplay());
// }

// soundplay();

mp3loader("./res/sound/du.mp3").then(res=>{
    console.log(res)
    mp3play(res);
});
// stdout.on('resize', () => {
//     console.log('screen size has changed!');
//     console.log(`${process.stdout.columns}x${process.stdout.rows}`);
//   });

stdin.addListener('data', data => {
    console.log(data);
    if(<any>data === `${'\u001b'}[A`){
        console.log("rows:",stdout.rows);
        console.log("columns:",stdout.columns);       
        if(DuLoop.isplaying){
            DuLoop.pause();
        }else{
            DuLoop.loop();
        }
    }else
    if(<any>data === `${'\u001b'}[D`){
        console.log("rows:",stdout.rows);
        console.log("columns:",stdout.columns);       
        if(!DuLoop.isplaying){
            DuLoop.loop(5);
        }
    }
});

// console.log("rows:",stdout.rows);
// console.log("columns:",stdout.columns);