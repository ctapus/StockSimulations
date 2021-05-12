import ITradeCondition from './ITradeCondition';
import TradeConditionTemplate from './TradeConditionTemplate';

export default class TradeCondition {
    public name: string;
    public description: string;
    public condition: ITradeCondition;
    constructor(conditionTemplate: TradeConditionTemplate) {
        this.name = conditionTemplate.name;
        this.description = conditionTemplate.description;
        this.condition = conditionTemplate.condition;
    }
}