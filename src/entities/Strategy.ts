import Portofolio from './Portofolio';
import StockAndTradeHistoryItem from './StockAndTradeHistoryItem';
import StockHistoryItem from './StockHistoryItem';
import StrategyBranch from './StrategyBranch';

export default class Strategy {
    public strategyBranches: Array<StrategyBranch> = new Array<StrategyBranch>();
    public toString(): string {
        let ret = "";
        for(const strategyBranchKey in this.strategyBranches) {
            ret += `${this.strategyBranches[strategyBranchKey]?.toString()}<br/>`;
        }
        return ret;
    }
    public simplify(): void {
        for(const strategyBranchKey in this.strategyBranches) {
            this.strategyBranches[strategyBranchKey].simplify();
        }
    }
    public toCode(): string {
        let ret = "";
        for(const strategyBranchKey in this.strategyBranches) {
            ret += `${this.strategyBranches[strategyBranchKey].toCode()}; `;
        }
        return ret;
    }
    public run(tradeData: Array<StockAndTradeHistoryItem> | Array<StockHistoryItem>, portofolio: Portofolio): void {
        portofolio.strategy = this;
        tradeData.forEach(item => {
            this.strategyBranches.forEach((strategyBranch: StrategyBranch) => {
                // ASSUMPTION: no condition present means the action executes always!
                if(!strategyBranch.compositeCondition || strategyBranch.compositeCondition.evaluate(item, portofolio)) {
                    strategyBranch.action.trade(item, portofolio);
                    if(portofolio.lastHistoryItem) {
                        portofolio.lastHistoryItem.executionDescription = strategyBranch.toString();
                    }
                } else {
                    return false;
                }
            });
        });
    }
}
