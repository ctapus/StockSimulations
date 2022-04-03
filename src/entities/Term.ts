import { ArithmeticOperator, ArithmeticOperatorType, ArithmeticOperatorTypes } from "./ArithmeticOperator";
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
        if(!this.coeficient || !this.arithmeticOperator) {
            return this.indicator.evaluate(tradeTick, portofolio);
        }
        switch(this.arithmeticOperator.arithmeticOperatorType) {
            case ArithmeticOperatorTypes.ADDITION: return this.indicator.evaluate(tradeTick, portofolio) + this.coeficient;
            case ArithmeticOperatorTypes.SUBSTRACTION: return this.indicator.evaluate(tradeTick, portofolio) - this.coeficient;
            case ArithmeticOperatorTypes.MULTIPLICATION: return this.indicator.evaluate(tradeTick, portofolio) * this.coeficient;
            case ArithmeticOperatorTypes.DIVISION: return this.indicator.evaluate(tradeTick, portofolio) / this.coeficient;
        }
    }
    public simplify(): void {
        if(!this.arithmeticOperator || !this.coeficient) {
            return;
        }
        if((this.arithmeticOperator.arithmeticOperatorType.code === ArithmeticOperatorTypes.MULTIPLICATION.code && this.coeficient === 1) ||
         (this.arithmeticOperator.arithmeticOperatorType.code === ArithmeticOperatorTypes.ADDITION.code && this.coeficient === 0)){
                this.coeficient = null;
                this.arithmeticOperator = null;
            }
    }
    public toString(): string {
        if(!this.coeficient || !this.arithmeticOperator) {
            return `${this.indicator?.toString()}`;
        }
        else {
            return `${ this.coeficient.toString()} ${this.arithmeticOperator?.toString()} ${this.indicator?.toString()}`;
        }
    }
    public toCode(): string {
        if(!this.coeficient || !this.arithmeticOperator) {
            return `${this.indicator?.toCode()}`;
        }
        else {
            return `${this.coeficient.toString()} ${this.arithmeticOperator?.toCode()} ${this.indicator?.toCode()}`;
        }
    }
}