/**
 * Created by grzhan on 17/1/10.
 */
import {invariant, clone, end, endIndex, nestPush, each, remove} from '../common/Util';
import {Cache, memorize} from '../common/Cache';
import {Store} from "./Store";
import {LinesCount, LineNumber, LinePosition, LabelLineRange} from './Line';
import {LabelCategoryID} from "./Category";
import {Dispatcher} from "../Dispatcher";

export type LabelID = number;
export interface Label {
    id:LabelID;
    category: LabelCategoryID;
    pos: [number, number];
}

export class LabelStore extends Store {

    private _linesCount: LinesCount;
    private _linesAccumulatedCount: LinesCount;
    private _labels: Label[];
    private _labelsInLines: Array<Array<Label>>;
    private _IDMap: {[LabelID: number]: Label};
    private _lastID: LabelID;
    static cache = new Cache();

    constructor(dispatcher: Dispatcher<any>, linesCount: LinesCount, labels: Label[]) {
        super(dispatcher);
        this._clear();
        this._labels = labels;
        this._linesCount = linesCount;
        linesCount.reduce((sum, count) => {
            sum += count;
            this._linesAccumulatedCount.push(sum);
            return sum;
        }, 0);
        each(labels, (label) => {
            this._updateState(label);
        });
    }

    public select(): Label[] {
        return clone(this._labels);
    }

    public getById(id: LabelID): Label {
        invariant(
            this._IDMap[id],
            `LabelStore.getById: Label id(${id}) does not map to a registered label)`
        );
        return clone(this._IDMap[id]);
    }

    public selectByLine(lineNumber: LineNumber): Label[] {
        invariant(
            lineNumber < this._labelsInLines.length && lineNumber >= 0,
            `LabelStore.selectByLine: Line number #${lineNumber} is out of range`
        );
        return clone(this._labelsInLines[lineNumber]);
    }

    @memorize
    public getLineRangeById(id: LabelID): LabelLineRange {
        invariant(
            this._IDMap[id],
            `LabelStore.getLineRangeById: Label ID(${id}) does not map to a registered label)`
        );
        const totalChars:number = end(this._linesAccumulatedCount);
        const [startPos, endPos] = this._IDMap[id].pos;
        const startLineNumber: LineNumber = this._binarySearchLineNumber(startPos, 0,
            endIndex(this._linesAccumulatedCount));
        const endLineNumber: LineNumber = this._binarySearchLineNumber(endPos, 0,
            endIndex(this._linesAccumulatedCount));
        const startLinePosition: LinePosition = {line: startLineNumber,
            position: startPos - (this._linesAccumulatedCount[startLineNumber - 1] || 0)};
        const endLinePosition:LinePosition = {line: endLineNumber,
            position: endPos - (this._linesAccumulatedCount[endLineNumber - 1] || 0)};
        return [startLinePosition, endLinePosition];
    }

    public add(category:LabelCategoryID, position: [number, number]):Label {
        const id:LabelID = this._lastID + 1;
        const label:Label = {category, pos: position, id};
        try {
            this._labels.push(label);
            this._updateState(label);
        } catch (e) {
            this._evictState(label);
            throw e;
        }
        this.emit('created', clone(label));
        return label;
    }

    public setCategoryById(id: LabelID, category:LabelCategoryID) : Label {
        const label:Label = this._IDMap[id];
        invariant(label, `LabelStore.setCategoryById: Label ID(${id}) does not map to a registered label`);
        label.category = category;
        this.emit('updated', clone(label));
        return clone(label);
    }

    public remove(id: LabelID) : void {
        const label:Label = this._IDMap[id];
        invariant(label, `LabelStore.remove: Label ID(${id}) does not map to a registered label`);
        this._evictState(label);
        this.emit('deleted', clone(label));
    }

    private _binarySearchLineNumber(position: number,
                                    start: LineNumber,
                                    end: LineNumber): LineNumber {
        if (start >= end) {
            const count = this._linesAccumulatedCount[start];
            invariant(
                position < count,
                `LabelStore._binarySearchLineNumber: Label position(${position}) is out of range(${start}:${count})`
            );
            return start;
        }
        const middle:LineNumber = Math.floor((start + end) / 2);
        return this._linesAccumulatedCount[middle] > position
            ? this._binarySearchLineNumber(position, start, middle)
            : this._binarySearchLineNumber(position, middle + 1, end);
    }

    private _updateState(label:Label): void {
        this._setIDMap(label);
        this._parseLabelInLines(label);
        this._lastID = Math.max(this._lastID, label.id);
    }

    private _evictState(label:Label): void {
        const id:LabelID = label.id;
        delete this._IDMap[id];
        each(this._labelsInLines, (labelsInLine: Array<Label>) => {
            remove(labelsInLine, label);
        });
        remove(this._labels, label);
        this._lastID = this._labels.reduce((x, y) => Math.max(x, y.id), 0);
    }

    private _parseLabelInLines(label: Label): void {
        const [{line: startLine}, {line: endLine}] = this.getLineRangeById(label.id);
        nestPush(this._labelsInLines, startLine, label);
        if (startLine !== endLine)
            nestPush(this._labelsInLines, endLine, label);
    }

    private _setIDMap(label: Label): void {
        invariant(
            this._IDMap[label.id] === undefined,
            `LabelStore._setIDMap: Label id#${label.id} is duplicated`
        );
        this._IDMap[label.id] = label;
    }

    private _clear(update:boolean=false): void {
        if (!update) {
            this._linesCount = [];
            this._labels = [];
        }
        LabelStore.cache.clear();
        this._labelsInLines = [];
        this._linesAccumulatedCount = [];
        this._IDMap = {};
        this._lastID = 0;
    }
}
