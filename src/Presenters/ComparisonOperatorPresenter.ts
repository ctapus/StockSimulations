import { ComparisonOperator, ComparisonOperatorTypes } from "../entities/ComparisonOperator";
import { Presenter } from "./Presenter";

export default class ComparisonOperatorPresenter extends Presenter<ComparisonOperator> {
    public render(): string {
        const options: string = ComparisonOperatorTypes.AllComparisonOperatorTypes.map(x => `<option value='${x.code}'>${x.classDescription}</option>`).reduce((p, c) => p + c);
        return `<select id='${this.controlId}'><option></option>${options}</select>`;
    }
    public read(): ComparisonOperator {
        const x: string = (<HTMLInputElement>document.getElementById(this.controlId))?.value.toString();
        return new ComparisonOperator(x);
    }
}