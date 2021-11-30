import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";

export enum IndicatorType {             DAY_OPEN = "Day Open",
                                        PREV_DAY_OPEN = "Previous Day Open",
                                        PREV_BUY = "Previous Buy Price",
                                        MIN_52_WEEK = "52 Weeks Minimum",
                                        MAX_52_WEEK = "52 Weeks Maximum",
                                        SMA_50_DAYS = "Simple Moving Average 50 Days",
                                        SMA_100_DAYS = "Simple Moving Average 100 Days",
                                        SMA_200_DAYS = "Simple Moving Average 200 Days",
                                        EMA_50_DAYS = "Exponential Moving Average 50 Days",
                                        EMA_100_DAYS = "Exponential Moving Average 100 Days",
                                        EMA_200_DAYS = "Exponential Moving Average 200 Days" }
export class Indicator {
    public indicatorType: IndicatorType;
    public constructor(s: string) {
        this.indicatorType = IndicatorType[s];
    }
    public evaluate(tradeTick: StockHistoryItem, portofolio: Portofolio): number {
        switch(this.indicatorType) {
            case IndicatorType.DAY_OPEN: return tradeTick.open;
            case IndicatorType.PREV_DAY_OPEN: return tradeTick.previousDay?.open;
            case IndicatorType.PREV_BUY: return portofolio?.lastHistoryItem.sharePrice;
            case IndicatorType.MIN_52_WEEK: return tradeTick.low52Weeks;
            case IndicatorType.MAX_52_WEEK: return tradeTick.high52Weeks;
            case IndicatorType.SMA_50_DAYS: return tradeTick.sma50DaysOpen;
            case IndicatorType.SMA_100_DAYS: return tradeTick.sma100DaysOpen;
            case IndicatorType.SMA_200_DAYS: return tradeTick.sma200DaysOpen;
            case IndicatorType.EMA_50_DAYS: return tradeTick.ema50DaysOpen;
            case IndicatorType.EMA_100_DAYS: return tradeTick.ema100DaysOpen;
            case IndicatorType.EMA_200_DAYS: return tradeTick.ema200DaysOpen;
        }
    }
    public toString(): string {
        return this.indicatorType;
    }
}
export enum ArithmeticOperatorType {    ADDITION = "+",
                                        SUBSTRACTION = "-",
                                        MULTIPLICATION = "*",
                                        DIVISION = "/" }
export class ArithmeticOperator {
    public arithmeticOperatorType: ArithmeticOperatorType;
    public constructor(s: string) {
        this.arithmeticOperatorType = ArithmeticOperatorType[s];
    }
    public toString(): string {
        return this.arithmeticOperatorType;
    }
}
export enum ComparisonOperatorType {    EQUAL = "=",
                                        NOT_EQUAL = "!=",
                                        GREATER_THAN_OR_EQUAL_TO = ">=",
                                        LESS_THAN_OR_EQUAL_TO = "<=",
                                        GREATER_THAN = ">",
                                        LESS_THAN = "<" }
export class ComparisonOperator {
    public comparisonOperatorType: ComparisonOperatorType;
    public constructor(s: string) {
        this.comparisonOperatorType = ComparisonOperatorType[s];
    }
    public toString(): string {
        return this.comparisonOperatorType;
    }
}
export class Term {
    public coeficient: number;
    public arithmeticOperator: ArithmeticOperator;
    public indicator: Indicator;
    public constructor(coeficient: number, arithmeticOperator: ArithmeticOperator, indicator: Indicator) {
        this.coeficient = coeficient;
        this.arithmeticOperator = arithmeticOperator;
        this.indicator = indicator;
    }
    public evaluate(tradeTick: StockHistoryItem, portofolio: Portofolio): number {
        switch(this.arithmeticOperator.arithmeticOperatorType) {
            case ArithmeticOperatorType.ADDITION: return this.indicator.evaluate(tradeTick, portofolio) + this.coeficient;
            case ArithmeticOperatorType.SUBSTRACTION: return this.indicator.evaluate(tradeTick, portofolio) - this.coeficient;
            case ArithmeticOperatorType.MULTIPLICATION: return this.indicator.evaluate(tradeTick, portofolio) * this.coeficient;
            case ArithmeticOperatorType.DIVISION: return this.indicator.evaluate(tradeTick, portofolio) / this.coeficient;
        }
    }
    public toString(): string {
        return `${this.coeficient.toString()} ${this.arithmeticOperator.toString()} ${this.indicator.toString()}`;
    }
}
export default class BinaryCondition {
    public term1: Term;
    public comparisonOperator: ComparisonOperator;
    public term2: Term;
    public constructor(term1: Term, comparisonOperator: ComparisonOperator, term2: Term) {
        this.term1 = term1;
        this.comparisonOperator = comparisonOperator;
        this.term2 = term2;
    }
    public evaluate(tradeTick: StockHistoryItem, portofolio: Portofolio): boolean {
        switch(this.comparisonOperator.comparisonOperatorType) {
            case ComparisonOperatorType.EQUAL: return this.term1.evaluate(tradeTick, portofolio) === this.term2.evaluate(tradeTick, portofolio);
            case ComparisonOperatorType.NOT_EQUAL: return this.term1.evaluate(tradeTick, portofolio) !== this.term2.evaluate(tradeTick, portofolio);
            case ComparisonOperatorType.GREATER_THAN_OR_EQUAL_TO: return this.term1.evaluate(tradeTick, portofolio) >= this.term2.evaluate(tradeTick, portofolio);
            case ComparisonOperatorType.LESS_THAN_OR_EQUAL_TO: return this.term1.evaluate(tradeTick, portofolio) <= this.term2.evaluate(tradeTick, portofolio);
            case ComparisonOperatorType.GREATER_THAN: return this.term1.evaluate(tradeTick, portofolio) > this.term2.evaluate(tradeTick, portofolio);
            case ComparisonOperatorType.LESS_THAN: return this.term1.evaluate(tradeTick, portofolio) < this.term2.evaluate(tradeTick, portofolio);
        }
    }
    public toString(): string {
        return `${this.term1.toString()} ${this.comparisonOperator.toString()} ${this.term2.toString()}`;
    }
}