export default class PredefinedStrategies {
    private static strategyBuyAndHold: string = "BUY_PERCENTAGE 100;";
    private static strategy3PercentVariation: string = "BUY_PERCENTAGE 100 WHEN TODAY::OPEN <= 0.97 * YESTERDAY::OPEN; SELL_PERCENTAGE 100 WHEN TODAY::OPEN >= 1.03 * YESTERDAY::OPEN;";
    private static strategy2PercentVariation: string = "BUY_PERCENTAGE 100 WHEN TODAY::OPEN <= 0.98 * YESTERDAY::OPEN; SELL_PERCENTAGE 100 WHEN TODAY::OPEN >= 1.02 * YESTERDAY::OPEN;";
    private static strategy200SMA: string = "BUY_PERCENTAGE 100 WHEN TODAY::OPEN > TODAY::SMA_200_DAYS; SELL_PERCENTAGE 100 WHEN TODAY::OPEN < TODAY::SMA_200_DAYS;";
    private static strategy10cross20: string = "BUY_PERCENTAGE 100 WHEN YESTERDAY::OPEN < TODAY::OPEN && YESTERDAY::EMA_10_DAYS <= TODAY::EMA_20_DAYS && TODAY::EMA_10_DAYS >= YESTERDAY::EMA_20_DAYS; SELL_PERCENTAGE 100 WHEN YESTERDAY::OPEN > TODAY::OPEN && YESTERDAY::EMA_10_DAYS <= TODAY::EMA_20_DAYS && TODAY::EMA_10_DAYS >= YESTERDAY::EMA_20_DAYS;";
    public static SingleStragies: [string, string] [] = [
        [ this.strategy3PercentVariation, "Test 3%"],
        [ this.strategy2PercentVariation, "Test 2%"],
        [ this.strategy200SMA, "Test 200 SMA"],
        [ this.strategy10cross20, "Test 10/20 EMA Crossover"]];
    public static multipleStrategies: [string, string] [] = [
            [`{${this.strategyBuyAndHold} }, {${this.strategy2PercentVariation} }`, "Test B&H vs 2% stategies"],
            [`{${this.strategyBuyAndHold} }, {${this.strategy2PercentVariation} }, {${this.strategy3PercentVariation} }`, "Test B&H vs 2% vs 3% strategies"],
            [`{${this.strategyBuyAndHold} }, {${this.strategy200SMA} }`, "Test B&H vs 200 SMA stategies"]];
}