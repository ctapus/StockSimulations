import TradeHistoryItem from "./TradeHistoryItem";

export default class Portofolio {
    public amountOfMoney: number;
    public numberOfShares: number;
    public history: Array<TradeHistoryItem>;
    public get lastHistoryItem(): TradeHistoryItem {
        return this.history[this.history.length - 1];
     };
    constructor(amountOfMoney: number, numberOfShares: number) {
        this.amountOfMoney = amountOfMoney;
        this.numberOfShares = numberOfShares;
        this.history = new Array<TradeHistoryItem>();
    }
}
