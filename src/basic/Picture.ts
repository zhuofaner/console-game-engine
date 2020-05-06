
import * as ansi from "ansi";
import * as fs from "fs";
import * as path from "path";
import { StyleSheetObj, CLIRenderGroup, Point, Rect } from "./declarations";
import { Layer } from "./Layer";
import VelocityVector from "./VelocityVector";
import LayerManager from "./LayerManager";

const resConfig:ResourceConfig = require("../../res/config.json");

interface ResourceConfig{
    images: ImageResourceItem[]

}

interface ImageSize{
    height: number; //row
    width: number; //height
}

interface ImageResourceItem{
    title: string;
    src: string;
    raw?: string;
    style?: StyleSheetObj;
    size?: ImageSize;
}

export class Picture implements CLIRenderGroup{
    row: number;
    column: number;
    father: CLIRenderGroup;
    children: CLIRenderGroup[];
    measuredHeight: number = 0;
    measuredWidth: number = 0;
    animation?: VelocityVector;
    layerInfo:{ layer: Layer, nameOnLayer: string } = {
        layer: null,
        nameOnLayer: null
    };
    public title: string;
    public rawDatas: string[];
    public rawStyle: StyleSheetObj;
    public rawCursor: ansi.Cursor;
    private static _resConfig: ResourceConfig;
    alphaMode: boolean = false;
    constructor(name: string|null){
        this.father = null;
        this.children = [];
        if(name == null){
            //允许为空，只包含孩子
        }else
        if(Picture._resConfig && Picture._resConfig.images){
            let isBlank = true;
            for(let imgItem of Picture._resConfig.images){
                if(imgItem.title == name){
                    if(!this.rawDatas)
                        this.rawDatas = imgItem.raw.split('\n');
                    this.title = imgItem.title;
                    this.rawStyle = imgItem.style;
                    isBlank = false;
                    break;
                }
            }
            isBlank && new Error(`Error:No such picture named ${name}!!!`);
        }else{
            new Error(`Error:Should invoke Picture.configRes first!!!`);
        }
    }

    get height(){
        // 优先读取测量值
        if(this.measuredHeight != undefined){
            return this.measuredHeight;
        }else
        if(this.rawDatas){
            return this.rawDatas.length;
        }
    }

    get width(){
        // 优先读取测量值
        if(this.measuredWidth != undefined){
            return this.measuredWidth;
        }else
        if(this.rawDatas){
            //有原始数据的返回字符串最长长度
            return Math.max(<any>this.rawDatas.map(
                line=>{
                    if(line && ("length" in <any>line)){
                        return line.length;
                    }
                    return 0;
                }));
        }
    }

    get rect():Rect{
        return {
            x: this.column,
            y: this.row,
            width: this.width,
            height: this.height
        }
    }

    get size(){
        return { 
            height: this.height,
            width: this.width
        }
    }

    get style(){
        return this.rawStyle;
    }

    appendStyle(cursor:ansi.Cursor, style:StyleSheetObj = this.style){
        if(style != undefined){
            for(let p of style.properties){
                (<Function>cursor[p])();
            }
            for(let bgp of style.bg.properties){
                (<Function>cursor.bg[bgp])();
            }
        }
    }

    public static configRes():void{
        let resourcePath = path.resolve(__dirname, '../../res');
        if(resConfig.images){
            resConfig.images.forEach((imageItem:ImageResourceItem)=>{
                imageItem.raw = fs.readFileSync(
                    path.resolve(resourcePath,imageItem.src), 'utf-8');
            });
        }
        Picture._resConfig = resConfig;
    }

    addChild(child: CLIRenderGroup, column:number=1, row:number=1){
        this.children.push(child);
        child.column = column;
        child.row = row;
        child.father = this;
        child.alphaMode = this.alphaMode;
        // this.setWritePosition(undefined, 0, 0);
        // this.setPosition({ x: 0, y: 0});
    }

    get cursor(){
        if(!this.rawCursor){
            this.rawCursor = ansi(process.stdout);
        }
        return this.rawCursor;
    }
    
    setPosition(position: Point){
        this.column = position.x;
        this.row = position.y;
        // this.setWritePosition(cursor, position.x, position.y);
        return this;
    }
    /** 不能传0 */
    setWritePosition(cursor:ansi.Cursor, column: number, row: number){
        // this.DETECTIVE = fs.readFileSync(this.DETECTIVE_RES, 'utf-8');
        // this.raw = this.DETECTIVE.split('\n');
        // console.log(this.raw);
        // if(this.rawCursor == undefined){
        //     this.rawCursor = cursor;
        // }
        cursor = cursor || this.cursor;
        this.appendStyle(cursor);
        this.column = column || this.column;
        this.row = row || this.row; 
        let absColumn = this.father? this.father.column + this.column: this.column;
        let absRow = this.father? this.father.row + this.row: this.row;
        // console.log(this.rawDatas, this.rawStyle);
        if(this.rawDatas && cursor){
            this.rawDatas.forEach((element: string,index) => {
                if(this.alphaMode){
                    // 像素模式-透明通道模式
                    for(let i=0;i<element.length;i++){
                        if(element[i]!=" "){
                            cursor.goto(absColumn+i, absRow+index).write(element[i]);
                        }
                    }
                }else{
                    //行覆盖模式
                    cursor.goto(absColumn, absRow + index).write(element);
                }
                // cursor.goto(column, row+index).write('|');
            });
        }
        cursor.bg.reset();
        cursor.reset();
        
        this.children.forEach(child=>child.setWritePosition(cursor, undefined, undefined));    
        
        return this;
        // cursor.bg.reset();
        // // 写牌名
        // cursor.black()
        //     .bold()
        //     .bg.white()
        //     .goto(column+this.rawDatas[0].length-40, row)
        //     .write(this.title);
    }

    setAnimation(vv: VelocityVector){
        this.animation = vv;
        vv.target = this;
        return this;
    }

    clear(){
        
    }

    // 从可视组件手动刷新
    render(){
        let c_layer:Layer = this.layerInfo.layer;
        if(c_layer!=null){
            c_layer.dirtName(this.layerInfo.nameOnLayer);
            // LayerManager.load().renderDirt(c_layer.dirtRects[0]);
            LayerManager.load().render();
        }
        return this;
    }

}

// const Picture = {
//     title:"不良人",
//     DETECTIVE_RES:"res/detective.img",
//     DETECTIVE:null,
//     setWritePosition:function(cursor, column, row){
//         this.DETECTIVE = fs.readFileSync(this.DETECTIVE_RES, 'utf-8');
//         this.raw = this.DETECTIVE.split('\n');
//         // console.log(this.raw);
//         this.raw.forEach((element,index) => {
//             cursor.goto(column, row+index).write(element);
//             cursor.goto(column, row+index).write('|');
//         });
//         cursor.bg.reset();
//         // 写牌名
//         cursor.black()
//             .bold()
//             .bg.white()
//             .goto(column+this.raw[0].length-40, row)
//             .write(this.title);
//     }
// };

// exports.default=Picture;