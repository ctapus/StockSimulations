import { ArithmeticOperator } from "../entities/ArithmeticOperator";
import { Indicator } from "../entities/Indicator";
import { Scope } from "../entities/Scope";
import Term from "../entities/Term";
import ArithmeticOperatorPresenter from "./ArithmeticOperatorPresenter";
import { CoeficientPresenter } from "./CoeficientPresenter";
import { IndicatorPresenter } from "./IndicatorPresenter";
import { Presenter } from "./Presenter";
import { ScopePresenter } from "./ScopePresenter";

export default class TermPresenter extends Presenter<Term> {
    private coeficientPresenter: CoeficientPresenter = new CoeficientPresenter(`${this.controlId}_coeficient`);
    private arithmeticOperatorPresenter: ArithmeticOperatorPresenter = new ArithmeticOperatorPresenter(`${this.controlId}_arithmeticOperator`);
    private scopePresenter: ScopePresenter = new ScopePresenter(`${this.controlId}_scope`);
    private indicatorPresenter: IndicatorPresenter = new IndicatorPresenter(`${this.controlId}_indicator`);
    public render(): string {
        return `${this.coeficientPresenter.render()} ${this.arithmeticOperatorPresenter.render()} ${this.scopePresenter.render()} ${this.indicatorPresenter.render()}`;
    }
    public read(): Term {
        const scope: Scope = this.scopePresenter.read();
        const indicator: Indicator = this.indicatorPresenter.read();
        const coeficient: number = this.coeficientPresenter.read();
        const arithmeticOperator: ArithmeticOperator = this.arithmeticOperatorPresenter.read();
        if(!indicator) {
            return null;
        }
        return new Term(scope, indicator, coeficient, arithmeticOperator);
    }
}