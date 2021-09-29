import Portofolio from './Portofolio';
import StockHistoryItem from './StockHistoryItem';

export default interface ITradeConditionTemplate {
    (tradeData: StockHistoryItem, portofolio: Portofolio, thresholdValue: number): boolean;
}