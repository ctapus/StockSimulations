import { ArithmeticOperator, ArithmeticOperatorTypes } from "./ArithmeticOperator";
import { Indicator } from "./Indicator";
import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";

export default class Term {
    public coeficient: number;
    public arithmeticOperator: ArithmeticOperator;
    public indicator: Indicator;
    public constructor(indicator: Indicator, coeficient?: number, arithmeticOperator?: ArithmeticOperator) {
        this.coeficient = coeficient;
        this.arithmeticOperator = arithmeticOperator;
        this.indicator = indicator;
    }
    public evaluate(tradeTick: StockHistoryItem, portofolio: Portofolio): number {
        switch(this.arithmeticOperator.arithmeticOperatorType) {
            case ArithmeticOperatorTypes.ADDITION: return this.indicator.evaluate(tradeTick, portofolio) + this.coeficient;
            case ArithmeticOperatorTypes.SUBSTRACTION: return this.indicator.evaluate(tradeTick, portofolio) - this.coeficient;
            case ArithmeticOperatorTypes.MULTIPLICATION: return this.indicator.evaluate(tradeTick, portofolio) * this.coeficient;
            case ArithmeticOperatorTypes.DIVISION: return this.indicator.evaluate(tradeTick, portofolio) / this.coeficient;
        }
    }
    public toString(): string {
        return `${this.coeficient.toString()} ${this.arithmeticOperator?.toString()} ${this.indicator?.toString()}`;
    }
    public toCode(): string {
        return `${this.coeficient.toString()} ${this.arithmeticOperator?.toCode()} ${this.indicator?.toCode()}`;
    }
}