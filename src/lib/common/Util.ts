'use strict';
export class Util {
    static height(node) {
        return node.clientHeight || node.getBoundingClientRect().height || node.getBBox().height;
    }
    static width(node) {
        return node.clientWidth || node.getBoundingClientRect().width || node.getBBox().width;
    }
    static top(node) {
        return node.clientTop || node.getBoundingClientRect().top || node.getBBox().y;
    }
    static left(node) {
        return node.clientLeft || node.getBoundingClientRect().left || node.getBBox().x;
    }

    static autoIncrementId(lines, key) {
        let max = -1;
        for (let line of lines) {
            for (let item of line) {
                if (item[key] > max)
                    max = item[key];
            }
        }
        return max + 1;
    }

    static removeInLines(lines, callback) {
        for (let line of lines) {
            for (let i=0; i < line.length; i++) {
                if (callback(line[i])) {
                    line.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    static throwError(message) {
        throw new Error(`synyi-annotation-tool: ${message}`);
    }
}

export const invariant = (condition:any, message?:string) => {
    if (!condition) {
        let error:Error;
        if (message === undefined) {
            error = new Error(`Minified exception occurred.`);
        } else {
            message = '(poplar) ' + message;
            error = new Error(message);
            error.name = 'Invariant Violation';
        }
        throw error;
    }
};

export const clone = (object:any): any => {
    // TODO: may use lodash.deepClone instead
    return JSON.parse(JSON.stringify(object));
};

export const end = <T>(arr:T[]): T => {
    return arr[arr.length - 1];
};

export const start = <T>(arr:T[]): T => {
    return arr[0];
};

export const endIndex = <T>(arr:T[]): number => {
    return arr.length > 0 ? arr.length - 1: 0;
};

export const nestPush = <T>(arr:Array<Array<T>>, index: number, element: T):number => {
    if (arr[index] === undefined)
        arr[index] = [];
    return arr[index].push(element);
};

