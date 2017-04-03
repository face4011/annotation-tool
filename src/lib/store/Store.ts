/**
 * Created by grzhan on 17/1/10.
 */
import {EventBase} from "../common/EventBase";

export class Store<T> extends EventBase {
    private data:Array<T>;
    constructor() {
        super();
    }
}
