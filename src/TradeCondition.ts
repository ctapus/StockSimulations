import ITradeCondition from './ITradeCondition';
import Portofolio from './Portofolio';
import TradeConditionTemplate from './TradeConditionTemplate';
import StockHistoryItem from './StockHistoryItem';

export default class TradeCondition {
    public name: string;
    public description: string;
    public thresholdValue: number;
    public condition: ITradeCondition;
    constructor(conditionTemplate: TradeConditionTemplate, thresholdValue: number) {
        this.name = conditionTemplate.name;
        this.description = conditionTemplate.description;
        this.condition = (tradeData: StockHistoryItem, portofolio: Portofolio): boolean => { return  conditionTemplate.condition(tradeData, portofolio, thresholdValue) };
        this.thresholdValue = thresholdValue;
    }
    public toString(): string {
        if(this.name === "CUR_X%LOWER_PREV_TICK" || this.name === "CUR_X%HIGHER_PREV_TICK" ||
        this.name === "CUR_X%LOWER_PREV_BUY" || this.name === "CUR_X%HIGHER_PREV_BUY") {
            return `${this.description} ${this.thresholdValue}%`;
        } else {
            return `${this.description}`;
        }
    }
}