/**
 * Created by grzhan on 17/4/12.
 */
import {Relation, RelationStore} from "../src/lib/store/Relation";
import {Dispatcher} from "../src/lib/Dispatcher";

describe('with RelationStore', () => {
    beforeEach(() => {
        const relations: Relation[] = [
            {id:1, src:1, dst:2, category:2},
            {id:2, src:2, dst:4, category:1}
        ];
        const dispatcher: Dispatcher<any> = new Dispatcher();
        this.relationCount = relations.length;
        this.relationStore = new RelationStore(dispatcher, relations);
    });

    afterEach(() => {
       this.relationCount = 0;
       delete this.relationStore;
    });

    it('should support query all relations', () => {
        const relations: Relation[] = this.relationStore.select();
        expect(relations.length).toEqual(this.relationCount);
    });

    it('should support retrieve a relation by ID', () => {
        const relation: Relation = this.relationStore.getById(1);
        expect(relation.id).toEqual(1);
        expect(relation.category).toEqual(2);
        expect(relation.src).toEqual(1);
        expect(relation.dst).toEqual(2);
    });

    it('should support add new relation into itself', () => {
        const relation: Relation = this.relationStore.add(3, 2, 1);
        expect(relation.id).toEqual(3);
        expect(this.relationStore.select().length).toEqual(this.relationCount + 1);
    });

    it('should support remove specified relation from itself', () => {

    });
});
