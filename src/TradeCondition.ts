import ITradeCondition from './ITradeCondition';
import TradeConditionTemplate from './TradeConditionTemplate';
import TradeData from './TradeData';

export default class TradeCondition {
    public name: string;
    public description: string;
    public thresholdValue: number;
    public condition: ITradeCondition;
    constructor(conditionTemplate: TradeConditionTemplate, thresholdValue: number) {
        this.name = conditionTemplate.name;
        this.description = conditionTemplate.description;
        this.condition = (tradeData: TradeData): boolean => { return  conditionTemplate.condition(tradeData, thresholdValue) };
        this.thresholdValue = thresholdValue;
    }
    public toString(): string {
        if(this.name === "CUR_X%LOWER_PREV" || this.name === "CUR_X%HIGHER_PREV") {
            return `${this.description} ${this.thresholdValue}%`;
        } else {
            return `${this.description}`;
        }
    }
}