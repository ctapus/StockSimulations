import { Presenter } from "./Presenter";

export class CoeficientPresenter extends Presenter<number> {
    public render(): string {
        return `<input type='number' id='${this.controlId}' value='' step='0.01' size='4' />`;
    }
    public read(): number | null {
        const x: string = (<HTMLInputElement>document.getElementById(this.controlId))?.value.toString();
        if(!x) {
            return null;
        }
        return Number(x);
    }
}