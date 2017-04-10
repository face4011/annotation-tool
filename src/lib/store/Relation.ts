/**
 * Created by grzhan on 17/4/11.
 */
import {LabelID, LabelStore} from "./Label";
import {Store} from "./Store";
import {each, clone, invariant, remove} from "../common/Util";
import {RelationCategoryID} from "./Category";
export type RelationID = number;
export interface Relation {
    id: RelationID;
    category: RelationCategoryID;
    src: LabelID;
    dst: LabelID;
}

export class RelationStore extends Store {
    private _relations: Relation[];
    private _IDMap: {[RelationID: number]: Relation};
    private _lastID: RelationID;

    constructor(relations: Relation[]) {
        super();
        this._clear();
        this._relations = relations;
        each(relations, (relation) => {
            this._updateState(relation);
        });
    }

    public select(): Relation[] {
        return clone(this._relations);
    }

    public getById(id: RelationID): Relation {
        invariant(
            this._IDMap[id],
            `RelationStore.getById: Relation ID(${id}) does not map to a registered relation)`
        );
        return clone(this._IDMap[id]);
    }

    public add(category:RelationCategoryID, src: LabelID, dst: LabelID) : Relation {
        const id:RelationID = this._lastID + 1;
        const relation:Relation = {id, category, src, dst};
        try {
            this._relations.push(relation);
            this._updateState(relation);
        } catch (e) {
            this._evictState(relation);
            throw e;
        }
        this.emit('created', clone(relation));
        return relation;
    }

    private _updateState(relation: Relation):void {
        this._setIDMap(relation);
        this._lastID = Math.max(this._lastID, relation.id);
    }

    private _evictState(relation:Relation): void {
        const id:RelationID = relation.id;
        delete this._IDMap[id];
        remove(this._relations, relation);
        this._lastID = this._relations.reduce((x, y) => Math.max(x, y.id), 0);
    }

    private  _setIDMap(relation: Relation): void {
        invariant(
            this._IDMap[relation.id] === undefined,
            `RelationStore._setIDMap: Relation ID#${relation.id} is duplicated`
        );
        this._IDMap[relation.id] = relation;
    }

    private _clear(update:boolean=false): void {
        if (!update) {
            this._relations = [];
        }
        this._IDMap = {};
        this._lastID = 0;
    }
}