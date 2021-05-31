import HistoryItem from "./HistoryItem";

export default class Portofolio {
    public amountOfMoney: number;
    public numberOfShares: number;
    public history: Array<HistoryItem>;
    public get lastHistoryItem(): HistoryItem {
        return this.history[this.history.length - 1];
     };
    constructor(amountOfMoney: number, numberOfShares: number) {
        this.amountOfMoney = amountOfMoney;
        this.numberOfShares = numberOfShares;
        this.history = new Array<HistoryItem>();
    }
}
