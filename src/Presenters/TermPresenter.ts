import { Term } from "../entities/BinaryCondition";
import ArithmeticOperatorPresenter from "./ArithmeticOperatorPresenter";
import { CoeficientPresenter } from "./CoeficientPresenter";
import { IndicatorPresenter } from "./IndicatorPresenter";
import { Presenter } from "./Presenter";

export default class TermPresenter extends Presenter<Term> {
    private coeficientPresenter: CoeficientPresenter = new CoeficientPresenter(`${this.controlId}_coeficient`);
    private arithmeticOperatorPresenter: ArithmeticOperatorPresenter = new ArithmeticOperatorPresenter(`${this.controlId}_arithmeticOperator`);
    private indicatorPresenter: IndicatorPresenter = new IndicatorPresenter(`${this.controlId}_indicator`);
    public render(): string {
        return `${this.coeficientPresenter.render()} ${this.arithmeticOperatorPresenter.render()} ${this.indicatorPresenter.render()}`;
    }
    public read(): Term {
        return new Term(this.indicatorPresenter.read(), this.coeficientPresenter.read(), this.arithmeticOperatorPresenter.read());
    }
}