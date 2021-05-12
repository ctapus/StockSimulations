import TradeData from './TradeData';

export default interface ITradeCondition {
    (tradeData: TradeData): boolean;
}