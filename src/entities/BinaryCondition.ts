import { ComparisonOperator, ComparisonOperatorTypes } from "./ComparisonOperator";
import { Indicator } from "./Indicator";
import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";

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
    public toCode(): string {
        return this.arithmeticOperatorType;
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
    public toCode(): string {
        return `${this.coeficient.toString()} ${this.arithmeticOperator.toCode()} ${this.indicator.toCode()}`;
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
            case ComparisonOperatorTypes.EQUAL: return this.term1.evaluate(tradeTick, portofolio) === this.term2.evaluate(tradeTick, portofolio);
            case ComparisonOperatorTypes.NOT_EQUAL: return this.term1.evaluate(tradeTick, portofolio) !== this.term2.evaluate(tradeTick, portofolio);
            case ComparisonOperatorTypes.GREATER_THAN_OR_EQUAL_TO: return this.term1.evaluate(tradeTick, portofolio) >= this.term2.evaluate(tradeTick, portofolio);
            case ComparisonOperatorTypes.LESS_THAN_OR_EQUAL_TO: return this.term1.evaluate(tradeTick, portofolio) <= this.term2.evaluate(tradeTick, portofolio);
            case ComparisonOperatorTypes.GREATER_THAN: return this.term1.evaluate(tradeTick, portofolio) > this.term2.evaluate(tradeTick, portofolio);
            case ComparisonOperatorTypes.LESS_THAN: return this.term1.evaluate(tradeTick, portofolio) < this.term2.evaluate(tradeTick, portofolio);
        }
    }
    public toString(): string {
        return `${this.term1.toString()} ${this.comparisonOperator.toString()} ${this.term2.toString()}`;
    }
    public toCode(): string {
        return `${this.term1.toCode()} ${this.comparisonOperator.toCode()} ${this.term2.toCode()}`;
    }
}