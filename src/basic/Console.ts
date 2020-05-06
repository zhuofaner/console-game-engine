import { CLIRenderGroup } from "./declarations";
import { stringifyByLength } from "./Utils";
import { Picture } from "./Picture";
import * as ansi from "ansi";

interface TAG{
    [index: string]: string[] | null
}

interface ConsoleHost{
    log: (conent: string)=>void
}

export class Console{
    private host: ConsoleHost;
    private _tags:TAG = { "format": null };
    private _tag_pointer:string = null; 
    private c_tags: string[] = [];
    private recording: boolean = false;
    private playableActions = [];
    constructor(host: ConsoleHost){
        this.host = host;
        this.tagnone();
    }

    // tag 正位
    tagnone(){
        this._tag_pointer = null;
        this.c_tags = [];
        return this;
    }

    tag(tag:string){
        if(!this._tags[tag]){
            this._tags[tag] = null;
        }
        this._tag_pointer = tag;
        return this;
    }

    // 新增子标签，改变结构
    add(...tags:string[]){
        if(this._tag_pointer && this._tags[this._tag_pointer]!==undefined){
            if(this._tags[this._tag_pointer] == null){
                this._tags[this._tag_pointer] = [...tags];
            }else{
                // 两个数组合并成一个新的数组
                this._tags[this._tag_pointer] = [ ...this._tags[this._tag_pointer], ...tags ];
            }
        }
        return this;
    }

    exclude(...tags: string[]){
        if(tags){
            
        }
        return this;
    }

    // 临时包含输出的某些标签，不改变标签结构
    include(...tags: string[]){
        if(tags){
            
        }
        return this;
    }

    __mergeCTags(_tag_pointer?:string){
        _tag_pointer = _tag_pointer || this._tag_pointer;
        if(this._tags[_tag_pointer] == null){
            return [_tag_pointer]; //根结点
        }else{
            // 叶节点 遍历数组
            let resTags = [_tag_pointer];
            this._tags[_tag_pointer].forEach(childTag=>{
                resTags = [...resTags, ...this.__mergeCTags(childTag)]
            })
            return resTags;
        }
    }

    log(...args){
        this.recording && this.playableActions.push(['log', args]);
        if(this._tag_pointer != null && this.c_tags.length ==0){
            this.c_tags = this.__mergeCTags();
        }
        let isVisible = this.c_tags.length != 0 ? this.c_tags.some(tag=>{
            return args[0] == "format:" || args[0]== tag+":";
        }) : true;
        if(!isVisible)return this;
        let params = args.map((arg,i)=>{
            if(i == 0 && arg=="format:") return "";
            return stringifyByLength(arg)
        }).join("");
        this.host.log(params);
        return this;
    }

    record(){
        this.recording = true;
        this.playableActions = [];
        return this;
    }

    stop(){
        this.recording = false;
        return this;
    }

    play(){
        this.recording = false;
        if(this.playableActions){
            this.playableActions.forEach(actlist=>{
                this[actlist[0]](...actlist[1]);
            })
        }
        return this;
    }
}

export class ConsolePicture extends Picture{
    delegate: Console;
    static instance: ConsolePicture = null;
    private constructor(){
        super(null);
        this.rawDatas = [];
        this.delegate = new Console(<any>this);
    }

    static getInstance(){
        if(ConsolePicture.instance == null){
            ConsolePicture.instance = new ConsolePicture();
        }
        return ConsolePicture.instance;
    }

    giveInvokeDelegate(){
        return this.delegate;
    }

    initWithSize(columns: number, rows: number){
        // 设置空白数据
        this.measuredWidth = columns;
        this.measuredHeight = rows;
        this.clearDatas();
        return this;
    }

    resize(columns: number, rows: number){
        this.measuredWidth = columns;
        this.measuredHeight = rows;
        return this;
    }

    // 清屏
    clearDatas(){
        this.rawDatas = [];
        while(this.rawDatas.length <= this.measuredHeight){
            this.rawDatas.push(stringifyByLength("", this.measuredWidth));
        }
    }

    // 打印
    log(content: string){
        if(this.rawDatas.length >= this.measuredHeight){
            this.rawDatas.shift();
        }
        content = stringifyByLength(content, this.measuredWidth);
        this.rawDatas.push(content);
    }

}

export default ConsolePicture.getInstance().giveInvokeDelegate();