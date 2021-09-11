export default class TradeData {
    public date: Date;
    public open: number;
    public high: number;
    public low: number;
    public close: number;
    public volume: number;
    public previousDay: TradeData;
    public openVariation: number;
    public high52Weeks: number;
    public low52Weeks: number;
    public deepCopy(): TradeData {
        const ret: TradeData = new TradeData();
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
}
