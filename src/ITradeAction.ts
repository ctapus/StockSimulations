import StockHistoryItem from './StockHistoryItem';
import Portofolio from './Portofolio';

export default interface ITradeAction {
    (tradeData: StockHistoryItem, portofolio: Portofolio): void;
}