import TradeData from './TradeData';

export default interface ITradeConditionTemplate {
    (tradeData: TradeData, thresholdValue: number): boolean;
}