import * as ansi from "ansi";
import { Rect } from "./declarations";
let cursor:ansi.Cursor = ansi(process.stdout);

import VelocityVector from "./VelocityVector";
import LayerManager from "./LayerManager";
import { Layer } from "./Layer";
import { Picture } from "./Picture";
import UIResponder from "./UIResponder";
const SCREEN = new UIResponder();


export default class AnimationSystem{
    static anm_vvs: VelocityVector[] = [];
    static is_playing: boolean = false;
    static is_byFrame: boolean = false;
    static anim_id: number = -1;
    static FRAME = 100;
    static createVelocityVector(vector, velocity, listener?: Function):VelocityVector{
        let new_vv = new VelocityVector(vector, velocity, listener);
        AnimationSystem.anm_vvs.push(new_vv);
        return new_vv;
    }
    
    static play(byFrame: boolean = false){
        AnimationSystem.is_playing = true;
        AnimationSystem.is_byFrame = byFrame;
        // SCREEN.clear();
        // LayerManager.load().renderGrid();
        AnimationSystem.___LOOP();
    }
    
    static pause(){
        AnimationSystem.is_playing = false;
    }

    static stop(){
        AnimationSystem.is_playing = false;
    }

    static ___LOOP(){
        //全屏计算
        AnimationSystem.anm_vvs.forEach((vv:VelocityVector)=>{
            // LayerManager.load().renderGrid(
                //     { x: newPoint.x, y: newPoint.y, width: 80, 
                //     height: 13}
                // );
            let newPoint = vv.move(AnimationSystem.FRAME).round();
            if(vv.target){
                // vv.target 旧位置的矩形区域
                let dirt_x = vv.target.column;
                let dirt_y = vv.target.row;
                let dirt_width = vv.target.width;
                let dirt_height = vv.target.height;
                let layer = vv.target.layerInfo.layer;
                if(layer){
                    layer.setGridPosition(
                        vv.target.layerInfo.nameOnLayer, newPoint, true);
                    layer.dirt({
                        x: dirt_x,
                        y: dirt_y,
                        width: dirt_width,
                        height: dirt_height
                    })
                }
            }
            LayerManager.load().render();
            // LayerManager.load().renderGrid(
            //     { x: vv.target.column, y: vv.target.row, 
            //         width: vv.target.width, height: vv.target.height
            //     });
            // // vv.target 新位置的矩形区域
            // (<Picture>vv.target).setPosition(LayerManager.load().cursor,newPoint);
        })
        LayerManager.load().cursor.goto(0, 0)
        LayerManager.load().cursor.reset();
        if(AnimationSystem.is_playing && !AnimationSystem.is_byFrame){
            setTimeout(AnimationSystem.___LOOP, AnimationSystem.FRAME);
        }
        //全屏绘制
        // LayerManager.load().render()
        // LayerManager.load().renderGrid();
    }
}