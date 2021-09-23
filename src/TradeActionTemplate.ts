import ITradeActionTemplate from './ITradeActionTemplate';

export default class TradeActionTemplate {
    public name: string;
    public description: string;
    public action: ITradeActionTemplate;
    public htmlRender: string;
    public instanceDescription: (numberOfSharesorPercentage: number) => string;
    constructor(name: string, description:string, action: ITradeActionTemplate, htmlRender: string, instanceDescription: (numberOfSharesorPercentage: number) => string) {
        this.name = name;
        this.description = description;
        this.action = action;
        this.htmlRender = htmlRender;
        this.instanceDescription = instanceDescription;
    }
}