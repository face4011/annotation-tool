import {LineContainer, LinePosition} from './Line';
import {Util} from '../common/Util';

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

export class LabelContainer {
    private labels = [];
    private lineMap = {};

    public create(id, category, pos) {
        this.insert(new Label(id, category, pos));
    }

    public push(label:Label) {
        this.insert(label);
    }

    public get(id) {
        return this.labels[id];
    }

    public get length() {
        return this.labels.length;
    }

    public gen(label) {
        return this.labels;
    }

    private insert(target) {
        let i = 0;
        for (let label of this.labels) {
            if (label.pos[0] < target.pos[0])
                i += 1;
        }
        this.labels.splice(i, 0, target);
    }
}

export interface LabelData {
    id:number;
    category:number;
    pos: Array<number>;
}