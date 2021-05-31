import Portofolio from './Portofolio';
import TradeData from './TradeData';

export default interface ITradeCondition {
    (tradeData: TradeData, portofolio: Portofolio): boolean;
}