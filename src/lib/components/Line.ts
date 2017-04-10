import {Label, LabelData} from "../store/Label";
import {Util} from "../common/Util";

/**
 * Created by grzhan on 16/7/1.
 */
/// <reference path="../../../typings/svgjs.d.ts" />
export class Line {
    public no:number = 0;
    public group : LineGroup;
    public labels:Array<Label> = [];
    public text:string;
    constructor(line:number, text:string, parentGroup:any) {
        this.no = line;
        this.group = new LineGroup(parentGroup);
        this.text = text;
    }
}

class LineGroup {
    public base:any;
    public text:any;
    public relation:any;
    public label:any;
    constructor(parent:any) {
        this.base = parent.group();
        this.text = this.base.group();
        this.relation = this.base.group();
        this.label = this.base.group();
    }
}

export class LineContainer {
    private parentGroup;
    private lines:Array<Line> = [];
    private linesLength:Array<number> = [];

    constructor(parentGroup:any) {
       this.parentGroup = parentGroup;
    }

    // build 构建不会截断标签的多行文本
    public build(raw:string, cpl:number, labels:Array<Label>) {
        raw = raw.replace(/\r\n/, '\n').replace('\r', '\n').replace(/\s{2,}/g, '\n');
        let rawLines:Array<string> = raw.split(/(.*?[\n\r])/g)
            .filter((value) => { return value.length > 0 })
            .map((value) => { return value.replace('\n',' ');});
        let lineNo:number = 0;
        let loopCount:number = 0;                                       // 循环计数, 用于判断由 bug 出现的死循环
        let basePos:number = 0;                                         // 用于记录上一个换行位置
        let sentinelLabelId = 0;                                        // 标签哨兵下标
        while (rawLines.length > 0) {
            loopCount += 1;
            if (loopCount > 100000) {
                Util.throwError('Dead loop while building lines.');
            }
            let lineText:string = rawLines.shift();
            if (lineText.length < 1) continue;
            let truncPos:number = basePos + lineText.length - 1;         // 将要换行的位置, 需保证不截断任何标签
            while (true) {
                if (labels.length <= sentinelLabelId) break;
                let i:number = sentinelLabelId;
                let truncFlag:boolean = false;                           // 标签是否截断的标识符
                while (true) {
                    let label = labels[i];
                    if (label.pos[0] > truncPos) break;
                    if (label.isTruncate(truncPos)) {
                        truncFlag = true;
                        truncPos = label.pos[0] - 1;
                    }
                    i += 1;
                    if (labels.length <= i) break;
                }
                if (!truncFlag) {
                    sentinelLabelId = i;
                    break;
                }
            }
            if (lineText.length < 1 || truncPos < basePos) continue;
            let truncOffet:number = truncPos - basePos + 1;
            if (rawLines.length > 0)
                rawLines[0] = lineText.slice(truncOffet) + rawLines[0];
            else if (lineText.slice(truncOffet).length > 0)
                rawLines[0] = lineText.slice(truncOffet);
            lineText = lineText.slice(0, truncOffet);
            lineNo += 1;
            basePos += lineText.length;
            this.create(lineText);
        }
    }

    public get(lineNum:number):Line {
        return this.lines[lineNum - 1];
    }

    public create(text:string):void {
        this.lines.push(new Line(this.lines.length, text, this.parentGroup));
        this.linesLength.push(text.length);
    }

    public toArray():Array<Line> {
        return this.lines;
    }

    public getLinesLength():Array<number> {
        return this.linesLength;
    }
}

