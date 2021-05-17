import ITradeAction from './ITradeAction';
import Portofolio from './Portofolio';
import TradeActionTemplate from './TradeActionTemplate';
import TradeData from './TradeData';

export default class TradeAction {
    public name: string;
    public description: string;
    public numberOfShares: number;
    public action: ITradeAction;
    constructor(actionTemplate: TradeActionTemplate, numberOfShares: number) {
        this.name = actionTemplate.name;
        this.description = actionTemplate.description;
        this.action = (tradeData: TradeData, portofolio: Portofolio): void => { return actionTemplate.action(tradeData, portofolio, numberOfShares) };
        this.numberOfShares = numberOfShares;
    }
    public toString(): string {
        if(this.name === "BUY_ALL" || this.name === "SELL_ALL") {
            return `${this.description}`;
        } else {
            return `${this.description} ${this.numberOfShares}`;
        }
    }
}