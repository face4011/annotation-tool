/**
 * Created by grzhan on 17/3/27.
 */
import {invariant} from "./common/Util";
export type DispatchToken = string;
const _prefix = 'ID_';

export class Dispatcher<TPayload> {
    private _callbacks: {[DispatchToken: string]: (payload: TPayload) => void};
    private _isDispatching: boolean;
    private _isHandled: {[DispatchToken: string]: boolean};
    private _isPending: {[DispatchToken: string]: boolean};
    private _lastID: number;
    private _pendingPayload: TPayload;

    constructor() {
        this._callbacks = {};
        this._isDispatching = false;
        this._isHandled = {};
        this._isPending = {};
        this._lastID = 1;
    }

    public register(callback: (payload: TPayload) => void): DispatchToken {
        const id = _prefix + this._lastID ++;
        this._callbacks[id] = callback;
        return id;
    }

    public unregister(id: DispatchToken): void {
        invariant(
           this._callbacks[id],
           `Dispatcher.unregister(...): '${id}' does not map to a registered callback.`
        );
        delete this._callbacks[id];
    }

    public waitFor(ids: Array<DispatchToken>): void {
        invariant(
            this._isDispatching,
            'Dispatcher.waitFor(...): Must be invoked while dispatching'
        );
        for (let id of ids) {
            if (this._isPending[id]) {
                invariant(
                    this._isHandled[id],
                    `Dispatcher.waitFor(...):  Circular dependency detected while waiting for ${id}`
                );
                continue;
            }
            invariant(
                this._callbacks[id],
                `Dispatcher.waitFor(...): '${id}' does not map to a registered callback.`
            );
            this._invokeCallback(id);
        }
    }

    public dispatch(payload: TPayload): void {
        invariant(
            !this._isDispatching,
            'Dispatcher.dispatch(...): Cannot dispatch in the middle of a dispatch'
        );
        this._startDispatching(payload);
        try {
            for (var id in this._callbacks) {       // FIXME: A better implementation
                // ???
                if (this._isPending[id]) {
                    continue;
                }
                this._invokeCallback(id);
            }
        } finally {
            this._stopDispatching();
        }
    }

    public isDispatching(): boolean {
        return this._isDispatching;
    }

    private _invokeCallback(id: DispatchToken): void {
        this._isPending[id] = true;
        this._callbacks[id](this._pendingPayload);
        this._isHandled[id] = true;
    }

    private _startDispatching(payload: TPayload): void {
        for (let id in this._callbacks) {                 // FIXME: A better implementation
            this._isPending[id] = false;
            this._isHandled[id] = false;
        }
        this._pendingPayload = payload;
        this._isDispatching = true;
    }

    private _stopDispatching(): void {
        delete this._pendingPayload;
        this._isDispatching = false;
    }
}

// TODO: review keyword `delete`, implement 'storage' module
