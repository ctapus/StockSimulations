
export abstract class Presenter<T> {
    protected controlId: string;
    public constructor(controlId: string) {
        this.controlId = controlId;
    }
    abstract render(): string;
    abstract read(): T;
}