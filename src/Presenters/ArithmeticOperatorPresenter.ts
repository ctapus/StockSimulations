import { ArithmeticOperator, ArithmeticOperatorType } from "../entities/BinaryCondition";
import { Presenter } from "./Presenter";

export default class ArithmeticOperatorPresenter extends Presenter<ArithmeticOperator> {
    public render(): string {
        let options: string = Object.keys(ArithmeticOperatorType).map(x => `<option value='${x}'>${ArithmeticOperatorType[x]}</option>`).reduce((p, c) => p + c);
        options = options.replace("<option value='MULTIPLICATION'>*</option>", "<option value='MULTIPLICATION' selected>*</option>"); // TODO: refactor preselection
        return `<select id='${this.controlId}'>${options}</select>`;
    }
    public read(): ArithmeticOperator {
        const x: string = (<HTMLInputElement>document.getElementById(this.controlId))?.value.toString();
        return new ArithmeticOperator(x);
    }
}