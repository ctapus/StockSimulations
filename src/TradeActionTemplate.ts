import ITradeActionTemplate from './ITradeActionTemplate';

export default class TradeActionTemplate {
    public name: string;
    public description: string;
    public action: ITradeActionTemplate;
    constructor(name: string, description:string, action: ITradeActionTemplate) {
        this.name = name;
        this.description = description;
        this.action = action;
    }
}