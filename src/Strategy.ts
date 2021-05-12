import TradeCondition from './TradeCondition';
import TradeAction from './TradeAction';

export default class Strategy {
    public tradeCondition: TradeCondition;
    public tradeAction: TradeAction;
    constructor(tradeCondition: TradeCondition, tradeAction: TradeAction) {
        this.tradeCondition = tradeCondition;
        this.tradeAction = tradeAction;
    }
    public toString(): string {
        if(this.tradeAction.name === "BUY_ALL" || this.tradeAction.name === "SELL_ALL") {
            return `${this.tradeAction.description} shares ${this.tradeCondition.description}`;
        } else {
            return `${this.tradeAction.description} ${this.tradeAction.numberOfShares} shares ${this.tradeCondition.description}`;
        }
    }
}
