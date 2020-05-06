import UIResponder from "./UIResponder";
import { StyleSheetObj, CLIRenderGroup, Rect, Point } from "./declarations";
import { ANCHOR_MODE, KEY, targetOffsetXY, console, isDoubleClick, intersectRects } from "./Utils";
import ansi = require("ansi");
import AnimationSystem from "./AnimationSystem";
import { ConsolePicture } from "./Console";
import { Layer } from "./Layer";
import { realpathSync } from "fs";
import { Picture } from "./Picture";

export default class LayerManager extends UIResponder{
    layers: Layer[];
    static instance :LayerManager = null;
    constructor(){
        super();
        this.layers = [];
        this.setKeyListeners();
    }
    
    static load():LayerManager{
        if(LayerManager.instance == null){
            LayerManager.instance = new LayerManager();

            let layer = new Layer(LayerManager.instance.cursor, LayerManager.instance.columns, LayerManager.instance.rows, 
                ANCHOR_MODE.CENTER).rename("timer");
            layer.grid = { width: 6, height: 3 };
            LayerManager.instance.layers.push(layer);
    
            let consoleLayer = new Layer(LayerManager.instance.cursor,LayerManager.instance.columns, LayerManager.instance.rows,
                ANCHOR_MODE.CENTER).rename("console");
            consoleLayer.grid = { width: 15, height: 11 };
            LayerManager.instance.layers.push(consoleLayer);
            // consoleLayer.add(new Picture("detective"),ANCHOR_MODE.TOP_LEFT);
            consoleLayer.add(ConsolePicture.getInstance().initWithSize(
                Math.round(LayerManager.instance.columns / 2),
                Math.round(LayerManager.instance.rows * 2/3 )
            ), ANCHOR_MODE.CENTER);

        }
        return LayerManager.instance;
    }

    setKeyListeners(){
        // 动画的步进播放
        this.onKey(KEY.SPACE,()=>{
            AnimationSystem.play(true);
        });
        // 监听屏幕大小的改变
        this.output.addListener("resize", ()=>{
            if(AnimationSystem.is_playing){
                AnimationSystem.pause();
            }
            this.clear();
            this.layers.forEach(layer=>layer.resize(
                this.columns, this.rows
            ));
            this.renderGrid().render();
        })
        this.onKey('',keyName=>{
            if(isDoubleClick())return;
            let c_layer = this.layers[0];
            this.cursor.goto(0,0);
            global.console.log(c_layer.mode, keyName);
            //四个角
            if(c_layer.mode == ANCHOR_MODE.TOP_LEFT){
                if(keyName == KEY.DOWN){
                    c_layer.anchorMode = ANCHOR_MODE.LEFT_CENTER;
                }else
                if(keyName == KEY.RIGHT){
                    c_layer.anchorMode = ANCHOR_MODE.TOP_CENTER;
                }
            }else
            if(c_layer.mode == ANCHOR_MODE.TOP_RIGHT){
                if(keyName == KEY.DOWN){
                    c_layer.anchorMode = ANCHOR_MODE.RIGHT_CENTER;
                }else
                if(keyName == KEY.LEFT){
                    c_layer.anchorMode = ANCHOR_MODE.TOP_CENTER;
                }
            }else
            if(c_layer.mode == ANCHOR_MODE.BOTTOM_LEFT){
                if(keyName == KEY.UP){
                    c_layer.anchorMode = ANCHOR_MODE.LEFT_CENTER;
                }else
                if(keyName == KEY.RIGHT){
                    c_layer.anchorMode = ANCHOR_MODE.BOTTOM_CENTER;
                }
            }else
            if(c_layer.mode == ANCHOR_MODE.BOTTOM_RIGHT){
                if(keyName == KEY.UP){
                    c_layer.anchorMode = ANCHOR_MODE.RIGHT_CENTER;
                }else
                if(keyName == KEY.LEFT){
                    c_layer.anchorMode = ANCHOR_MODE.BOTTOM_CENTER;
                }
            }else//四个边
            if(c_layer.mode == ANCHOR_MODE.TOP_CENTER){
                if(keyName == KEY.DOWN){
                    c_layer.anchorMode = ANCHOR_MODE.CENTER;
                }else
                if(keyName == KEY.LEFT){
                    c_layer.anchorMode = ANCHOR_MODE.TOP_LEFT;
                }else
                if(keyName == KEY.RIGHT){
                    c_layer.anchorMode = ANCHOR_MODE.TOP_RIGHT;
                }
            }else
            if(c_layer.mode == ANCHOR_MODE.BOTTOM_CENTER){
                if(keyName == KEY.UP){
                    c_layer.anchorMode = ANCHOR_MODE.CENTER;
                }else
                if(keyName == KEY.LEFT){
                    c_layer.anchorMode = ANCHOR_MODE.BOTTOM_LEFT;
                }else
                if(keyName == KEY.RIGHT){
                    c_layer.anchorMode = ANCHOR_MODE.BOTTOM_RIGHT;
                }
            }else
            if(c_layer.mode == ANCHOR_MODE.LEFT_CENTER){
                if(keyName == KEY.RIGHT){
                    c_layer.anchorMode = ANCHOR_MODE.CENTER;
                }else
                if(keyName == KEY.UP){
                    c_layer.anchorMode = ANCHOR_MODE.TOP_LEFT;
                }else
                if(keyName == KEY.DOWN){
                    c_layer.anchorMode = ANCHOR_MODE.BOTTOM_LEFT;
                }
            }else
            if(c_layer.mode == ANCHOR_MODE.RIGHT_CENTER){
                if(keyName == KEY.LEFT){
                    c_layer.anchorMode = ANCHOR_MODE.CENTER;
                }else
                if(keyName == KEY.UP){
                    c_layer.anchorMode = ANCHOR_MODE.TOP_RIGHT;
                }else
                if(keyName == KEY.DOWN){
                    c_layer.anchorMode = ANCHOR_MODE.BOTTOM_RIGHT;
                }
            }else//中心点
            if(c_layer.mode == ANCHOR_MODE.CENTER){
                if(keyName == KEY.LEFT){
                    c_layer.anchorMode = ANCHOR_MODE.LEFT_CENTER;
                }else
                if(keyName == KEY.RIGHT){
                    c_layer.anchorMode = ANCHOR_MODE.RIGHT_CENTER;
                }else
                if(keyName == KEY.UP){
                    c_layer.anchorMode = ANCHOR_MODE.TOP_CENTER;
                }else
                if(keyName == KEY.DOWN){
                    c_layer.anchorMode = ANCHOR_MODE.BOTTOM_CENTER;
                }
            }
            c_layer.addParamsOnName("timer0", { mode: c_layer.mode });
            this.renderGrid().render();
            ConsolePicture.getInstance().render();
            // setTimeout(()=>{
            //     console.log("dirt:", "before Draw", c_layer.giveRects());
            //     console.log("dirt:", "before Draw", ConsolePicture.getInstance().rect)
            //     //测试脏矩形
            //     let dirts = c_layer.giveRects()
            //     .map(rect=>{
            //         let rest = intersectRects(ConsolePicture.getInstance().rect, rect);
            //         return rest;
            //     })
            //     console.log("dirt:", "Draw", dirts);
            //     this.drawDirtRects(dirts);
            // },50);
        });

        // setInterval(()=>{
        //     this.layers[0].anchorMode = (this.layers[0].mode+1)%9+1;
        //     this.renderGrid().render();
        // }, 100*100);
    }
    
    add(renderface: CLIRenderGroup){
        // 默认从最顶层添加(除去console层)
        let c_layer = this.layers[0];
        c_layer.add(renderface, c_layer.anchorMode);
        this.render();
        return this;
    }

    drawGrid(layer: Layer, dirt?: Rect){
        let x_start = dirt? dirt.x : 1;
        let x_end = dirt? (dirt.x + dirt.width) : this.columns;
        let y_start = dirt? dirt.y : 1;
        let y_end = dirt? (dirt.y + dirt.height) : this.rows;
        for(let y=y_start; y <= y_end; y++){
            for(let x=x_start; x <= x_end; x++){
                let shape = " ";
                let stress = false;
                if(Math.abs(x-layer.anchor.x)%layer.gridSize.width == 0){
                    shape = "|";
                    if(x == layer.anchor.x){
                        stress = true;
                    }
                }
                if(Math.abs(y-layer.anchor.y)%layer.gridSize.height == 0){
                    if(shape == "|"){
                        if(y == layer.anchor.y && x == layer.anchor.x){
                            shape = "O";
                        }else{
                            shape = "+";
                        }
                        
                    }else{
                        shape = "—";
                    }
                    if(y == layer.anchor.y){
                        stress = true;
                    }
                }
                this.cursor.goto(Math.round(x), Math.round(y));
                if(stress==true){
                    this.cursor.red();
                    this.output.write(shape);
                }else{
                    this.cursor.grey();
                    this.output.write(shape);
                }
                // if(!dirt){
                //     this.cursor.reset();
                // }
            }    
        }
        return this;
    }

    // renderDirt(dirt?: Rect){
    //     this.renderGrid(dirt);
    //     this.render();
    // }
    render_(){
        this.cursor.fg.reset();
        this.cursor.reset();
        this.cursor.goto(0,0);
        this.layers[0].render();
        this.layers[1].render();
        return this;
    }

    render(layerIndex: number = this.layers.length, dirt?: Rect){
        if(layerIndex == 0){
            return this.renderGrid(dirt);
        }
        this.cursor.fg.reset();
        this.cursor.reset();
        this.cursor.goto(0,0);
        // this.drawGrid(this.layers[0]);
        for(let i=0; i<layerIndex; i++){
            let c_layer = this.layers[i];
            if(c_layer.isDirt){
                this.render(i, c_layer.dirtRects[0]); // 临时数据，向下渲染脏矩形区域所有图层
                // if(i+1<layerIndex){
                //     this.layers[i+1].testDirtAndRender()
                // }
                c_layer.dirtRects = [];
                c_layer.isDirt = false;
            }
            c_layer.render();
        }
        return this;
    }

    renderGrid(dirt?: Rect){
        this.cursor.fg.reset();
        this.cursor.reset();
        this.cursor.goto(0,0);
        this.drawGrid(this.layers[0], dirt);
        return this;
    }

    dirtPaints = { current:0, paints:['red','green','yellow','blue','magenta','cyan']};
    drawDirtRects(rects: Rect[]){
        if(rects!==[]){
            rects.forEach(rect=>{
                if(rect==null)return;
                let bgcolored = this.dirtPaints.paints[this.dirtPaints.current];
                this.dirtPaints.current = (this.dirtPaints.current + 1) % this.dirtPaints.paints.length;
                this.cursor.bg[bgcolored]();
                for(let y=rect.y; y <= rect.y+rect.height; y++){
                    for(let x=rect.x; x <= rect.x+rect.width; x++){
                        this.cursor.goto(x, y);
                        this.cursor.write(" ");
                    }
                }
            });
        }
        this.cursor.bg.reset();
        this.cursor.reset();        
    }
}