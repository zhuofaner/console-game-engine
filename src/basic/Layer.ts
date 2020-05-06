import UIResponder from "./UIResponder";
import { StyleSheetObj, CLIRenderGroup, Rect, Point } from "./declarations";
import { ANCHOR_MODE, KEY, targetOffsetXY, console, isDoubleClick } from "./Utils";
import ansi = require("ansi");
import AnimationSystem from "./AnimationSystem";
import { ConsolePicture } from "./Console";
interface GridMapMeta{
    title: string,
    data: CLIRenderGroup,
    mode: ANCHOR_MODE,
    x: number, //所在网格系统的x轴数据
    y: number, //所在网格系统的y轴数据
    abs_?: Point //原生x,y坐标
}

interface GridMap{
    conflictNames: string, // datas.数据索引值 string类型
    total: number, // 数据个数
    datas:{
        [index: string]: GridMapMeta //createMap元数据的索引
    }
}

export class Layer{
    gridMap: GridMap;
    anchor: {x: number, y: number} = { x: 1, y:1 };
    grid: { width: number, height: number} = { width: 1, height: 1};
    mode: ANCHOR_MODE;
    width: number;
    height: number;
    cursor: ansi.Cursor;
    isDirt: boolean = false;
    dirtRects: Rect[];
    name: string = "New Layer";
    constructor(cursor: ansi.Cursor, width: number, height: number, mode: ANCHOR_MODE = ANCHOR_MODE.CENTER){
        this.cursor = cursor;
        this.mode = mode;
        this.gridMap = { total: 0, conflictNames: "", datas:{} };
        this.resize(width, height);
    }

    rename(name: string){
        this.name = name;
        return this;
    }

    giveRects():Rect[]{
        return Object.keys(this.gridMap.datas).map(key=>{
            let target:GridMapMeta = this.gridMap.datas[key];
            return {
                x: target.data.column, 
                y: target.data.row, 
                width: target.data.width,
                height: target.data.height
            }
        })        
    }

    get gridSize(){
        return this.grid;
    }

    set gridSize(gridSize: { width: number, height: number }){
        this.grid = gridSize;
    }

    set anchorMode(mode:ANCHOR_MODE){
        this.mode = mode;
        this.resize();
    }

    get anchorMode(){
        return this.mode;
    }
    
    resize(width: number=this.width, height: number=this.height){
        this.width = width;
        this.height = height;
        targetOffsetXY(this.width, this.height, this.mode, this.anchor, false);
    }

    setGridPosition(gridName: string, position: Point, isAbs:boolean = false){
        let gridTarget = this.gridMap.datas[gridName];
        if(gridTarget){
            if(isAbs){
                gridTarget.abs_ = position;
            }else{
                gridTarget.x = position.x;
                gridTarget.y = position.y;
            }
        }
    }

    addParamsOnName(name: string, addParam: object){
        if(name in this.gridMap.datas){
            this.gridMap.datas[name] = {
                ...this.gridMap.datas[name], ...addParam, data: this.gridMap.datas[name].data
            };
        }
        return this;
    }

    // 根据图层上的元件 计算脏区的绝对坐标
    dirtName(name: string){
        if(name in this.gridMap.datas){
            let target = this.gridMap.datas[name];
            if(target.abs_){
                this.dirt({
                    x: target.abs_.x,
                    y: target.abs_.y,
                    width: target.data.width,
                    height: target.data.height
                });
            }else{
                let absOffset = {};
                targetOffsetXY(target.data.width, target.data.height, target.mode, absOffset);
                let abs_x = this.anchor.x + target.x * this.grid.width - absOffset["x"];
                let abs_y = this.anchor.y + target.y * this.grid.height - absOffset["y"];
                this.dirt({
                    x: abs_x,
                    y: abs_y,
                    width: target.data.width,
                    height: target.data.height
                });
            }
        }
    }

    dirt(rect: Rect){
        if(!this.isDirt){
            this.isDirt = true;
            this.dirtRects = [rect];
        }else{
            this.dirtRects.push(rect);
        }
    }
    
    add(renderface: CLIRenderGroup, mode: ANCHOR_MODE = this.mode){
        let createName = this.name + this.gridMap.total;
        //step1 构造元件数据
        let meta: GridMapMeta = {
            title: createName,
            data: renderface,
            mode: mode,
            x: 0,
            y: 0
        }
        if(renderface.column!=undefined && renderface.row!=undefined){
            meta.abs_ = { x: renderface.column, y: renderface.row };
            meta.x = NaN, //网格坐标数据不可用
            meta.y = NaN
        }
        //step2 命名
        this.gridMap.datas[createName] = meta;
        this.gridMap.total ++;
        this.gridMap.conflictNames += createName;
        //step3 绑定层对象
        renderface.layerInfo = {
            layer: this,
            nameOnLayer: meta.title
        };
        console.log("add:", this.gridMap);
    }

    render(){
        console.log("render:","layerName-",this.name);
        Object.keys(this.gridMap.datas).forEach(key=>{
            let renderFace: CLIRenderGroup = this.gridMap.datas[key].data;
            // 提供给动画使用，不使用网格坐标
            if("abs_" in this.gridMap.datas[key]){
                let abs_x = this.gridMap.datas[key]["abs_"]["x"];
                let abs_y = this.gridMap.datas[key]["abs_"]["y"];
                this.cursor.goto(0, 0);
                this.cursor.reset();
                renderFace.setWritePosition(this.cursor, abs_x, abs_y);
                console.log("render:"," "+renderFace.layerInfo.nameOnLayer,",x="+abs_x,",y="+abs_y);
            }else{
            // 使用网格数据，实时根据中心点信息计算绝对坐标
                let absOffset = {};
                targetOffsetXY(renderFace.width, renderFace.height, this.gridMap.datas[key].mode, absOffset);
                let abs_x = this.anchor.x + this.gridMap.datas[key].x * this.grid.width - absOffset["x"];
                let abs_y = this.anchor.y + this.gridMap.datas[key].y * this.grid.height - absOffset["y"];
                // this.gridMap.datas[key].abs_ = { x: abs_x, y: abs_y };
                this.cursor.goto(0, 0);
                this.cursor.reset();
                renderFace.setWritePosition(this.cursor, abs_x, abs_y);
                console.log("render:"," "+renderFace.layerInfo.nameOnLayer ,",mode="+this.gridMap.datas[key].mode,",x="+abs_x,",y="+abs_y);
            }
        })
    }
}