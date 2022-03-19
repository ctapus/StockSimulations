import { ArithmeticOperator, ArithmeticOperatorTypes } from "../entities/ArithmeticOperator";
import { Presenter } from "./Presenter";

export default class ArithmeticOperatorPresenter extends Presenter<ArithmeticOperator> {
    public render(): string {
        let options: string = ArithmeticOperatorTypes.AllArithmeticOperatorTypes.map(x => `<option value='${x.code}'>${x.classDescription}</option>`).reduce((p, c) => p + c);
        options = options.replace("<option value='MULTIPLICATION'>*</option>", "<option value='MULTIPLICATION' selected>*</option>"); // TODO: refactor preselection
        return `<select id='${this.controlId}'>${options}</select>`;
    }
    public read(): ArithmeticOperator {
        const x: string = (<HTMLInputElement>document.getElementById(this.controlId))?.value.toString();
        return new ArithmeticOperator(x);
    }
}