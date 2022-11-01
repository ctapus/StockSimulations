import { ArithmeticOperator } from "../entities/ArithmeticOperator";
import { Indicator } from "../entities/Indicator";
import Term from "../entities/Term";
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
        const indicator: Indicator = this.indicatorPresenter.read();
        const coeficient: number = this.coeficientPresenter.read();
        const arithmeticOperator: ArithmeticOperator = this.arithmeticOperatorPresenter.read();
        if(!indicator) {
            return null;
        }
        return new Term(indicator, coeficient, arithmeticOperator);
    }
}