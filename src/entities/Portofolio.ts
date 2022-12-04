import StockHistoryItem from "./StockHistoryItem";
import Strategy from "./Strategy";
import TradeHistoryItem from "./TradeHistoryItem";

export default class Portofolio {
    public strategy: Strategy;
    public startDate: Date;
    public amountOfMoney: number;
    public numberOfShares: number;
    public history: Array<TradeHistoryItem>;
    private tradeData: Array<StockHistoryItem>;
    public get firstHistoryItem(): TradeHistoryItem {
        return this.history[0];
     }
    public get lastHistoryItem(): TradeHistoryItem {
        return this.history[this.history.length - 1];
     }
    public get numberOfTrades(): number {
        return this.history.length;
    }
    public get currentValue(): number {
        return this.amountOfMoney + this.numberOfShares * this.tradeData[this.tradeData.length - 1].close;
    }
    constructor(amountOfMoney: number, numberOfShares: number, startDate: Date, tradeData: Array<StockHistoryItem>) {
        this.amountOfMoney = amountOfMoney;
        this.numberOfShares = numberOfShares;
        this.startDate = startDate;
        this.history = new Array<TradeHistoryItem>();
        this.tradeData = tradeData;
    }
}
