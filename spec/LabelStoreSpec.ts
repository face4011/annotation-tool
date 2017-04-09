/**
 * Created by grzhan on 17/4/4.
 */
/// <reference path="../typings/index.d.ts" />

import {LabelStore, LinesCount, Label, LabelLineRange} from "../src/lib/store/LabelStore";

describe("with LabelStore", () => {
    beforeEach(() => {
        const linesCount: LinesCount = [58, 69, 78, 67];
        const labels: Array<Label> = [
            {id:1, pos:[1,5], category: 1},
            {id:2, pos:[57, 81], category: 4}
        ];
        this.labelsCount = labels.length;
        this.labelStore = new LabelStore(linesCount, labels);
    });

    afterEach(() => {
        this.labelsCount = 0;
        delete this.labelStore;
    });

    it('should support query all labels', () => {
        const labels: Array<Label> = this.labelStore.getLabels();
        expect(labels.length).toEqual(this.labelsCount);
    });

    it('should support retrieve a label by id', () => {
        const label: Label = this.labelStore.getLabelById(2);
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
        const testRangeOne: LabelLineRange = this.labelStore.getLabelLineRangeById(1);
        expect(testRangeOne[0].line).toEqual(0);
        expect(testRangeOne[0].position).toEqual(1);
        expect(testRangeOne[1].line).toEqual(0);
        expect(testRangeOne[1].position).toEqual(5);
        const testRangeTwo: LabelLineRange = this.labelStore.getLabelLineRangeById(2);
        expect(testRangeTwo[0].line).toEqual(0);
        expect(testRangeTwo[1].line).toEqual(1);
        expect(testRangeTwo[1].position).toEqual(23);
    });

    it("should support select labels according to line number", () => {
        const labelsInLineOne:Label[] = this.labelStore.selectLabelsByLine(0);
        const labelsInLineTwo:Label[] = this.labelStore.selectLabelsByLine(1);
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
        const labelLineRange:LabelLineRange = this.labelStore.getLabelLineRangeById(label.id);
        expect(labelLineRange[0].line).toEqual(2);
        expect(labelLineRange[0].position).toEqual(2);
    });
});
