import Portofolio from './Portofolio';
import TradeData from './TradeData';

export default interface ITradeConditionTemplate {
    (tradeData: TradeData, portofolio: Portofolio, thresholdValue: number): boolean;
}