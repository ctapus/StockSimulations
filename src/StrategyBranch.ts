import TradeCondition from './TradeCondition';
import TradeAction from './TradeAction';

export default class StrategyBranch {
    public tradeCondition: TradeCondition;
    public tradeAction: TradeAction;
    public description: (numberOfSharesorPercentage: number) => string;
    constructor(tradeCondition: TradeCondition, tradeAction: TradeAction, description: (numberOfSharesorPercentage: number) => string) {
        this.tradeCondition = tradeCondition;
        this.tradeAction = tradeAction;
        this.description = description;
    }
    public toString(): string {
        return `${this.description(this.tradeAction.numberOfSharesOrPercentage)} when ${this.tradeCondition.toString()}`;
    }
}
