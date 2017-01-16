/**
 * Created by grzhan on 17/1/8.
 */
export class Configuration {
     public visible = {
        relation: true,
        highlight: true,
        label: true
    };
    public style = {
        padding: 10,
        baseLeft: 30,
        rectColor:'',
        bgColor:'white',
        width: 0,
        height: 0
    };
    public puncLen:number = 80;
    public linesPerRender:number = 15;
    public selectable:boolean =  false;
}
