export default class TradeData {
    public date: Date;
    public open: number;
    public high: number;
    public low: number;
    public close: number;
    public volume: number;
    public previousDay: TradeData;
    public openVariation: number;
    public deepCopy(): TradeData {
        const ret: TradeData = new TradeData();
        ret.date = this.date;
        ret.open = this.open;
        ret.high = this.high;
        ret.low = this.low;
        ret.close = this.close;
        ret.volume = this.volume;
        return ret;
    }
}
