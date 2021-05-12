import ITradeConditionTemplate from './ITradeConditionTemplate';

export default class TradeConditionTemplate {
    public name: string;
    public description: string;
    public condition: ITradeConditionTemplate;
    constructor(name: string, description: string, condition: ITradeConditionTemplate) {
        this.name = name;
        this.description = description;
        this.condition = condition;
    }
}