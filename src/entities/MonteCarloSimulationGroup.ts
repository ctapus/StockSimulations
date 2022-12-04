import Portofolio from "./Portofolio";

export default class MonteCarloSimulationGroup {
    public portofolios: Array<Portofolio> = new Array<Portofolio>();
    public get bestPerformer(): Portofolio {
        return this.portofolios.reduce((p, c) => p.currentValue < c.currentValue? c : p);
    }
}