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
    public static readonly DAY_OPEN         = new IndicatorType("DAY_OPEN", "Day Open");
    public static readonly PREV_DAY_OPEN    = new IndicatorType("PREV_DAY_OPEN", "Previous Day Open");
    public static readonly PREV_BUY         = new IndicatorType("PREV_BUY", "Previous Buy Price");
    public static readonly MIN_52_WEEK      = new IndicatorType("MIN_52_WEEK", "52 Weeks Minimum");
    public static readonly MAX_52_WEEK      = new IndicatorType("MAX_52_WEEK", "52 Weeks Maximum");
    public static readonly SMA_50_DAYS      = new IndicatorType("SMA_50_DAYS", "Simple Moving Average 50 Days");
    public static readonly SMA_100_DAYS     = new IndicatorType("SMA_100_DAYS", "Simple Moving Average 100 Days");
    public static readonly SMA_200_DAYS     = new IndicatorType("SMA_200_DAYS", "Simple Moving Average 200 Days");
    public static readonly EMA_10_DAYS      = new IndicatorType("EMA_10_DAYS", "Exponential Moving Average 10 Days");
    public static readonly EMA_20_DAYS      = new IndicatorType("EMA_20_DAYS", "Exponential Moving Average 20 Days");
    public static readonly EMA_50_DAYS      = new IndicatorType("EMA_50_DAYS", "Exponential Moving Average 50 Days");
    public static readonly EMA_100_DAYS     = new IndicatorType("EMA_100_DAYS", "Exponential Moving Average 100 Days");
    public static readonly EMA_200_DAYS     = new IndicatorType("EMA_200_DAYS", "Exponential Moving Average 200 Days");
    public static readonly RSI_14_DAYS      = new IndicatorType("RSI_14_DAYS", "Relative Strength Index 200 Days");
    public static AllIndicatorTypes: IndicatorType[] = [ this.DAY_OPEN, this.PREV_DAY_OPEN, this.PREV_BUY, this.MIN_52_WEEK, this.MAX_52_WEEK, this.SMA_50_DAYS,
                                                         this.SMA_100_DAYS, this.SMA_200_DAYS, this.EMA_10_DAYS, this.EMA_20_DAYS, this.EMA_50_DAYS, this.EMA_100_DAYS,
                                                         this.EMA_200_DAYS, this.RSI_14_DAYS ];
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
            case IndicatorTypes.DAY_OPEN: return tradeTick.open;
            case IndicatorTypes.PREV_DAY_OPEN: return tradeTick.previousDay?.open;
            case IndicatorTypes.PREV_BUY: return portofolio?.lastHistoryItem.sharePrice;
            case IndicatorTypes.MIN_52_WEEK: return tradeTick.low52Weeks;
            case IndicatorTypes.MAX_52_WEEK: return tradeTick.high52Weeks;
            case IndicatorTypes.SMA_50_DAYS: return tradeTick.sma50Days;
            case IndicatorTypes.SMA_100_DAYS: return tradeTick.sma100Days;
            case IndicatorTypes.SMA_200_DAYS: return tradeTick.sma200Days;
            case IndicatorTypes.EMA_10_DAYS: return tradeTick.ema10Days;
            case IndicatorTypes.EMA_20_DAYS: return tradeTick.ema20Days;
            case IndicatorTypes.EMA_50_DAYS: return tradeTick.ema50Days;
            case IndicatorTypes.EMA_100_DAYS: return tradeTick.ema100Days;
            case IndicatorTypes.EMA_200_DAYS: return tradeTick.ema200Days;
            case IndicatorTypes.RSI_14_DAYS: return tradeTick.rsi14Days;
        }
    }
    public toString(): string {
        return this.indicatorType.classDescription;
    }
    public toCode(): string {
        return this.indicatorType.code;
    }
}