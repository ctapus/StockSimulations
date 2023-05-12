import BinaryCondition from "./BinaryCondition";
import { LogicalOperator, LogicalOperatorTypes } from "./LogicalOperator";
import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";

export default class CompositeCondition {
    public left: CompositeCondition;
    public node: LogicalOperator | BinaryCondition;
    public right: CompositeCondition;
    public constructor(input?: LogicalOperator | BinaryCondition) {
        this.node = input;
    }
    public evaluate(tradeTick: StockHistoryItem, portofolio: Portofolio): boolean {
        if(this.node instanceof BinaryCondition) {
            return this.node.evaluate(tradeTick, portofolio);
        }
        if(this.node instanceof LogicalOperator) {
            switch(this.node.logicalOperatorType) {
                case LogicalOperatorTypes.CONJUNCTION: return this.left.evaluate(tradeTick, portofolio) && this.right.evaluate(tradeTick, portofolio);
                case LogicalOperatorTypes.DISJUNCTION: return this.left.evaluate(tradeTick, portofolio) || this.right.evaluate(tradeTick, portofolio);
            }
        }
    }
    public simplify(): void {
        this.left?.simplify();
        this.right?.simplify();
    }
    public toString(): string {
        return `${this.left?.toString()} ${this.node?.toString()} ${this.right?.toString()}`;
    }
    public toCode(): string {
        return `${this.left?.toCode()} ${this.node?.toCode()} ${this.right?.toCode()}`;
    }
}