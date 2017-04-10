/**
 * Created by grzhan on 17/4/11.
 */
export type LineNumber = number;
export interface LinePosition {
    line: LineNumber,
    position: number
}
export type LabelLineRange = [LinePosition, LinePosition];
export type LinesCount = number[];