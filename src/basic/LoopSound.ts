import * as soundplay from "sound-play";
import { console } from "./Utils";
export class LoopSound{
    path: string;
    isplaying: boolean;
    looptimes: number;
    constructor(instanceOrPath: LoopSound | string){
        this.path = (<LoopSound>instanceOrPath).path || <string>instanceOrPath;
        this.isplaying = false;
        this.looptimes = -1;
    }

    play(path?: string){
        if(!this.isplaying){
            if(path){this.path = path};
            this.isplaying = true;
            soundplay.play(this.path).then(()=>this.isplaying=false);
        }
        return this;
    }

    loop(times?: number){
        this.isplaying = true;
        this.looptimes = times>0? times: this.looptimes;
        this._loop();
    }

    _loop(){
        if(this.isplaying){
            console.log("playing: loop time", this.looptimes);
            soundplay.play(this.path).then(()=>{
                if(this.looptimes > 0){
                    this.looptimes--;
                    this._loop();
                }else{
                    this.stop();
                }
            });
        }
        return this;
    }
    
    stop(){
        this.isplaying = false;
        this.looptimes = -1;
    }

    pause(){
        this.isplaying = false;
    }
}