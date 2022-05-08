import { ArithmeticOperator, ArithmeticOperatorTypes } from "../entities/ArithmeticOperator";
import { Presenter } from "./Presenter";

export default class ArithmeticOperatorPresenter extends Presenter<ArithmeticOperator> {
    public render(): string {
        let options: string = ArithmeticOperatorTypes.AllArithmeticOperatorTypes.map(x => `<option value='${x.code}'>${x.classDescription}</option>`).reduce((p, c) => p + c);
        return `<select id='${this.controlId}'><option></option>${options}</select>`;
    }
    public renderHTML(): HTMLElement {
        const select: HTMLElement = document.createElement("select");
        const option = document.createElement("option");
        option.value = "";
        option.text = "";
        select.appendChild(option);
        for(let indicatorType of ArithmeticOperatorTypes.AllArithmeticOperatorTypes) {
            const option = document.createElement("option");
            option.value = indicatorType.code;
            option.text = indicatorType.classDescription;
            select.appendChild(option);
        }
        return select;
    }
    public read(): ArithmeticOperator | null {
        const x: string = (<HTMLInputElement>document.getElementById(this.controlId))?.value.toString();
        if(!x) {
            return null;
        }
        return new ArithmeticOperator(x);
    }
}