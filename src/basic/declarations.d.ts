import { WriteStream } from "tty";
import * as ansi from "ansi";
import { Layer } from "./Layer";

declare interface WrappedStream extends WriteStream{
    row: number;
    column: number;
    cursor: ansi.Cursor;
}

declare interface StyleSheetObj{
    properties: string[],
    bg: { properties: string[] }
}
declare interface Point{
    x: number,
    y: number
}
declare interface Rect{
    x: number,
    y: number,
    width: number;
    height: number;
}

declare interface CLIRenderGroup{
    father: CLIRenderGroup;
    children: CLIRenderGroup[];
    row: number;
    column: number;
    readonly rect: Rect;
    setPosition(position:Point):this;
    setWritePosition(cursor:ansi.Cursor, column: number, row: number):this;
    cursor: ansi.Cursor;
    measuredWidth?: number;
    measuredHeight?: number;
    alphaMode?: boolean;
    clear();
    width: number;
    height: number;
    layerInfo: {
        nameOnLayer: string
        layer: Layer;
    }
}

