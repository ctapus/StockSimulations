import { expect } from "chai";
import Action, { ActionTypes } from "../entities/Action";
import Indicators from "../entities/Indicators";
import Portofolio from "../entities/Portofolio";
import StockAndTradeHistoryItem from "../entities/StockAndTradeHistoryItem";
import StockHistoryItem from "../entities/StockHistoryItem";

describe("Action test suite", () => {
	it("Can BUY", () => {
		const action: Action = new Action(ActionTypes.BUY_EXACT, 5);
        const tradeDataPrevDay: StockAndTradeHistoryItem = new StockAndTradeHistoryItem();
        tradeDataPrevDay.date = new Date('2022-01-01');
        tradeDataPrevDay.open = 100;
        const tradeData: StockAndTradeHistoryItem = new StockAndTradeHistoryItem();
        tradeData.date = new Date('2022-01-02');
        tradeData.previousDay = tradeDataPrevDay;
        tradeData.open = 100;
        const tradeDataSet: Array<StockAndTradeHistoryItem> = [ tradeDataPrevDay, tradeData ];
        const indicator: Indicators = new Indicators(tradeDataSet, (stockHistoryItem: StockHistoryItem) => { return stockHistoryItem.open; });
        // TODO: investigate running all in the same loop to improve performance
        indicator.populateOpenVariation();
        const portofolio: Portofolio = new Portofolio(500, 0, new Date('2022-01-01'));
        action.trade(tradeData, portofolio);
		expect(portofolio.numberOfShares).to.equal(5);
		expect(portofolio.amountOfMoney).to.equal(0);
        expect(portofolio.history.length).to.eq(1);
	});
});