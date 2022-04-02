import BinaryCondition from './BinaryCondition';
import Action from './Action';

export default class StrategyBranch {
    public binaryCondition: BinaryCondition;
    public action: Action;
    constructor(binaryCondition: BinaryCondition, action: Action) {
        this.binaryCondition = binaryCondition;
        this.action = action;
    }
    public simplify(): void {
        this.action.simplify();
        this.binaryCondition.simplify();
    }
    public toString(): string {
        return `${this.action.toString()} when ${this.binaryCondition.toString()}`;
    }
    public toCode(): string {
        return `${this.action.toCode()} WHEN ${this.binaryCondition.toCode()}`;
    }
}
