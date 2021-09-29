import ITradeConditionTemplate from './ITradeConditionTemplate';

export default class TradeConditionTemplate {
    public name: string;
    public description: string;
    public condition: ITradeConditionTemplate;
    public htmlRender: string;
    public instanceDescription: (thresholdValue: number) => string;
    constructor(name: string, description: string, condition: ITradeConditionTemplate, htmlRender: string, instanceDescription: (thresholdValue: number) => string) {
        this.name = name;
        this.description = description;
        this.condition = condition;
        this.htmlRender = htmlRender;
        this.instanceDescription = instanceDescription;
    }
}