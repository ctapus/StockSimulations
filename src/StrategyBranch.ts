import TradeCondition from './TradeCondition';
import TradeAction from './TradeAction';

export default class StrategyBranch {
    public tradeCondition: TradeCondition;
    public tradeAction: TradeAction;
    public conditionDescription: (numberOfSharesorPercentage: number) => string;
    public actionDescription: (numberOfSharesorPercentage: number) => string;
    constructor(tradeCondition: TradeCondition, tradeAction: TradeAction, conditionDescription: (thresholdValue: number) => string, actionDescription: (numberOfSharesorPercentage: number) => string) {
        this.tradeCondition = tradeCondition;
        this.tradeAction = tradeAction;
        this.conditionDescription = conditionDescription;
        this.actionDescription = actionDescription;
    }
    public toString(): string {
        return `${this.actionDescription(this.tradeAction.numberOfSharesOrPercentage)} ${this.conditionDescription(this.tradeCondition.thresholdValue)}`;
    }
}
