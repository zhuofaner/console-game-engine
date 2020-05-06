import * as ansi from "ansi";
let cursor:ansi.Cursor = ansi(process.stdout);
import { format, console, intersectRects } from "../basic/Utils";
import { Picture } from "../basic/Picture";
import { PictureNumber } from "../basic/PictureNumber";
import { PictureChar } from "../basic/PictureChar";
import  UIResponder  from "../basic/UIResponder";
import VelocityVector from "../basic/VelocityVector";
import { LoopSound } from "../basic/LoopSound";
import LayerManager from "../basic/LayerManager";
import AnimationSystem from "../basic/AnimationSystem";
import { stdout, stdin } from "process";
import { ConsolePicture } from "../basic/Console";

// const SND_MILLSEC = new LoopSound("./res/sound/mill_second.mp3").loop();
const SND_SEC = new LoopSound("./res/sound/click_second.mp3");
const SND_COLLIDE = new LoopSound("./res/sound/collide.mp3");
const SCREEN = new UIResponder();

if("setRawMode" in stdin){
  stdin.setRawMode(true);
}
stdin.setEncoding('utf8');

Picture.configRes();

const DATE_NOW = new Date();
const DATE_FORMATTER = "hh:mm:ss.SS";
const SecondCounter = new PictureChar(format(DATE_NOW, DATE_FORMATTER));
const NumberVV = AnimationSystem.createVelocityVector({x: 1, y: 1}, 15).setPosition(1, 1);
// SecondCounter.setAnimation(NumberVV);
NumberVV.setOnMoveListener((vv:VelocityVector)=>{
    if(vv.target){
      //读秒
      let c_date = new Date();
      (<PictureChar>vv.target).string = format(c_date, DATE_FORMATTER);
      //边界检测
      if(vv.y + vv.target.height >= (SCREEN.rows+15) ||
        vv.y <= -15){
          console.log("Reach bottom or top!!!");
          SND_COLLIDE.loop();
          vv.vector = { x: vv.vector.x, y: - vv.vector.y };
      }else
      if(vv.x + vv.target.width >= (SCREEN.columns+30) ||
        vv.x <= -30){
          console.log("Reach left or Right!!!");
          SND_COLLIDE.loop();
          vv.vector = { x: - vv.vector.x, y: vv.vector.y };
      }
  }
});

const FRAME = 100;
let lastSec = 0;
let point = { x: 101, y: 30 };
SCREEN.clear();
LayerManager.load()
  .renderGrid()
  .add(SecondCounter)
  .render();
console.tag("rect").tag("dirt").add("rect").tag("render");
startCounting();
function startCounting(){
  setInterval(()=>{
    let c_date = new Date();
    let date_str = format(c_date, DATE_FORMATTER);
    console.log("date_str:", date_str);
    SecondCounter.string = date_str;
    SecondCounter.render();// 触发手动渲染
  
    // 利用控制台测试脏矩形
    let dirts = ConsolePicture.getInstance().layerInfo.layer.giveRects()
      .map(rect=>{
        let rest = intersectRects(rect, SecondCounter.rect);
        return rest;
      });
    console.log("dirt:", "Draw", dirts);
    LayerManager.load().drawDirtRects(dirts);
  
  }, FRAME);
}

cursor.bg.reset();
cursor.reset();