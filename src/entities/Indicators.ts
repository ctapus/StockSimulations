import StockHistoryItem from "./StockHistoryItem";

export type PropertySelector<T> = (stockHistoryItem: StockHistoryItem) => T;

export default class Indicators {
    private stockHistory: Array<StockHistoryItem>;
    private propertySelector: PropertySelector<number>;
    constructor(stockHistory: Array<StockHistoryItem>, propertySelector: PropertySelector<number>){
        this.stockHistory = stockHistory;
        this.propertySelector = propertySelector;
    }
    public populateOpenVariation(): void {
        this.stockHistory.forEach((element, index, array) => {
            if(null != this.stockHistory[index].previousDay) {
                this.stockHistory[index].openVariation = this.propertySelector(this.stockHistory[index]) / this.propertySelector(this.stockHistory[index].previousDay) * 100;
            }
        });
    }
    public populateDayVariation(): void {
        this.stockHistory.forEach((element, index, array) => {
            this.stockHistory[index].oneDayVariation = (this.stockHistory[index].high - this.stockHistory[index].low) / this.stockHistory[index].low * 100;
            if(null != this.stockHistory[index].previousDay) {
                var high2days: number = Math.max(this.stockHistory[index].high, this.stockHistory[index].previousDay.high);
                var low2Days: number = Math.min(this.stockHistory[index].low, this.stockHistory[index].previousDay.low);
                this.stockHistory[index].twoDaysVariation = (high2days - low2Days) / low2Days * 100;
                if(null != this.stockHistory[index].previousDay.previousDay) {
                    var high3Days: number = Math.max(high2days, this.stockHistory[index].previousDay.previousDay.high);
                    var low3Days: number = Math.min(low2Days, this.stockHistory[index].previousDay.previousDay.low);
                    this.stockHistory[index].threeDaysVariation = (high3Days - low3Days) / low3Days * 100;
                }
            }
        });
    }
    public populate52WeeksRange(): void {
        let low52Weeks: number = Number.MAX_SAFE_INTEGER;
        let high52Weeks: number = Number.MIN_SAFE_INTEGER;
        this.stockHistory.forEach((element, index, array) => {
            if (index >= 52 * 5) { // Ignore the first 52*5 days
                for(let i: number = index - 52 * 5; i<= index; i++) {
                    if(this.stockHistory[i].high >= high52Weeks) {
                        high52Weeks = this.stockHistory[index].high;
                    }
                    if(this.stockHistory[i].low <= low52Weeks) {
                        low52Weeks = this.stockHistory[index].low;
                    }
                }
                this.stockHistory[index].high52Weeks = high52Weeks;
                this.stockHistory[index].low52Weeks = low52Weeks;
            }
        });
    }
    public populate50DaysOpenSMA(): void {
        this.stockHistory.map((value, index) => value.sma50Days = this.getSimpleMovingAverage(50, index));
    }
    public populate100DaysOpenSMA(): void {
        this.stockHistory.map((value, index) => value.sma100Days = this.getSimpleMovingAverage(100, index));
    }
    public populate200DaysOpenSMA(): void {
        this.stockHistory.map((value, index) => value.sma200Days = this.getSimpleMovingAverage(200, index));
    }
    private getSimpleMovingAverage(numberOfDays: number, index: number): number {
        if (index >= numberOfDays) { // Ignore the first numberOfDays days
            let sum: number = 0;
            for(let i: number = index-numberOfDays; i<=index; i++) {
                sum += this.propertySelector(this.stockHistory[i]);
            }
            return sum/numberOfDays;
        }
        return null;
    }
    public populate50DaysOpenEMA(): void {
        this.stockHistory.map((value, index) => value.ema50Days = this.getExponentialMovingAverage(50, index, index < 50 ? 0 : this.stockHistory[index - 1].ema50Days));
    }
    public populate100DaysOpenEMA(): void {
        this.stockHistory.map((value, index) => value.ema100Days = this.getExponentialMovingAverage(100, index, index < 100 ? 0 : this.stockHistory[index - 1].ema100Days));
    }
    public populate200DaysOpenEMA(): void {
        this.stockHistory.map((value, index) => value.ema200Days = this.getExponentialMovingAverage(200, index, index < 200 ? 0 : this.stockHistory[index - 1].ema200Days));
    }
    private getExponentialMovingAverage(numberOfDays: number, index: number, previousEMA: number): number {
        const smoothing: number = 2;
        const k: number = smoothing/(numberOfDays + 1);
        if(index === numberOfDays) {
            return this.getSimpleMovingAverage(numberOfDays, index);
        }
        if (index > numberOfDays) { // Ignore the first numberOfDays days
            return this.propertySelector(this.stockHistory[index]) * k + previousEMA*(1-k);
        }
        return null;
    }
    public populate14DaysOpenAverages(): void {
        const numberOfDays: number = 14;
        let gains: number = 0;
        let losses: number = 0;
        for(let j: number = 1; j<numberOfDays; j++) {
            if(this.propertySelector(this.stockHistory[j-1]) < this.propertySelector(this.stockHistory[j])) {
                gains += this.propertySelector(this.stockHistory[j]) - this.propertySelector(this.stockHistory[j-1]);
            }
            if(this.propertySelector(this.stockHistory[j-1]) > this.propertySelector(this.stockHistory[j])) {
                losses += this.propertySelector(this.stockHistory[j-1]) - this.propertySelector(this.stockHistory[j]);
            }
        }
        this.stockHistory[numberOfDays].averageGains14Days = gains/numberOfDays;
        this.stockHistory[numberOfDays].averageLosses14Days = losses/numberOfDays;
        for(let i: number = numberOfDays + 1; i<this.stockHistory.length; i++) {
            let gain: number = 0;
            let loss: number = 0;
            if(this.propertySelector(this.stockHistory[i-1]) < this.propertySelector(this.stockHistory[i])) {
                gain += this.propertySelector(this.stockHistory[i]) - this.propertySelector(this.stockHistory[i-1]);
            }
            if(this.propertySelector(this.stockHistory[i-1]) > this.propertySelector(this.stockHistory[i])) {
                loss += this.propertySelector(this.stockHistory[i-1]) - this.propertySelector(this.stockHistory[i]);
            }
            this.stockHistory[i].averageGains14Days = (this.stockHistory[i-1].averageGains14Days*(numberOfDays-1) + gain)/numberOfDays;
            this.stockHistory[i].averageLosses14Days = (this.stockHistory[i-1].averageLosses14Days*(numberOfDays-1) + loss)/numberOfDays;
        }
    }
    public populate14DaysOpenRSI(): void { // TODO refactor the dependency of this function on the populate14DaysAverages being called first
        this.stockHistory.map((value, index) => value.rsi14Days = this.getRelativeStrengthIndex(14, index));
    }
    private getRelativeStrengthIndex(numberOfDays: number, index: number): number {
        if (index >= numberOfDays) { // Ignore the first numberOfDays days
            let rs: number = this.stockHistory[index].averageGains14Days/this.stockHistory[index].averageLosses14Days;
            return 100 - 100/(1+rs);
        }
        return null;
    }
    public populateDerivativeFirst(): void {
        this.stockHistory[0].derivativeFirst = 0;
        for(var i=1; i<this.stockHistory.length; i++) {
            this.stockHistory[i].derivativeFirst = this.propertySelector(this.stockHistory[i].previousDay) - this.propertySelector(this.stockHistory[i]);
        }
    }
    public populateDerivativeSecond(): void {
        this.stockHistory[0].derivativeSecond = 0;
        this.stockHistory[1].derivativeSecond = 0;
        for(var i=2; i<this.stockHistory.length; i++) {
            this.stockHistory[i].derivativeSecond = this.stockHistory[i].previousDay.derivativeFirst - this.stockHistory[i].derivativeFirst;
        }
    }
    public populateDerivativeThird(): void {
        this.stockHistory[0].derivativeThird = 0;
        this.stockHistory[1].derivativeThird = 0;
        this.stockHistory[2].derivativeThird = 0;
        for(var i=3; i<this.stockHistory.length; i++) {
            this.stockHistory[i].derivativeThird = this.stockHistory[i].previousDay.derivativeSecond - this.stockHistory[i].derivativeSecond;
        }
    }
}