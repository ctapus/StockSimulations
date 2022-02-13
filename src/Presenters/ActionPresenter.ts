import Action, { ActionType, ActionTypes } from "../entities/Action";
import { Presenter } from "./Presenter";

export default class ActionPresenter extends Presenter<Action> {
    public render(): string {
        const options: string = ActionTypes.All.map(x => `<option value='${x.value}'>${x.classDescription}</option>`).reduce((p, c) => p + c);
        return `<select id='${this.controlId}_ActionType'><option></option>${options}</select><span id='${this.controlId}_Span'></span><input type='number' id='${this.controlId}_Param' step='1' size='4' />`;
    }
    public addJavascript(): void {
        const actionType: HTMLSelectElement = <HTMLSelectElement>document.getElementById(`${this.controlId}_ActionType`);
        actionType.addEventListener('change', () => this.javascript());
    }
    public javascript() {
        const at: string = (<HTMLInputElement>document.getElementById(`${this.controlId}_ActionType`))?.value.toString();
        const i: HTMLInputElement = <HTMLInputElement>document.getElementById(`${this.controlId}_Param`);
        const s: HTMLSpanElement = <HTMLSpanElement>document.getElementById(`${this.controlId}_Span`);
        switch(at) {
            case "BUY": s.textContent='Number of shares'; i.removeAttribute('min'); i.removeAttribute('max'); break;
            case "BUY_PERCENTAGE": s.textContent = 'Percentage of cash'; i.min='0'; i.max='100'; break;
            case "SELL": s.textContent = 'Number of shares'; i.removeAttribute('min'); i.removeAttribute('max'); break;
            case "SELL_PERCENTAGE": s.textContent = 'Percentage of owned shares'; i.min='0'; i.max='100'; break;
        } // TODO: replace magic strings with enum.
    }
    public read(): Action {
        const actionTypeKey: string = (<HTMLInputElement>document.getElementById(`${this.controlId}_ActionType`))?.value.toString();
        const actionType: ActionType = ActionTypes.item(actionTypeKey);
        const param: number = Number((<HTMLInputElement>document.getElementById(`${this.controlId}_Param`))?.value.toString());
        return new Action(actionType, param);
    }
}