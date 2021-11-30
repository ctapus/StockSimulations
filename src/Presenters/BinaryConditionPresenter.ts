import BinaryCondition from "../entities/BinaryCondition";
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
        return new BinaryCondition(this.term1Presenter.read(), this.comparisonOperatorPresenter.read(), this.term2Presenter.read());
    }
}