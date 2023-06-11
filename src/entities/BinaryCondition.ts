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
        const term1Value = this.term1.evaluate(tradeTick, portofolio);
        const term2Value = this.term2.evaluate(tradeTick, portofolio);
        if(null == term1Value || null == term2Value) {
            return false;
        }
        switch(this.comparisonOperator.comparisonOperatorType) {
            case ComparisonOperatorTypes.EQUAL:                     return term1Value ===   term2Value;
            case ComparisonOperatorTypes.NOT_EQUAL:                 return term1Value !==   term2Value;
            case ComparisonOperatorTypes.GREATER_THAN_OR_EQUAL_TO:  return term1Value >=    term2Value;
            case ComparisonOperatorTypes.LESS_THAN_OR_EQUAL_TO:     return term1Value <=    term2Value;
            case ComparisonOperatorTypes.GREATER_THAN:              return term1Value >     term2Value;
            case ComparisonOperatorTypes.LESS_THAN:                 return term1Value <     term2Value;
        }
    }
    public simplify(): void {
        this.term1.simplify();
        this.term2.simplify();
    }
    public toString(): string {
        return `${this.term1?.toString()} ${this.comparisonOperator?.toString()} ${this.term2?.toString()}`;
    }
    public toCode(): string {
        return `${this.term1?.toCode()} ${this.comparisonOperator?.toCode()} ${this.term2?.toCode()}`;
    }
}