import TradeData from './TradeData';
import Portofolio from './Portofolio';

export default interface ITradeActionTemplate {
    (tradeData: TradeData, portofolio: Portofolio, numberOfSharesorPercentage: number): void;
}