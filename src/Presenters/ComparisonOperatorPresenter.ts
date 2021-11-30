import { ComparisonOperator, ComparisonOperatorType } from "../entities/BinaryCondition";
import { Presenter } from "./Presenter";

export default class ComparisonOperatorPresenter extends Presenter<ComparisonOperator> {
    public render(): string {
        const options: string = Object.keys(ComparisonOperatorType).map(x => `<option value='${x}'>${ComparisonOperatorType[x]}</option>`).reduce((p, c) => p + c);
        return `<select id='${this.controlId}'><option></option>${options}</select>`;
    }
    public read(): ComparisonOperator {
        const x: string = (<HTMLInputElement>document.getElementById(this.controlId))?.value.toString();
        return new ComparisonOperator(x);
    }
}