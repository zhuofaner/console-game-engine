import { CLIRenderGroup } from "./declarations";
import { console } from "./Utils";

export default class VelocityVector{
    _vector: { x: number, y: number } = { x: 1, y:0 }// 默认朝向x轴正向单位为1的向量
    _velocity: number = 1;// 默认1格/s
    x: number;
    y: number;
    target?: CLIRenderGroup;
    onMoveListener: Function;
    constructor(vector, velocity, listener?: Function){
        this.vector = vector;
        this.velocity = velocity;
        this.onMoveListener = listener;
    }

    set vector(vector: { x: number, y: number}){
        this._vector = vector;
    }

    get vector(){
        return this._vector;
    }
    
    set velocity(velocity: number){
        this._velocity = velocity;
    }

    get velocity():number{
        return this._velocity;
    }

    setOnMoveListener(listener: Function){
        this.onMoveListener = listener;
        return this;
    }

    setPosition(x:number, y:number){
        this.x = x;
        this.y = y;
        return this;
    }

    move(frame){
        let dz2 = this._vector.x*this._vector.x + this._vector.y * this._vector.y;
        console.log(dz2);
        let dz = Math.sqrt(dz2);
        console.log(dz);
        //根据速度计算单位向量
        let addZ = (this.velocity * frame) / (dz *1000);
        console.log(this.velocity, frame, addZ);
        // let addX = this.velocity * frame * this._vector.x / (dz*1000);
        let addX = addZ * this._vector.x;
        console.log(addX);
        let addY = addZ * this._vector.y;
        console.log(addY);
        this.x += addX;
        this.y += addY;
        if(this.onMoveListener){
            this.onMoveListener(this, this.target);
        }
        return this;
    }

    round(position?: {x:number, y:number}){
        let positionX = position? position.x : this.x;
        let positionY = position? position.y : this.y;
        console.log({ positionX, positionY} );
        return { x:Math.round(positionX), y:Math.round(positionY)}
    }
}