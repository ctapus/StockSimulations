import HistoryItem from "./HistoryItem";
import Portofolio from "./Portofolio";
import TradeData from "./TradeData";
import TradeConditionTemplate from './TradeConditionTemplate';
import TradeActionTemplate from './TradeActionTemplate';

export const tradeConditionTemplates: { [id: string]: TradeConditionTemplate } = {
    "FIRST_DAY"             :   new TradeConditionTemplate("FIRST_DAY", "first DAY",
                                    (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                     { return null === tradeData.previousDay; }),
    "DAILY"                 :   new TradeConditionTemplate("DAILY", "every DAY",
                                    (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                     { return true; }),
    "CUR_LOWER_PREV_TICK"   :   new TradeConditionTemplate("CUR_LOWER_PREV_TICK", "if current day opens lower than previous DAY",
                                    (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                     {
                                        if(!tradeData.previousDay) return false;
                                        return tradeData.open < tradeData.previousDay.open;
                                    }),
    "CUR_X%LOWER_PREV_TICK" :   new TradeConditionTemplate("CUR_X%LOWER_PREV_TICK", "if current day opens lower than previous DAY with at least",
                                    (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                     {
                                        if(!tradeData.previousDay) return false;
                                        return (100 - thresholdValue) / 100 * tradeData.open < tradeData.previousDay.open; }),
    "CUR_X%LOWER_PREV_BUY"  :   new TradeConditionTemplate("CUR_X%LOWER_PREV_BUY", "if current day opens lower than previous BUY with at least",
                                    (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                     {
                                        if(!portofolio.lastHistoryItem) return false;
                                        return (100 - thresholdValue) / 100 * tradeData.open < portofolio.lastHistoryItem.sharePrice;
                                    }),
    "CUR_HIGHER_PREV_TICK"  :   new TradeConditionTemplate("CUR_HIGHER_PREV_TICK", "if current day open higher than previous DAY",
                                    (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                     {
                                        if(!tradeData.previousDay) return false;
                                        return tradeData.open > tradeData.previousDay.open;
                                    }),
    "CUR_X%HIGHER_PREV_TICK":   new TradeConditionTemplate("CUR_X%HIGHER_PREV_TICK", "if current day opens higher than previous DAY with at least",
                                    (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                     {
                                        if(!tradeData.previousDay) return false;
                                        return (100 - thresholdValue) / 100 * tradeData.open > tradeData.previousDay.open;
                                    }),
    "CUR_X%HIGHER_PREV_BUY" :   new TradeConditionTemplate("CUR_X%HIGHER_PREV_BUY", "if current day opens higher than previous BUY with at least",
                                    (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                    {
                                        if(!portofolio.lastHistoryItem) return false;
                                        return (100 - thresholdValue) / 100 * tradeData.open > portofolio.lastHistoryItem.sharePrice;
                                    })
}
export const tradeActionTemplates: { [id: string]: TradeActionTemplate } = {
    "BUY":                  new TradeActionTemplate("BUY", "Buy",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                    let sharePrice: number = tradeData.open * numberOfShares;
                                    if(portofolio.amountOfMoney < sharePrice) {
                                        return;
                                    }
                                    portofolio.numberOfShares += numberOfShares;
                                    portofolio.amountOfMoney -= sharePrice;
                                    portofolio.history.push(new HistoryItem("BUY", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                }),
    "BUY_ALL":              new TradeActionTemplate("BUY_ALL", "Buy all",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                    if(portofolio.amountOfMoney < tradeData.open) {
                                        return;
                                    }
                                    numberOfShares = Math.floor(portofolio.amountOfMoney / tradeData.open);
                                    portofolio.numberOfShares += numberOfShares;
                                    portofolio.amountOfMoney -= tradeData.open * numberOfShares;
                                    portofolio.history.push(new HistoryItem("BUY", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                }),
    "SELL":                 new TradeActionTemplate("SELL", "Sell",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                    if(portofolio.numberOfShares < numberOfShares) {
                                        return;
                                    }
                                    let sharePrice: number = tradeData.open * numberOfShares;
                                    portofolio.numberOfShares -= numberOfShares;
                                    portofolio.amountOfMoney += sharePrice;
                                    portofolio.history.push(new HistoryItem("SELL", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                }),
    "SELL_ALL":             new TradeActionTemplate("SELL_ALL", "Sell all",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                    if(portofolio.numberOfShares === 0) {
                                        return;
                                    }
                                    portofolio.amountOfMoney += tradeData.open * portofolio.numberOfShares;
                                    portofolio.numberOfShares = 0;
                                    portofolio.history.push(new HistoryItem("SELL", tradeData.date, portofolio.numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                })
}