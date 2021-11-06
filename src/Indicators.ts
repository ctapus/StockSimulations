import StockHistoryItem from "./StockHistoryItem";

export default class Indicators {
    private stockHistory: Array<StockHistoryItem>;
    constructor(stockHistory: Array<StockHistoryItem>){
        this.stockHistory = stockHistory;
    }
    public populate52WeeksRange(): void {
        let low52Weeks: number = Number.MAX_SAFE_INTEGER;
        let high52Weeks: number = Number.MIN_SAFE_INTEGER;
        $.each(this.stockHistory, (index, value) => {
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
        this.stockHistory.map((value, index) => value.sma50DaysOpen = this.getSMA(50, index));
    }
    public populate100DaysOpenSMA(): void {
        this.stockHistory.map((value, index) => value.sma100DaysOpen = this.getSMA(100, index));
    }
    public populate200DaysOpenSMA(): void {
        this.stockHistory.map((value, index) => value.sma200DaysOpen = this.getSMA(200, index));
    }
    private getSMA(numberOfDays: number, index: number): number {
        if (index >= numberOfDays) { // Ignore the first numberOfDays days
            let sum: number = 0;
            for(let i: number = index - numberOfDays; i<= index; i++) {
                sum += this.stockHistory[i].open;
            }
            return sum/numberOfDays;
        }
        return null;
    }
}