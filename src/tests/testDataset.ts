import StockAndTradeHistoryItem from "../entities/StockAndTradeHistoryItem";

export default class TestDataSet {
    public static get2DaysDataset2PercentVariation(): Array<StockAndTradeHistoryItem> {
        const tradeDataPrevDay: StockAndTradeHistoryItem = new StockAndTradeHistoryItem();
        tradeDataPrevDay.date = new Date('2022-01-01');
        tradeDataPrevDay.open = 100;
        const tradeData: StockAndTradeHistoryItem = new StockAndTradeHistoryItem();
        tradeData.date = new Date('2022-01-02');
        tradeData.previousDay = tradeDataPrevDay;
        tradeData.open = 102;
        return [ tradeDataPrevDay, tradeData ];
    }
    public static get3DaysDataset2PercentVariation(): Array<StockAndTradeHistoryItem> {
        const day1: StockAndTradeHistoryItem = new StockAndTradeHistoryItem();
        day1.date = new Date('2022-01-01');
        day1.open = 98;
        const day2: StockAndTradeHistoryItem = new StockAndTradeHistoryItem();
        day2.date = new Date('2022-01-02');
        day2.previousDay = day1;
        day2.open = 100;
        const day3: StockAndTradeHistoryItem = new StockAndTradeHistoryItem();
        day3.date = new Date('2022-01-03');
        day3.previousDay = day2;
        day3.open = 103;
        return [ day1, day2, day3 ];
    }
}