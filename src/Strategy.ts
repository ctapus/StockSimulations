import StrategyBranch from './StrategyBranch';

export default class Strategy {
    public strategyBranches: Array<StrategyBranch> = new Array<StrategyBranch>();
    public toString(): string {
        let ret: string = "";
        for(var strategyBranchKey in this.strategyBranches) {
            ret += `${this.strategyBranches[strategyBranchKey].toString()}<br/>`
        }
        return ret;
    }
}
