import { expect } from "chai";
import Action, { ActionTypes } from "../entities/Action";
import Indicators from "../entities/Indicators";
import Portofolio from "../entities/Portofolio";
import StockAndTradeHistoryItem from "../entities/StockAndTradeHistoryItem";
import StockHistoryItem from "../entities/StockHistoryItem";
import TestDataSet from "./testDataset";

describe("Action test suite", () => {
	it("Can BUY", () => {
		const action: Action = new Action(ActionTypes.BUY_EXACT, 5);
        const tradeDataSet: Array<StockAndTradeHistoryItem> = TestDataSet.get2DaysDataset2PercentVariation();
        const indicator: Indicators = new Indicators(tradeDataSet, (stockHistoryItem: StockHistoryItem) => { return stockHistoryItem.open; });
        // TODO: investigate running all in the same loop to improve performance
        indicator.populateOpenVariation();
        const portofolio: Portofolio = new Portofolio(510, 0, new Date('2022-01-01'), [tradeDataSet[1]]);
        action.trade(tradeDataSet[1], portofolio);
		expect(portofolio.numberOfShares).to.equal(5);
		expect(portofolio.amountOfMoney).to.equal(0);
        expect(portofolio.history.length).to.eq(1);
	});
});