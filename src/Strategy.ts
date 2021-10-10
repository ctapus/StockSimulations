import Portofolio from './Portofolio';
import StockAndTradeHistoryItem from './StockAndTradeHistoryItem';
import StockHistoryItem from './StockHistoryItem';
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
    public run(tradeData: Array<StockAndTradeHistoryItem> | Array<StockHistoryItem>, portofolio: Portofolio): void {
        tradeData.forEach(item => {
            this.strategyBranches.forEach((strategyBranch: StrategyBranch) => {
                if(strategyBranch.tradeCondition.condition(item, portofolio)) {
                    strategyBranch.tradeAction.action(item, portofolio);
                    portofolio.lastHistoryItem.executionDescription = strategyBranch.toString();
                } else {
                    return false;
                }
            });
        });
    }
}
