import StockHistoryItem from './StockHistoryItem';
import Portofolio from './Portofolio';

export default interface ITradeActionTemplate {
    (tradeData: StockHistoryItem, portofolio: Portofolio, numberOfSharesorPercentage: number): void;
}