/**
 * Created by grzhan on 17/1/10.
 */
import {Util, invariant, clone, end, endIndex} from '../common/Util';
import {Store} from "./Store";

export type LabelID = number;
export type LinesCount = Array<number>;
export type LineNumber = number;
export type LineRange = Array<number>;
export interface LinePosition {
    line: LineNumber,
    position: number
}
export interface Label {
    id:number;
    category: number;
    pos: Array<number>;
}

export class LabelStore extends Store<Label> {

    private _linesCount: LinesCount;
    private _linesAccumatedCount: LinesCount;
    private _labels: Array<Label>;
    private _labelsInLines: Array<Array<Label>>;
    private _IDMap: {[LabelID: number]: Label};

    constructor(linesCount: LinesCount, labels: Array<Label>) {
        super();
        this._clear();
        this._labels = labels;
        this._linesCount = linesCount;
        linesCount.reduce((sum, count) => {
            sum += count;
            this._linesAccumatedCount.push(sum);
            return sum;
        }, 0);
        this._setIDMap();
        this._parseLabelsInLines();
    }

    public getLabels(): Array<Label> {
        return clone(this._labels);
    }

    public getLabelById(id: LabelID): Label {
        invariant(
            this._IDMap[id],
            `LabelStore.getLabelById: Label id(${id}) does not map to a registered label)`
        );
        return clone(this._IDMap[id]);
    }

    public selectLabelsByLine(lineNumber: LineNumber): Array<Label> {
        invariant(
            lineNumber <= this._labelsInLines.length && lineNumber > 0,
            `LabelStore.getLabelsByLine: Line number #${lineNumber} is out of range`
        );
        return clone(this._labelsInLines[lineNumber - 1]);
    }

    public getLabelLineRangeById(id: LabelID): Array<LinePosition> {
        // FIXME: need test later
        invariant(
            this._IDMap[id],
            `LabelStore.getLabelLineRangeById: Label id(${id}) does not map to a registered label)`
        );
        const totalChars:number = end(this._linesAccumatedCount);
        const [startPos, endPos] = this._IDMap[id].pos;
        const startLineNumber: LineNumber = this._binarySearchLineNumber(startPos, 0,
            endIndex(this._linesAccumatedCount));
        const endLineNumber: LineNumber = this._binarySearchLineNumber(endPos, 0,
            endIndex(this._linesAccumatedCount));
        const startLinePosition: LinePosition = {line: startLineNumber,
            position: startPos - this._linesAccumatedCount[startLineNumber]};
        const endLinePosition:LinePosition = {line: endLineNumber,
            position: endPos - this._linesAccumatedCount[endLineNumber]};
        return [startLinePosition, endLinePosition];
    }

    private _binarySearchLineNumber(position: number,
                                    start: LineNumber,
                                    end: LineNumber): LineNumber {
        // FIXME: need test later
        if (start >= end) {
            invariant(
                position <= this._linesAccumatedCount[start],
                `LabelStore._binarySearchLineNumber: Label position(${position}) is out of range`
            );
            return start;
        }
        const middle:LineNumber = (start + end) / 2;
        return this._linesAccumatedCount[middle] > position
            ? this._binarySearchLineNumber(position, start, middle - 1) + 1
            : this._binarySearchLineNumber(position, middle, end) + 1;
    }

    private _parseLabelsInLines(): void {
        this._labelsInLines = [];
    }

    private _setIDMap() {
        this._labels.map((label) => {
            invariant(
                this._IDMap[label.id] === undefined,
                `LabelStore._setIDMap: Label id#${label.id} is duplicated`
            );
            this._IDMap[label.id] = label;
        });
    }

    private _clear() {
        this._linesCount = [];
        this._labels = [];
        this._labelsInLines = [];
        this._IDMap = {};
    }
}


// export class Label {
//     public id;
//     public category;
//     public pos = [0,0];
//     public lineNo;
//     constructor(id, category, pos) {
//         this.id = id;
//         this.category = category;
//         this.pos[0] = pos[0];
//         this.pos[1] = pos[1];
//     }
//
//     public isTruncate(pos) {
//         return (this.pos[0] <= pos && this.pos[1] > pos);
//     }
//
//     static getPosInLine(lines:LineContainer, x:number, y:number) : LinePosition {
//         let no:number = 0;
//         let linesLength:Array<number> = lines.getLinesLength();
//         for (let length of linesLength) {
//             no += 1;
//             if (x - length < 0) break;
//             x -= length;
//         }
//         for (let length of linesLength) {
//             no += 1;
//             if (y - length < 0) break;
//             y -= length;
//         }
//         if (x > y) Util.throwError(`Invalid selection, x: ${x}, y: ${y}, line number: ${no}`);
//         return {x, y, no};
//     }
// }
//
//
// export interface LabelData {
//     id:number;
//     category:number;
//     pos: Array<number>;
// }