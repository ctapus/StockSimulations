import Indicators from "./Indicators";

export default class StockHistoryItem {
    public date: Date;
    public open: number;
    public high: number;
    public low: number;
    public close: number;
    public volume: number;
    public previousDay: StockHistoryItem;
    public openVariation: number;
    public high52Weeks: number;
    public low52Weeks: number;
    public sma50DaysOpen: number;
    public sma100DaysOpen: number;
    public sma200DaysOpen: number;
    public ema50DaysOpen: number;
    public ema100DaysOpen: number;
    public ema200DaysOpen: number;
    public deepCopy(): StockHistoryItem {
        const ret: StockHistoryItem = new StockHistoryItem();
        ret.date = this.date;
        ret.open = this.open;
        ret.high = this.high;
        ret.low = this.low;
        ret.close = this.close;
        ret.volume = this.volume;
        ret.high52Weeks = this.high52Weeks;
        ret.low52Weeks = this.low52Weeks;
        return ret;
    }
    public static loadFromAlphavantage(data: any):Array<StockHistoryItem> {
        let ret: Array<StockHistoryItem> = new Array<StockHistoryItem>();
        $.each(data["Time Series (Daily)"], (index, value) =>{
            const tradeData: StockHistoryItem = new StockHistoryItem();
            tradeData.date = new Date(index.toString());
            tradeData.open = Number(data["Time Series (Daily)"][index]["1. open"]);
            tradeData.high = Number(data["Time Series (Daily)"][index]["2. high"]);
            tradeData.low = Number(data["Time Series (Daily)"][index]["3. low"]);
            tradeData.close = Number(data["Time Series (Daily)"][index]["4. close"]);
            tradeData.volume = Number(data["Time Series (Daily)"][index]["5. volume"]);
            ret.push(tradeData);
        });
        let previousDayTrade: StockHistoryItem = null;
        ret.sort((a, b) => a.date.getTime() - b.date.getTime());
        $.each(ret, (index, value) => {
            ret[index].previousDay = previousDayTrade;
            previousDayTrade = ret[index];
            if(null != ret[index].previousDay) {
                ret[index].openVariation = ret[index].open / ret[index].previousDay.open * 100;
            }
        });
        const indicator: Indicators = new Indicators(ret);
        // TODO: investigate running all in the same loop to improve performance
        indicator.populate52WeeksRange();
        indicator.populate50DaysOpenSMA();
        indicator.populate100DaysOpenSMA();
        indicator.populate200DaysOpenSMA();
        indicator.populate50DaysOpenEMA();
        indicator.populate100DaysOpenEMA();
        indicator.populate200DaysOpenEMA();
        return ret;
    }
}
