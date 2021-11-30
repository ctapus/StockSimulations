import BinaryCondition from './BinaryCondition';
import Action from './Action';

export default class StrategyBranch {
    public binaryCondition: BinaryCondition;
    public action: Action;
    constructor(binaryCondition: BinaryCondition, action: Action) {
        this.binaryCondition = binaryCondition;
        this.action = action;
    }
    public toString(): string {
        return `${this.action.toString()} when ${this.binaryCondition.toString()}`;
    }
}
