import { Presenter } from "./Presenter";

export class CoeficientPresenter extends Presenter<number> {
    public render(): string {
        return `<input type='number' id='${this.controlId}' value='1' step='0.01' size='4' />`;
    }
    public read(): number {
        return Number((<HTMLInputElement>document.getElementById(this.controlId))?.value.toString());
    }
}