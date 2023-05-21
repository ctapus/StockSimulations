import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";

export class IndicatorType {
    public code: string;
    public classDescription: string;
    constructor(code: string, classDescription: string) {
        this.code = code;
        this.classDescription = classDescription;
    }
}
export class IndicatorTypes {
    public static readonly TODAY_OPEN             = new IndicatorType("TODAY.OPEN", "Today Open");
    public static readonly YESTERDAY_OPEN         = new IndicatorType("YESTERDAY.OPEN", "Yesterday Open");
    public static readonly PREV_BUY               = new IndicatorType("PREV_BUY", "Previous Buy Price");
    public static readonly TODAY_MIN_52_WEEK      = new IndicatorType("TODAY.MIN_52_WEEK", "Today 52 Weeks Minimum");
    public static readonly TODAY_MAX_52_WEEK      = new IndicatorType("TODAY.MAX_52_WEEK", "Today 52 Weeks Maximum");
    public static readonly TODAY_SMA_50_DAYS      = new IndicatorType("TODAY.SMA_50_DAYS", "Today Simple Moving Average 50 Days");
    public static readonly TODAY_SMA_100_DAYS     = new IndicatorType("TODAY.SMA_100_DAYS", "Today Simple Moving Average 100 Days");
    public static readonly TODAY_SMA_200_DAYS     = new IndicatorType("TODAY.SMA_200_DAYS", "Today Simple Moving Average 200 Days");
    public static readonly TODAY_EMA_50_DAYS      = new IndicatorType("TODAY.EMA_50_DAYS", "Today Exponential Moving Average 50 Days");
    public static readonly TODAY_EMA_100_DAYS     = new IndicatorType("TODAY.EMA_100_DAYS", "Today Exponential Moving Average 100 Days");
    public static readonly TODAY_EMA_200_DAYS     = new IndicatorType("TODAY.EMA_200_DAYS", "Today Exponential Moving Average 200 Days");
    public static AllIndicatorTypes: IndicatorType[] = [ this.TODAY_OPEN, this.YESTERDAY_OPEN, this.PREV_BUY, this.TODAY_MIN_52_WEEK, this.TODAY_MAX_52_WEEK, this.TODAY_SMA_50_DAYS,
                                                         this.TODAY_SMA_100_DAYS, this.TODAY_SMA_200_DAYS, this.TODAY_EMA_50_DAYS, this.TODAY_EMA_100_DAYS, this.TODAY_EMA_200_DAYS ];
    public static item(key: string): IndicatorType {
        return this.AllIndicatorTypes.filter(x => x.code.toUpperCase() === key.toUpperCase())[0];
    }
}
export class Indicator {
    public indicatorType: IndicatorType;
    public constructor(s: string) {
        this.indicatorType = IndicatorTypes.item(s);
    }
    public evaluate(tradeTick: StockHistoryItem, portofolio: Portofolio): number {
        switch(this.indicatorType) {
            case IndicatorTypes.TODAY_OPEN: return tradeTick.open;
            case IndicatorTypes.YESTERDAY_OPEN: return tradeTick.previousDay?.open;
            case IndicatorTypes.PREV_BUY: return portofolio?.lastHistoryItem.sharePrice;
            case IndicatorTypes.TODAY_MIN_52_WEEK: return tradeTick.low52Weeks;
            case IndicatorTypes.TODAY_MAX_52_WEEK: return tradeTick.high52Weeks;
            case IndicatorTypes.TODAY_SMA_50_DAYS: return tradeTick.sma50Days;
            case IndicatorTypes.TODAY_SMA_100_DAYS: return tradeTick.sma100Days;
            case IndicatorTypes.TODAY_SMA_200_DAYS: return tradeTick.sma200Days;
            case IndicatorTypes.TODAY_EMA_50_DAYS: return tradeTick.ema50Days;
            case IndicatorTypes.TODAY_EMA_100_DAYS: return tradeTick.ema100Days;
            case IndicatorTypes.TODAY_EMA_200_DAYS: return tradeTick.ema200Days;
        }
    }
    public toString(): string {
        return this.indicatorType.classDescription;
    }
    public toCode(): string {
        return this.indicatorType.code;
    }
}