import MonteCarloSimulationGroup from "./MonteCarloSimulationGroup";
import Strategy from "./Strategy";

export default class MonteCarloSimulation {
    public monteCarloSimulationGroups: Array<MonteCarloSimulationGroup> = new Array<MonteCarloSimulationGroup>();
    public get bestPerformer(): [Strategy, number] {
        const strategies:[Strategy, number][] = new Array<[Strategy, number]>();
        for(const monteCarloSimulationGroup of this.monteCarloSimulationGroups) {
            let found = false;
            for(const strategy of strategies){
                if(strategy[0] === monteCarloSimulationGroup.bestPerformer.strategy) {
                    strategy[1]++;
                    found = true;
                }
            }
            if(!found) {
                strategies.push([monteCarloSimulationGroup.bestPerformer.strategy, 1]);
            }
        }
        return strategies.reduce((p, c) => p[1] < c[1]? c : p);
    }
}