import { Indicator, IndicatorType } from "../entities/BinaryCondition";
import { Presenter } from "./Presenter";

export class IndicatorPresenter extends Presenter<Indicator> {
    public render(): string {
        const options: string = Object.keys(IndicatorType).map(x => `<option value='${x}'>${IndicatorType[x]}</option>`).reduce((p, c) => p + c);
        return `<select id='${this.controlId}'><option></option>${options}</select>`;
    }
    public read(): Indicator {
        const x: string = (<HTMLInputElement>document.getElementById(this.controlId))?.value.toString();
        return new Indicator(x);
    }
}