import {isUndefined} from "./Util";
/**
 * Created by grzhan on 17/4/15.
 */
export class Cache {
    private _cache: {[key:string]: any};

    constructor() {
        this._cache = {};
    }

    public get(key:string):any {
        return this._cache[key];
    }

    public set(key:string, value:any):void {
        this._cache[key] = value;
    }

    public has(key:string):boolean {
        return (key in this._cache);
    }

    public clear():void {
        this._cache = {};
    }
}

// CAUTION: This decorator would implicitly create a Cache instance (_cache) as a static member in target class
export const memorize = function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const func = descriptor.value;
    const serialize = (args) => (propertyKey + '.' + isPrimitive(args) ? args[0] : JSON.stringify(args));
    if (isUndefined(target.constructor._cache))
        target.constructor._cache = new Cache();
    descriptor.value = function() {
        const cache:Cache = target.constructor._cache;
        const key = serialize(arguments);
        if (cache.has(key))
            return cache.get(key);
        const ret = func.apply(this, arguments);
        cache.set(key, ret);
        return ret;
    };
    return descriptor;
};

export const clear = function(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    if (target.constructor._cache instanceof Cache)
        target.constructor._cache.clear();
    return descriptor;
};

const isPrimitive = (args: any[]): boolean => {
    if (args.length === 1) {
        const arg = args[0];
        const type = typeof arg;
        return arg == null || (type != "object" && type != "function")
    }
    return false;
};