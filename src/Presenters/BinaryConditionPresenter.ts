import BinaryCondition from "../entities/BinaryCondition";
import { ComparisonOperator } from "../entities/ComparisonOperator";
import Term from "../entities/Term";
import ComparisonOperatorPresenter from "./ComparisonOperatorPresenter";
import { Presenter } from "./Presenter";
import TermPresenter from "./TermPresenter";

export default class BinaryConditionPresenter extends Presenter<BinaryCondition> {
    private term1Presenter: TermPresenter = new TermPresenter(`${this.controlId}_term1`);
    private comparisonOperatorPresenter: ComparisonOperatorPresenter = new ComparisonOperatorPresenter(`${this.controlId}_comparisonOperator`);
    private term2Presenter: TermPresenter = new TermPresenter(`${this.controlId}_term2`);
    public render(): string {
        return `${this.term1Presenter.render()} ${this.comparisonOperatorPresenter.render()} ${this.term2Presenter.render()}`;
    }
    public read(): BinaryCondition {
        const term1: Term = this.term1Presenter.read();
        const comparisonOperator: ComparisonOperator = this.comparisonOperatorPresenter.read();
        const term2: Term = this.term2Presenter.read();
        if(!term1 || !comparisonOperator || !term2) {
            return null;
        }
        return new BinaryCondition(term1, comparisonOperator, term2);
    }
}