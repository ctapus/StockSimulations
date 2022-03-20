import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";
import TradeHistoryItem from "./TradeHistoryItem";

export default class Action {
    public actionType: ActionType;
    public param: number; // Represents either number of shares or percentage of cash or shares
    public constructor(actionType: ActionType, param: number) {
        this.actionType = actionType;
        this.param = param;
    }
    public trade(tradeData: StockHistoryItem, portofolio: Portofolio): void {
        switch(this.actionType)
        {
            case ActionTypes.BUY_EXACT:
                const sharesPrice: number = tradeData.open * this.param;
                if(portofolio.amountOfMoney < sharesPrice) {
                    return;
                }
                portofolio.numberOfShares += this.param;
                portofolio.amountOfMoney -= sharesPrice;
                portofolio.history.push(new TradeHistoryItem("BUY", tradeData.date, this.param, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                break;
            case ActionTypes.SELL_EXACT:
                if(portofolio.numberOfShares < this.param) {
                    return;
                }
                const sharePrice: number = tradeData.open * this.param;
                portofolio.numberOfShares -= this.param;
                portofolio.amountOfMoney += sharePrice;
                portofolio.history.push(new TradeHistoryItem("SELL", tradeData.date, this.param, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                break;
            case ActionTypes.BUY_PERCENTAGE:
                const maximumAmountOfMoney: number = portofolio.amountOfMoney * this.param / 100;
                if(maximumAmountOfMoney < tradeData.open) {
                    return;
                }
                const numberOfShares = Math.floor(maximumAmountOfMoney / tradeData.open);
                portofolio.numberOfShares += numberOfShares;
                portofolio.amountOfMoney -= tradeData.open * numberOfShares;
                portofolio.history.push(new TradeHistoryItem("BUY_PERCENTAGE", tradeData.date, this.param, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                break;
            case ActionTypes.SELL_PERCENTAGE:
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
        return this.actionType.instanceDescription(this.param);
    }
    public toCode(): string {
        return `${this.actionType.code} ${this.param}`;
    }
}

export class ActionType {
    public code: string;
    public classDescription: string;
    public instanceDescription: (param: number) => string;
    constructor(code: string, classDescription: string, instanceDescription: (param: number) => string) {
        this.code = code;
        this.classDescription = classDescription;
        this.instanceDescription = instanceDescription;
    }
}

export class ActionTypes {
    public static readonly BUY_EXACT = new ActionType("BUY_EXACT", "Buy exact number of shares", param => `Buy ${param} number of shares`);
    public static readonly SELL_EXACT = new ActionType("SELL_EXACT", "Sell exact number of owned shares", param => `Sell ${param} number of owned shares`);
    public static readonly BUY_PERCENTAGE = new ActionType("BUY_PERCENTAGE", "Buy using percentage of cash", param => `Buy using ${param}% of cash`);
    public static readonly SELL_PERCENTAGE = new ActionType("SELL_PERCENTAGE", "Sell percentage of owned shares", param => `Sell ${param}% of owned shares`);
    public static readonly BUY_AT_MOST = new ActionType("BUY_AT_MOST", "Buy at most number of shares", param => `Buy at most ${param} shares`);
    public static readonly SELL_AT_LEAST = new ActionType("SELL_AT_LEAST", "Sell at least number of shares", param => `Sell at least ${param} shares`);
    public static readonly AllActionTypes: ActionType[] = [ this.BUY_EXACT, this.SELL_EXACT, this.BUY_PERCENTAGE, this.SELL_PERCENTAGE, this.BUY_AT_MOST, this.SELL_AT_LEAST];
    public static item(key: string): ActionType {
        return this.AllActionTypes.filter(x => x.code.toUpperCase() === key.toUpperCase())[0];
    }
} // TODO: these are EXACT number of shares, add BUY_AT_MOST, SELL_AT_LEAST
