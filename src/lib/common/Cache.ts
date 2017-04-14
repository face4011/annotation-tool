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

// Target class should have a static member: cache
export const memorize = function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const func = descriptor.value;
    const serialize = (args) => (propertyKey + '.' + JSON.stringify(args));
    descriptor.value = function() {
        const cache:Cache = target.constructor.cache;
        const key = serialize(arguments);
        if (cache.has(key))
            return cache.get(key);
        const ret = func.apply(this, arguments);
        cache.set(key, ret);
        return ret;
    };
    return descriptor;
};