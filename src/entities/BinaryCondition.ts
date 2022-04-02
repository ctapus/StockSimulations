import { ComparisonOperator, ComparisonOperatorTypes } from "./ComparisonOperator";
import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";
import Term from "./Term";

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