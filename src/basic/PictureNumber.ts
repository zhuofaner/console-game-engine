import { Picture } from "./Picture";
import { stringify } from "querystring";
import { unwatchFile } from "fs";
import { console } from "./Utils";

const NUMBER_MAP:string[] = ['number_0','number_1','number_2','number_3',
'number_4','number_5','number_6','number_7','number_8','number_9'];

export class PictureNumber extends Picture{
    rawSpiltNumber:number[];
    rawNumber:number;
    constructor(number: number){
        super(null);
        this.rawSpiltNumber = [0];
        this.rawNumber = 0;
        this.number = number;
    }
    
    set number(number: number){
        this._parseNumber(number);
        this.rawNumber = number;
        // this.render();
    }

    get number(){
        return this.rawNumber;
    }

    // render(){
    //     this.setWritePosition(undefined, 0, 0);
    // }

    _parseNumber(number: number){
        let newSpiltNumber = [];
        while(number>0){
            newSpiltNumber.push(number%10);
            number = Math.floor(number / 10);
        }
        let stringifyNewSplitNumber = JSON.stringify(<any>newSpiltNumber,null,4);
        if(JSON.stringify(<any>this.rawSpiltNumber,null,4) != stringifyNewSplitNumber){
            // this.rawSpiltNumber = newSpiltNumber;
            console.log(stringifyNewSplitNumber);
            this.children.length = 0;
            let column = -14;
            let popNum;
            while((popNum = newSpiltNumber.pop())!=undefined){
                this.addChild(new Picture(`number_${popNum}`),column+=15, 1);
            };  
        }
    }
}