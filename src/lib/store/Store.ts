/**
 * Created by grzhan on 17/1/10.
 */
import {EventBase} from "../common/EventBase";
import {Dispatcher} from "../Dispatcher";
import {invariant} from "../common/Util";

export class Store {
    private _dispatchToken:string;
    protected __emitter: EventBase;
    protected __dispatcher: Dispatcher<any>;
    protected __changeEvent:string;
    protected __changed: boolean;
    protected __className:string;

    constructor(dispatcher: Dispatcher<any>) {
        this.__emitter = new EventBase();
        this.__dispatcher = dispatcher;
        this.__className = this.constructor['name'];
        this.__changeEvent = 'changed';
        this.__changed = false;                                                         // deprecated
        this._dispatchToken = dispatcher.register((payload) => {
            this.__invokeOnDispatch(payload);
        });
    }

    public emit(event:string, args?:any) {
        this.__emitter.emit(this.__changeEvent, args);
        return this.__emitter.emit(event, args);
    }

    public on(event:string, listener:(target:EventBase, args?:any) => any):number {
        return this.__emitter.on(event, listener);
    }

    public offById(event:string,id:number):void {
        this.__emitter.offById(event, id);
    }

    public getDispatcher(): Dispatcher<any> {
        return this.__dispatcher;
    }

    public getDispatchToken(): string {
        return this._dispatchToken;
    }

    protected __invokeOnDispatch(payload: Object): void {
        this.__changed = false;
        this.__onDispatch(payload);

    }

    protected __onDispatch(payload: Object): void {
        invariant(
            false,
            `${this.__className} has not overridden Store.__onDispatch, which is required`
        );
    }
}
