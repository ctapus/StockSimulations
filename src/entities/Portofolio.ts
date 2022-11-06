import Strategy from "./Strategy";
import TradeHistoryItem from "./TradeHistoryItem";

export default class Portofolio {
    public strategy: Strategy;
    public startDate: Date;
    public amountOfMoney: number;
    public numberOfShares: number;
    public history: Array<TradeHistoryItem>;
    public get firstHistoryItem(): TradeHistoryItem {
        return this.history[0];
     }
    public get lastHistoryItem(): TradeHistoryItem {
        return this.history[this.history.length - 1];
     }
    public get numberOfTrades(): number {
        return this.history.length;
    }
    constructor(amountOfMoney: number, numberOfShares: number, startDate: Date) {
        this.amountOfMoney = amountOfMoney;
        this.numberOfShares = numberOfShares;
        this.startDate = startDate;
        this.history = new Array<TradeHistoryItem>();
    }
}
