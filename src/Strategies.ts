import TradeHistoryItem from "./TradeHistoryItem";
import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";
import TradeConditionTemplate from './TradeConditionTemplate';
import TradeActionTemplate from './TradeActionTemplate';

export const tradeConditionTemplates: { [id: string]: TradeConditionTemplate } = {
    "FIRST_DAY"                     :   new TradeConditionTemplate("FIRST_DAY", "first DAY",
                                            (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                return portofolio.history.length === 0;
                                            },
                                            "",
                                        (thresholdValue) => `on the first DAY only.`),
    "EVERY_XTH_DAY"                 :   new TradeConditionTemplate("EVERY_XTH_DAY", "every xth DAY",
                                            (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(portofolio.history.length === 0) {
                                                    return true;
                                                }
                                                const days: number = Math.floor((tradeData.date.getTime() - portofolio.lastHistoryItem.date.getTime())/86400000);
                                                return days%thresholdValue === 0;
                                            },
                                            "<input type='number' id='thresholdValue' value='5' min='0' /><span>&nbsp;days&nbsp;</span>",
                                        (thresholdValue) => `every ${thresholdValue}th DAY.`),
    "CUR_LOWER_PREV_TICK"           :   new TradeConditionTemplate("CUR_LOWER_PREV_TICK", "if current day opens lower than previous DAY",
                                            (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!tradeData.previousDay) return false;
                                                return tradeData.open < tradeData.previousDay.open;
                                            },
                                            "",
                                            (thresholdValue) => `if current day opens lower than previous DAY.`),
    "CUR_X%LOWER_PREV_TICK"         :   new TradeConditionTemplate("CUR_X%LOWER_PREV_TICK", "if current day opens lower than previous DAY with at least",
                                            (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!tradeData.previousDay) return false;
                                                return (tradeData.open / tradeData.previousDay.open * 100) <= (100 - thresholdValue);
                                            },
                                            "<input type='number' id='thresholdValue' value='3' min='0' /><span>&nbsp;%&nbsp;</span>",
                                            (thresholdValue) => `if current day opens lower than previous DAY with at least ${thresholdValue}%.`),
    "CUR_X%LOWER_PREV_BUY"          :   new TradeConditionTemplate("CUR_X%LOWER_PREV_BUY", "if current day opens lower than previous BUY with at least",
                                            (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!portofolio.lastHistoryItem) return false;
                                                return (tradeData.open / portofolio.lastHistoryItem.sharePrice * 100) <= (100 - thresholdValue);
                                            },
                                            "<input type='number' id='thresholdValue' value='3' min='0' /><span>&nbsp;%&nbsp;</span>",
                                            (thresholdValue) => `if current day opens lower than previous BUY with at least ${thresholdValue} %.`),
    "CUR_HIGHER_PREV_TICK"          :   new TradeConditionTemplate("CUR_HIGHER_PREV_TICK", "if current day open higher than previous DAY",
                                            (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!tradeData.previousDay) return false;
                                                return tradeData.open > tradeData.previousDay.open;
                                            },
                                            "",
                                            (thresholdValue) => `if current day opens higher than previous day.`),
    "CUR_X%HIGHER_PREV_TICK"        :   new TradeConditionTemplate("CUR_X%HIGHER_PREV_TICK", "if current day opens higher than previous DAY with at least",
                                            (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!tradeData.previousDay) return false;
                                                return (tradeData.open / tradeData.previousDay.open * 100) >= (100 + thresholdValue);
                                            },
                                            "<input type='number' id='thresholdValue' value='3' min='0' /><span>&nbsp;%&nbsp;</span>",
                                            (thresholdValue) => `if current day opens higher than previous DAY with at least ${thresholdValue}%.`),
    "CUR_X%HIGHER_PREV_BUY"         :   new TradeConditionTemplate("CUR_X%HIGHER_PREV_BUY", "if current day opens higher than previous BUY with at least",
                                            (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                if(!portofolio.lastHistoryItem) return false;
                                                return (tradeData.open / portofolio.lastHistoryItem.sharePrice * 100) >= (100 + thresholdValue);
                                            },
                                            "<input type='number' id='thresholdValue' value='3' min='0' /><span>&nbsp;%&nbsp;</span>",
                                            (thresholdValue) => `if current day opens higher than previous BUY with at least ${thresholdValue}%.`),
    "CUR_X%LOWER_52_WEEKS_LOW"      :   new TradeConditionTemplate("CUR_X%LOWER_52_WEEKS_LOW", "if current day opens lower than previous 52 WEEKS LOW with at least",
                                            (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                return (tradeData.open / tradeData.low52Weeks * 100) <= (100 - thresholdValue);
                                            },
                                            "<input type='number' id='thresholdValue' value='3' min='0' /><span>&nbsp;%&nbsp;</span>",
                                            (thresholdValue) => `if current day opens lower than previous 52 WEEKS with at least ${thresholdValue}%.`),
    "CUR_X%HIGHER_52_WEEKS_HIGH"    :   new TradeConditionTemplate("CUR_X%HIGHER_52_WEEKS_HIGH", "if current day opens higher than previous 52 WEEKS HIGH with at least",
                                            (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean =>
                                            {
                                                return (tradeData.open / tradeData.high52Weeks * 100) >= (100 + thresholdValue);
                                            },
                                            "<input type='number' id='thresholdValue' value='3' min='0' /><span>&nbsp;%&nbsp;</span>",
                                            (thresholdValue) => `if current day opens higher than previous 52 WEEKS with at least ${thresholdValue} %.`)
}
export const tradeActionTemplates: { [id: string]: TradeActionTemplate } = {
    "BUY":                  new TradeActionTemplate("BUY", "Buy non-fractional number of shares",
                                (tradeData: StockHistoryItem, portofolio: Portofolio, numberOfShares: number): void => {
                                    const sharesPrice: number = tradeData.open * numberOfShares;
                                    if(portofolio.amountOfMoney < sharesPrice) {
                                        return;
                                    }
                                    portofolio.numberOfShares += numberOfShares;
                                    portofolio.amountOfMoney -= sharesPrice;
                                    portofolio.history.push(new TradeHistoryItem("BUY", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                },
                                "<input type='number' id='numberOfSharesOrPercentage' value='1' min='0' /><span>&nbsp;shares&nbsp;</span>",
                                (numberOfSharesOrPercentage) => `Buy ${numberOfSharesOrPercentage} shares`),
    "BUY_PERCENTAGE":       new TradeActionTemplate("BUY_PERCENTAGE", "Buy shares with percentage of money (rounded to the maximum number of non-fractional shares)",
                                (tradeData: StockHistoryItem, portofolio: Portofolio, moneyPercentage: number): void => {
                                    const maximumAmountOfMoney: number = portofolio.amountOfMoney * moneyPercentage / 100;
                                    if(maximumAmountOfMoney < tradeData.open) {
                                        return;
                                    }
                                    const numberOfShares = Math.floor(maximumAmountOfMoney / tradeData.open);
                                    portofolio.numberOfShares += numberOfShares;
                                    portofolio.amountOfMoney -= tradeData.open * numberOfShares;
                                    portofolio.history.push(new TradeHistoryItem("BUY_PERCENTAGE", tradeData.date, moneyPercentage, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                },
                                "<input type='number' id='numberOfSharesOrPercentage' value='100' min='0' max='100' /><span> percent of money </span>",
                                (numberOfSharesOrPercentage) => `Buy ${numberOfSharesOrPercentage} % of money (rounded to the maximum number of non-fractional shares)`),
    "SELL":                 new TradeActionTemplate("SELL", "Sell non-fractional number of shares",
                                (tradeData: StockHistoryItem, portofolio: Portofolio, numberOfShares: number): void => {
                                    if(portofolio.numberOfShares < numberOfShares) {
                                        return;
                                    }
                                    const sharePrice: number = tradeData.open * numberOfShares;
                                    portofolio.numberOfShares -= numberOfShares;
                                    portofolio.amountOfMoney += sharePrice;
                                    portofolio.history.push(new TradeHistoryItem("SELL", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                },
                                "<input type='number' id='numberOfSharesOrPercentage' value='1' min='0' /><span>&nbsp;shares&nbsp;</span>",
                                (numberOfSharesOrPercentage) => `Sell ${numberOfSharesOrPercentage} shares`),
    "SELL_PERCENTAGE":      new TradeActionTemplate("SELL_PERCENTAGE", "Sell percentage of owned shares (rounded to smallest integer)",
                                (tradeData: StockHistoryItem, portofolio: Portofolio, sharesPercentage: number): void => {
                                    const numberOfSharesToSell: number = Math.floor(portofolio.numberOfShares * sharesPercentage / 100);
                                    if(portofolio.numberOfShares < numberOfSharesToSell) {
                                        return;
                                    }
                                    portofolio.numberOfShares -= numberOfSharesToSell;
                                    portofolio.amountOfMoney += tradeData.open * numberOfSharesToSell;
                                    portofolio.history.push(new TradeHistoryItem("SELL_PERCENTAGE", tradeData.date, numberOfSharesToSell, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                },
                                "<input type='number' id='numberOfSharesOrPercentage' value='100' min='0' max='100' /><span> percent of shares </span>",
                                (numberOfSharesOrPercentage) => `Sell ${numberOfSharesOrPercentage} % of owned shares (rounded to smallest integer)`)
}