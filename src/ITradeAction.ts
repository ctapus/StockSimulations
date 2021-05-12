import TradeData from './TradeData';
import Portofolio from './Portofolio';

export default interface ITradeAction {
    (tradeData: TradeData, portofolio: Portofolio): void;
}