import Portofolio from './Portofolio';
import StockHistoryItem from './StockHistoryItem';

export default interface ITradeCondition {
    (tradeData: StockHistoryItem, portofolio: Portofolio): boolean;
}