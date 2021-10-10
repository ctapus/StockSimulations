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
        let low52Weeks: number = Number.MAX_SAFE_INTEGER;
        let high52Weeks: number = Number.MIN_SAFE_INTEGER;
        ret.sort((a, b) => a.date.getTime() - b.date.getTime());
        $.each(ret, (index, value) => {
            ret[index].previousDay = previousDayTrade;
            previousDayTrade = ret[index];
            if(null != ret[index].previousDay) {
                ret[index].openVariation = ret[index].open / ret[index].previousDay.open * 100;
            }
            if (index >= 52 * 5) { // Ignore the first 52*5 days
                for(let i: number = index - 52 * 5; i<= index; i++) {
                    if(ret[i].high >= high52Weeks) {
                        high52Weeks = ret[index].high;
                    }
                    if(ret[i].low <= low52Weeks) {
                        low52Weeks = ret[index].low;
                    }
                }
                ret[index].high52Weeks = high52Weeks;
                ret[index].low52Weeks = low52Weeks;
            }
        })
        return ret;
    }
}
