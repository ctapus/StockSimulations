export default class TradeHistoryItem {
    public action: string;
    public date: Date;
    public numberOfShares: number;
    public sharePrice: number;
    public availableCash: number;
    public totalNumberOfShares: number;
    public executionDescription: string;
    public totalEquity: number;
    constructor(action: string, date: Date, numberOfShares: number, sharePrice: number, availableCash: number, totalNumberOfShares: number) {
        this.action = action;
        this.date = date;
        this.numberOfShares = numberOfShares;
        this.sharePrice = sharePrice;
        this.availableCash = availableCash;
        this.totalNumberOfShares = totalNumberOfShares;
        this.totalEquity = this.availableCash + this.totalNumberOfShares * this.sharePrice;
    }
}
