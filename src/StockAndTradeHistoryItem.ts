import StockHistoryItem from "./StockHistoryItem";

export default class StockAndTradeHistoryItem extends StockHistoryItem {
    public trade: string;
    public deepCopy(): StockHistoryItem {
        const ret: StockAndTradeHistoryItem = new StockAndTradeHistoryItem();
        ret.date = this.date;
        ret.open = this.open;
        ret.high = this.high;
        ret.low = this.low;
        ret.close = this.close;
        ret.volume = this.volume;
        ret.high52Weeks = this.high52Weeks;
        ret.low52Weeks = this.low52Weeks;
        ret.trade = this.trade;
        return ret;
    }
}
