import { Scope, ScopeTypes } from "../entities/Scope";
import { Presenter } from "./Presenter";

export class ScopePresenter extends Presenter<Scope> {
    public render(): string {
        const options: string = ScopeTypes.AllScopeTypes.map(x => `<option value='${x.code}'>${x.classDescription}</option>`).reduce((p, c) => p + c);
        return `<select id='${this.controlId}'><option></option>${options}</select>`;
    }
    public renderHTML(): HTMLElement {
        const select: HTMLElement = document.createElement("select");
        select.setAttribute('data-glyph-type', 'Scope');
        const option = document.createElement("option");
        option.value = "";
        option.text = "";
        select.appendChild(option);
        for(const scopeType of ScopeTypes.AllScopeTypes) {
            const option = document.createElement("option");
            option.value = scopeType.code;
            option.text = scopeType.classDescription;
            select.appendChild(option);
        }
        return select;
    }
    public read(): Scope {
        const x: string = (<HTMLInputElement>document.getElementById(this.controlId))?.value.toString();
        if(!x) {
            return null;
        }
        return new Scope(x);
    }
}