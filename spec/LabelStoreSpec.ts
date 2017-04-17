/**
 * Created by grzhan on 17/4/4.
 */

import {LabelStore, Label} from "../src/lib/store/Label";
import {LinesCount, LabelLineRange} from "../src/lib/store/Line";
import {Dispatcher} from "../src/lib/Dispatcher";

describe("with LabelStore", () => {
    beforeEach(() => {
        const linesCount: LinesCount = [58, 69, 78, 67];
        const labels: Array<Label> = [
            {id:1, pos:[1,5], category: 1},
            {id:2, pos:[57, 81], category: 4}
        ];
        const dispatcher: Dispatcher<any> = new Dispatcher();
        this.labelsCount = labels.length;
        this.labelStore = new LabelStore(dispatcher, linesCount, labels);
    });

    afterEach(() => {
        this.labelsCount = 0;
        delete this.labelStore;
    });

    it('should support query all labels', () => {
        const labels: Array<Label> = this.labelStore.select();
        expect(labels.length).toEqual(this.labelsCount);
    });

    it('should support retrieve a label by id', () => {
        const label: Label = this.labelStore.getById(2);
        expect(label.id).toEqual(2);
        expect(label.pos[1]).toEqual(81);
        expect(label.category).toEqual(4);
    });

    it('should contain an efficient binary search method', () => {
        expect((this.labelStore as any)._binarySearchLineNumber(10, 0, 3)).toEqual(0);
        expect((this.labelStore as any)._binarySearchLineNumber(58, 0, 3)).toEqual(1);
        expect((this.labelStore as any)._binarySearchLineNumber(204, 0, 3)).toEqual(2);
        expect(() => {(this.labelStore as any)._binarySearchLineNumber(273, 0, 3)}).toThrow();
    });

    it("should support retrieve specific label's range", () => {
        const testRangeOne: LabelLineRange = this.labelStore.getLineRangeById(1);
        expect(testRangeOne[0].line).toEqual(0);
        expect(testRangeOne[0].position).toEqual(1);
        expect(testRangeOne[1].line).toEqual(0);
        expect(testRangeOne[1].position).toEqual(5);
        const testRangeTwo: LabelLineRange = this.labelStore.getLineRangeById(2);
        expect(testRangeTwo[0].line).toEqual(0);
        expect(testRangeTwo[1].line).toEqual(1);
        expect(testRangeTwo[1].position).toEqual(23);
    });

    it("should support select labels according to line number", () => {
        const labelsInLineOne:Label[] = this.labelStore.selectByLine(0);
        const labelsInLineTwo:Label[] = this.labelStore.selectByLine(1);
        expect(labelsInLineOne.length).toEqual(2);
        expect(labelsInLineTwo.length).toEqual(1);
        const labelInLineOne:Label = labelsInLineOne[0];
        const labelInLineTwo:Label = labelsInLineTwo[0];
        expect(labelInLineOne.id).toEqual(1);
        expect(labelInLineTwo.id).toEqual(2);
    });

    it("should support add new label into itself", () => {
        const label:Label = this.labelStore.add(1, [129, 140]);
        expect(label.id).toEqual(3);
        const labelLineRange:LabelLineRange = this.labelStore.getLineRangeById(label.id);
        expect(labelLineRange[0].line).toEqual(2);
        expect(labelLineRange[0].position).toEqual(2);
        expect(this.labelStore.select().length).toEqual(3);
    });

    it("should support remove specified label from itself", () => {
        this.labelStore.remove(2);
        expect(this.labelStore['_lastID']).toEqual(1);
        expect(this.labelStore.select().length).toEqual(1);
        expect(() => {this.labelStore.getById(2)}).toThrow();
        expect(this.labelStore['_labelsInLines'][1].length).toEqual(0);
    });

    it("should support set label category by ID", () => {
        let label:Label = this.labelStore.setCategoryById(1, 3);
        expect(label.category).toEqual(3);
        label = this.labelStore.getById(1);
        expect(label.category).toEqual(3);
    });
});
