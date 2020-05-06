import { Picture } from "./Picture";
import LayerManager from "./LayerManager";
import { Layer } from "./Layer";
import { Rect } from "./declarations";
const NUMBER_MAP:string[] = ['number_0','number_1','number_2','number_3',
'number_4','number_5','number_6','number_7','number_8','number_9'];

export class PictureChar extends Picture{
    rawString:string;
    constructor(string: string){
        super(null);
        this.alphaMode = true;// 支持透明
        this.string = string;
    }
    
    set string(string: string){
        this._parseString(string);
        this.rawString = string;
    }

    setString(string: string):PictureChar{
        this.string = string;
        return this;
    }

    get string(){
        return this.rawString;
    }

    // render(){
    //     this.setWritePosition(undefined, 0, 0);
    // }

    _parseString(string: string){
        this.children.length = 0;
        let column = -11;
        for(let i=0;i<string.length;i++){
            this.addChild(new Picture(`char_${string[i]}`),column+=12, 1);
        }
        this.measuredWidth = column+14; //最后一个孩子的起始点+其宽度
        this.measuredHeight = 13;
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