import BinaryCondition from './BinaryCondition';
import Action from './Action';

export default class StrategyBranch {
    public binaryCondition: BinaryCondition;
    public action: Action;
    constructor(action: Action, binaryCondition?: BinaryCondition) {
        this.binaryCondition = binaryCondition;
        this.action = action;
    }
    public simplify(): void {
        this.action.simplify();
        this.binaryCondition?.simplify();
    }
    public toString(): string {
        return `${this.action.toString()}${!this.binaryCondition ? "" : " when " + this.binaryCondition.toString()}`;
    }
    public toCode(): string {
        return `${this.action.toCode()}${!this.binaryCondition ? "" : " WHEN " + this.binaryCondition.toCode() }`;
    }
}
