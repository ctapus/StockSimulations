import TradeCondition from './TradeCondition';
import TradeAction from './TradeAction';

export default class StrategyBranch {
    public tradeCondition: TradeCondition;
    public tradeAction: TradeAction;
    constructor(tradeCondition: TradeCondition, tradeAction: TradeAction) {
        this.tradeCondition = tradeCondition;
        this.tradeAction = tradeAction;
    }
    public toString(): string {
        return `${this.tradeAction.toString()} shares when ${this.tradeCondition.toString()}`;
    }
}
