import { ComparisonOperator, ComparisonOperatorTypes } from "../entities/ComparisonOperator";
import { Presenter } from "./Presenter";

export default class ComparisonOperatorPresenter extends Presenter<ComparisonOperator> {
    public render(): string {
        const options: string = ComparisonOperatorTypes.AllComparisonOperatorTypes.map(x => `<option value='${x.code}'>${x.classDescription}</option>`).reduce((p, c) => p + c);
        return `<select id='${this.controlId}'><option></option>${options}</select>`;
    }
    public renderHTML(): HTMLElement {
        const select: HTMLElement = document.createElement("select");
        select.setAttribute('data-glyph-type', 'ComparisonOperator');
        const option = document.createElement("option");
        option.value = "";
        option.text = "";
        select.appendChild(option);
        for(const indicatorType of ComparisonOperatorTypes.AllComparisonOperatorTypes) {
            const option = document.createElement("option");
            option.value = indicatorType.code;
            option.text = indicatorType.classDescription;
            select.appendChild(option);
        }
        return select;
    }
    public read(): ComparisonOperator {
        const x: string = (<HTMLInputElement>document.getElementById(this.controlId))?.value.toString();
        if(!x) {
            return null;
        }
        return new ComparisonOperator(x);
    }
}