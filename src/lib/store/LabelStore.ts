/**
 * Created by grzhan on 17/1/10.
 */
import {LineContainer, LinePosition} from '../components/Line';
import {Util} from '../util/Util';
import {Store} from "./Store";

export class LabelStore extends Store<Label> {
    private lines: LineContainer;
    constructor(lines:LineContainer, labels?:Array<LabelData>) {
        super();
        this.lines = lines;
        if (labels)
            this.load(labels);
    }

    public load(labelsData:Array<LabelData>) {
        for (let labelData of labelsData) {
            let {id, category, pos} = labelData;
            let label:Label = new Label(id, category, pos);

        }
    }

    public clear() {

    }
}

export class Label {
    public id;
    public category;
    public pos = [0,0];
    public lineNo;
    constructor(id, category, pos) {
        this.id = id;
        this.category = category;
        this.pos[0] = pos[0];
        this.pos[1] = pos[1];
    }

    public isTruncate(pos) {
        return (this.pos[0] <= pos && this.pos[1] > pos);
    }

    static getPosInLine(lines:LineContainer, x:number, y:number) : LinePosition {
        let no:number = 0;
        let linesLength:Array<number> = lines.getLinesLength();
        for (let length of linesLength) {
            no += 1;
            if (x - length < 0) break;
            x -= length;
        }
        for (let length of linesLength) {
            no += 1;
            if (y - length < 0) break;
            y -= length;
        }
        if (x > y) Util.throwError(`Invalid selection, x: ${x}, y: ${y}, line number: ${no}`);
        return {x, y, no};
    }
}


export interface LabelData {
    id:number;
    category:number;
    pos: Array<number>;
}
