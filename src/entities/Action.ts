import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";
import TradeHistoryItem from "./TradeHistoryItem";

export default class Action {
    public actionType: ActionType;
    public param: number; // Represents either number of shares or percentage of cash or shares
    public constructor(s: string, param: number) {
        this.actionType = ActionType[s];
        this.param = param;
    }
    public trade(tradeData: StockHistoryItem, portofolio: Portofolio): void {
        switch(this.actionType)
        {
            case ActionType.BUY:
                const sharesPrice: number = tradeData.open * this.param;
                if(portofolio.amountOfMoney < sharesPrice) {
                    return;
                }
                portofolio.numberOfShares += this.param;
                portofolio.amountOfMoney -= sharesPrice;
                portofolio.history.push(new TradeHistoryItem("BUY", tradeData.date, this.param, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                break;
            case ActionType.SELL:
                if(portofolio.numberOfShares < this.param) {
                    return;
                }
                const sharePrice: number = tradeData.open * this.param;
                portofolio.numberOfShares -= this.param;
                portofolio.amountOfMoney += sharePrice;
                portofolio.history.push(new TradeHistoryItem("SELL", tradeData.date, this.param, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                break;
            case ActionType.BUY_PERCENTAGE:
                const maximumAmountOfMoney: number = portofolio.amountOfMoney * this.param / 100;
                if(maximumAmountOfMoney < tradeData.open) {
                    return;
                }
                const numberOfShares = Math.floor(maximumAmountOfMoney / tradeData.open);
                portofolio.numberOfShares += numberOfShares;
                portofolio.amountOfMoney -= tradeData.open * numberOfShares;
                portofolio.history.push(new TradeHistoryItem("BUY_PERCENTAGE", tradeData.date, this.param, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                break;
            case ActionType.SELL_PERCENTAGE:
                const numberOfSharesToSell: number = Math.floor(portofolio.numberOfShares * this.param / 100);
                if(portofolio.numberOfShares < numberOfSharesToSell) {
                    return;
                }
                portofolio.numberOfShares -= numberOfSharesToSell;
                portofolio.amountOfMoney += tradeData.open * numberOfSharesToSell;
                portofolio.history.push(new TradeHistoryItem("SELL_PERCENTAGE", tradeData.date, numberOfSharesToSell, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                break;
        }
    }
    public toString(): string {
        return `${this.actionType} ${this.param}`;
    }
}

export enum ActionType {    BUY = "Buy exact number of shares",
                            SELL = "Sell exact number of owned shares",
                            BUY_PERCENTAGE = "Buy using percentage of cash",
                            SELL_PERCENTAGE = "Sell percentage of owned shares",
                            BUY_AT_MOST = "Buy at most number of shares",
                            SELL_AT_LEAST = "Sell at least number of shares"
} // TODO: these are EXACT number of shares, add BUY_AT_MOST, SELL_AT_LEAST