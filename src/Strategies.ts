import HistoryItem from "./HistoryItem";
import Portofolio from "./Portofolio";
import TradeData from "./TradeData";
import TradeConditionTemplate from './TradeConditionTemplate';
import TradeActionTemplate from './TradeActionTemplate';

export const tradeConditionTemplates: { [id: string]: TradeConditionTemplate } = {
    "FIRST_DAY"                     :   new TradeConditionTemplate("FIRST_DAY", "first DAY",
                                            (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            { return null === tradeData.previousDay; }),
    "DAILY"                         :   new TradeConditionTemplate("DAILY", "every DAY",
                                            (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            { return true; }),
    "CUR_LOWER_PREV_TICK"           :   new TradeConditionTemplate("CUR_LOWER_PREV_TICK", "if current day opens lower than previous DAY",
                                            (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!tradeData.previousDay) return false;
                                                return tradeData.open < tradeData.previousDay.open;
                                            }),
    "CUR_X%LOWER_PREV_TICK"         :   new TradeConditionTemplate("CUR_X%LOWER_PREV_TICK", "if current day opens lower than previous DAY with at least",
                                            (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!tradeData.previousDay) return false;
                                                return (tradeData.open / tradeData.previousDay.open * 100) <= (100 - thresholdValue);
                                            }),
    "CUR_X%LOWER_PREV_BUY"          :   new TradeConditionTemplate("CUR_X%LOWER_PREV_BUY", "if current day opens lower than previous BUY with at least",
                                            (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!portofolio.lastHistoryItem) return false;
                                                return (tradeData.open / portofolio.lastHistoryItem.sharePrice * 100) <= (100 - thresholdValue);
                                            }),
    "CUR_HIGHER_PREV_TICK"          :   new TradeConditionTemplate("CUR_HIGHER_PREV_TICK", "if current day open higher than previous DAY",
                                            (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!tradeData.previousDay) return false;
                                                return tradeData.open > tradeData.previousDay.open;
                                            }),
    "CUR_X%HIGHER_PREV_TICK"        :   new TradeConditionTemplate("CUR_X%HIGHER_PREV_TICK", "if current day opens higher than previous DAY with at least",
                                            (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!tradeData.previousDay) return false;
                                                return (tradeData.open / tradeData.previousDay.open * 100) >= (100 + thresholdValue);
                                            }),
    "CUR_X%HIGHER_PREV_BUY"         :   new TradeConditionTemplate("CUR_X%HIGHER_PREV_BUY", "if current day opens higher than previous BUY with at least",
                                            (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!portofolio.lastHistoryItem) return false;
                                                return (tradeData.open / portofolio.lastHistoryItem.sharePrice * 100) >= (100 + thresholdValue);
                                            }),
    "CUR_X%LOWER_52_WEEKS_LOW"      :   new TradeConditionTemplate("CUR_X%LOWER_52_WEEKS_LOW", "if current day opens lower than previous 52 WEEKS LOW with at least",
                                            (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                return (tradeData.open / tradeData.low52Weeks * 100) <= (100 - thresholdValue);
                                            }),
    "CUR_X%HIGHER_52_WEEKS_HIGH"    :   new TradeConditionTemplate("CUR_X%HIGHER_52_WEEKS_HIGH", "if current day opens higher than previous 52 WEEKS HIGH with at least",
                                            (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                return (tradeData.open / tradeData.high52Weeks * 100) >= (100 + thresholdValue);
                                            })
}
export const tradeActionTemplates: { [id: string]: TradeActionTemplate } = {
    "BUY":                  new TradeActionTemplate("BUY", "Buy non-fractional number of shares",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfSharesOrPercentage: number): void => {
                                    let sharePrice: number = tradeData.open * numberOfSharesOrPercentage;
                                    if(portofolio.amountOfMoney < sharePrice) {
                                        return;
                                    }
                                    portofolio.numberOfShares += numberOfSharesOrPercentage;
                                    portofolio.amountOfMoney -= sharePrice;
                                    portofolio.history.push(new HistoryItem("BUY", tradeData.date, numberOfSharesOrPercentage, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                },
                                "<input type='number' id='numberOfSharesOrPercentage' value='1' min='0' /><span>&nbsp;shares&nbsp;</span>",
                                (numberOfSharesOrPercentage) => `Buy ${numberOfSharesOrPercentage} shares`),
    "BUY_PERCENTAGE":       new TradeActionTemplate("BUY_PERCENTAGE", "Buy shares with percentage of money (rounded to the maximum number of non-fractional shares)",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfSharesOrPercentage: number): void => {
                                    if(portofolio.amountOfMoney < tradeData.open) {
                                        return;
                                    }
                                    numberOfSharesOrPercentage = Math.floor(portofolio.amountOfMoney / tradeData.open);
                                    portofolio.numberOfShares += numberOfSharesOrPercentage;
                                    portofolio.amountOfMoney -= tradeData.open * numberOfSharesOrPercentage;
                                    portofolio.history.push(new HistoryItem("BUY", tradeData.date, numberOfSharesOrPercentage, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                },
                                "<input type='number' id='numberOfSharesOrPercentage' value='100' min='0' max='100' /><span> percent of money </span>",
                                (numberOfSharesOrPercentage) => `Buy ${numberOfSharesOrPercentage} % of money (rounded to the maximum number of non-fractional shares)`),
    "SELL":                 new TradeActionTemplate("SELL", "Sell non-fractional number of shares",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfSharesOrPercentage: number): void => {
                                    if(portofolio.numberOfShares < numberOfSharesOrPercentage) {
                                        return;
                                    }
                                    let sharePrice: number = tradeData.open * numberOfSharesOrPercentage;
                                    portofolio.numberOfShares -= numberOfSharesOrPercentage;
                                    portofolio.amountOfMoney += sharePrice;
                                    portofolio.history.push(new HistoryItem("SELL", tradeData.date, numberOfSharesOrPercentage, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                },
                                "<input type='number' id='numberOfSharesOrPercentage' value='1' min='0' /><span>&nbsp;shares&nbsp;</span>",
                                (numberOfSharesOrPercentage) => `Sell ${numberOfSharesOrPercentage} shares`),
    "SELL_PERCENTAGE":      new TradeActionTemplate("SELL_PERCENTAGE", "Sell percentage of owned shares (rounded to smallest integer)",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfSharesOrPercentage: number): void => {
                                    if(portofolio.numberOfShares === 0) {
                                        return;
                                    }
                                    portofolio.amountOfMoney += tradeData.open * portofolio.numberOfShares;
                                    portofolio.numberOfShares = 0;
                                    portofolio.history.push(new HistoryItem("SELL", tradeData.date, portofolio.numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                },
                                "<input type='number' id='numberOfSharesOrPercentage' value='100' min='0' max='100' /><span> percent of shares </span>",
                                (numberOfSharesOrPercentage) => `Sell ${numberOfSharesOrPercentage} % of owned shares (rounded to smallest integer)`)
}