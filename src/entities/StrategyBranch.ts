import Action from './Action';
import CompositeCondition from './CompositeCondition';

export default class StrategyBranch {
    public compositeCondition: CompositeCondition;
    public action: Action;
    constructor(action: Action, compositeCondition?: CompositeCondition) {
        this.compositeCondition = compositeCondition;
        this.action = action;
    }
    public simplify(): void {
        this.action.simplify();
        this.compositeCondition?.simplify();
    }
    public toString(): string {
        return `${this.action.toString()}${!this.compositeCondition ? "" : " when " + this.compositeCondition.toString()}`;
    }
    public toCode(): string {
        return `${this.action.toCode()}${!this.compositeCondition ? "" : " WHEN " + this.compositeCondition.toCode() }`;
    }
}
