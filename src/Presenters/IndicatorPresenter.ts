import { Indicator, IndicatorTypes } from "../entities/Indicator";
import { Presenter } from "./Presenter";

export class IndicatorPresenter extends Presenter<Indicator> {
    public render(): string {
        const options: string = IndicatorTypes.AllIndicatorTypes.map(x => `<option value='${x.code}'>${x.classDescription}</option>`).reduce((p, c) => p + c);
        return `<select id='${this.controlId}'><option></option>${options}</select>`;
    }
    public renderHTML(): HTMLElement {
        const select: HTMLElement = document.createElement("select");
        select.setAttribute('data-glyph-type', 'Indicator');
        const option = document.createElement("option");
        option.value = "";
        option.text = "";
        select.appendChild(option);
        for(let indicatorType of IndicatorTypes.AllIndicatorTypes) {
            const option = document.createElement("option");
            option.value = indicatorType.code;
            option.text = indicatorType.classDescription;
            select.appendChild(option);
        }
        return select;
    }
    public read(): Indicator {
        const x: string = (<HTMLInputElement>document.getElementById(this.controlId))?.value.toString();
        if(!x) {
            return null;
        }
        return new Indicator(x);
    }
}