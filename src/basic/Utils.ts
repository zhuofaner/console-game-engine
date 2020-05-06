import Console from "./Console";
import { stringify } from "querystring";
import { Rect } from "./declarations";
import { Z_FILTERED } from "zlib";
export function init(){
    (<any>Date.prototype).format = function(format) {
        var date = {
               "M+": this.getMonth() + 1,
               "d+": this.getDate(),
               "h+": this.getHours(),
               "m+": this.getMinutes(),
               "s+": this.getSeconds(),
               "q+": Math.floor((this.getMonth() + 3) / 3),
               "S+": this.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
               format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in date) {
               if (new RegExp("(" + k + ")").test(format)) {
                      format = format.replace(RegExp.$1, RegExp.$1.length == 1
                             ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
               }
        }
        return format;
    }
}

export function format(d:Date, format:string):string{
    const date = {
        "M+": d.getMonth() + 1,
        "d+": d.getDate(),
        "h+": d.getHours(),
        "m+": d.getMinutes(),
        "s+": d.getSeconds(),
        "q+": Math.floor((d.getMonth() + 3) / 3),
        "S+": d.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                        ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
            }
    }
    return format;
}

export enum ANCHOR_MODE{
    CENTER = 1,
    TOP_CENTER = 2,
    BOTTOM_CENTER = 3,
    LEFT_CENTER = 4,
    RIGHT_CENTER = 5,
    TOP_LEFT = 6,
    TOP_RIGHT = 7,
    BOTTOM_LEFT = 8,
    BOTTOM_RIGHT = 9
}

export enum KEY{
    RIGHT= "\u001b[C",
    UP="\u001b[A",
    LEFT="\u001b[D",
    DOWN="\u001b[B",
    SPACE=" "
}

const BLANK_STRINGS = { 1:" ", 2: "  " , 3: "   " }
export function stringifyByLength(content: any, length: number = -1):string{
    if(typeof content == "object"){
        try{
            content = JSON.stringify(content);
        }catch(err){
            content = "obj(err..)";
        }
    }
    if(typeof content == "number"){
        content = ""+content;
    }
    // 截取
    if(length !=-1 ){
        if(content == ""){
            if(!BLANK_STRINGS[length]){
                let newString = "";
                for(let i=0; i<length; i++){
                    newString += " ";
                }
                BLANK_STRINGS[length] = newString;
            }
            return BLANK_STRINGS[length];
        }
    
        if(content.length < length){
            return content + stringifyByLength("", length - content.length);
        }else
        if(content.length > length){
            return content.substring(0, length);
        }
    }
    return content;
}

export function targetOffsetXY(width:number, height:number, mode:ANCHOR_MODE, target:object, isOffsetMode:boolean=true){
    const INIT = isOffsetMode ? 0: 1;
    switch (mode) {
        case ANCHOR_MODE.CENTER:
            target["x"] = Math.round(width / 2);
            target["y"] = Math.round(height / 2);
            break;
        case ANCHOR_MODE.TOP_CENTER:
            target["x"] = Math.round(width / 2);
            target["y"] = INIT;
            break;
        case ANCHOR_MODE.BOTTOM_CENTER:
            target["x"] = Math.round(width / 2);
            target["y"] = height;
            break;
        case ANCHOR_MODE.LEFT_CENTER:
            target["x"] = INIT;
            target["y"] = Math.round(height / 2);
            break;
        case ANCHOR_MODE.RIGHT_CENTER:
            target["x"] = width;
            target["y"] = Math.round(height / 2);
            break;
        case ANCHOR_MODE.TOP_LEFT:
            target["x"] = INIT;
            target["y"] = INIT;
            break;
        case ANCHOR_MODE.TOP_RIGHT:
            target["x"] = width;
            target["y"] = INIT;
            break;
        case ANCHOR_MODE.BOTTOM_LEFT:
            target["x"] = INIT;
            target["y"] = height;
            break;
        case ANCHOR_MODE.BOTTOM_RIGHT:
            target["x"] = width;
            target["y"] = height;
            break;
        default:
    }
}

const DOUBLE_CLIK_TIME_SPAN = 300;
let last_click_time = Date.now();
let last_tag = undefined;
export function isDoubleClick(tag?: string){
    let nowTime = Date.now();
    if(nowTime - last_click_time < DOUBLE_CLIK_TIME_SPAN){
        //有标记时查看标记看是否是同一点击
        if(tag!=undefined){
            if(tag == last_tag){
                return true;
            }else{
                last_tag = tag;
                return false;
            }
        }else{
            return true;
        }
    }
    last_click_time = nowTime;
    return false;
}

export const console = {
    log:function (...args) {
        // global.console.log(args);
        return Console.log(...args);
    },

    tag:function (tag){
        return Console.tag(tag);
    }
}
// 计算两个矩形的相交矩形
export function intersectRects(rect1: Rect, rect2: Rect):Rect{
    let Xs = [rect1.x, (rect1.x + rect1.width), rect2.x, (rect2.x + rect2.width)].sort((a, b) => a - b);
    console.log("rect:","Xs-",Xs);
    let Ys = [rect1.y, (rect1.y + rect1.height), rect2.y, (rect2.y + rect2.height)].sort((a, b)=> a - b);
    console.log("rect:","Ys-",Ys);
    if((Xs[3] - Xs[0] < rect1.width + rect2.width)&&
    (Ys[3] - Ys[0] < rect1.height + rect2.height)){
        let res = { x: Xs[1], y: Ys[1], width: Xs[2] - Xs[1], height: Ys[2] - Ys[1]};
        console.log("rect:",res,rect1,rect2);
        return res;
    }
    return null;
}