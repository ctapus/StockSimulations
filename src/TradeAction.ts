import ITradeAction from './ITradeAction';
import Portofolio from './Portofolio';
import TradeActionTemplate from './TradeActionTemplate';
import StockHistoryItem from './StockHistoryItem';

export default class TradeAction {
    public name: string;
    public description: string;
    public numberOfSharesOrPercentage: number;
    public action: ITradeAction;
    constructor(actionTemplate: TradeActionTemplate, numberOfSharesOrPercentage: number) {
        this.name = actionTemplate.name;
        this.description = actionTemplate.description;
        this.action = (tradeData: StockHistoryItem, portofolio: Portofolio): void => { return actionTemplate.action(tradeData, portofolio, numberOfSharesOrPercentage) };
        this.numberOfSharesOrPercentage = numberOfSharesOrPercentage;
    }
    public toString(): string {
        return `${this.description} ${this.numberOfSharesOrPercentage}`;
    }
}