import StockHistoryItem from "./entities/StockHistoryItem";

class StockData {
    public symbol: string;
    public stockHistoryItems: StockHistoryItem[];
    constructor(symbol: string, stockHistoryItems: StockHistoryItem[]) {
        this.symbol = symbol;
        this.stockHistoryItems = stockHistoryItems;
    }
}

let tickers: string[] = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NVDA", "PYPL"];
let stockDataList: StockData[] = [];
function calculateCorrelationForOpen(stockData1: StockData, stockData2: StockData): number {
    let i1: number = 0;
    let i2: number = 0;
    let sum1: number = 0;
    let sum2: number = 0;
    let sum1Squared: number = 0;
    let sum2Squared: number = 0;
    let sumBoth: number = 0;
    let n: number = 0;
    while(i1 < stockData1.stockHistoryItems.length && i2 < stockData2.stockHistoryItems.length) {
        if(stockData1.stockHistoryItems[i1].date.getTime() === stockData2.stockHistoryItems[i2].date.getTime()) {
            sum1 += stockData1.stockHistoryItems[i1].open;
            sum2 += stockData2.stockHistoryItems[i2].open;
            sum1Squared += stockData1.stockHistoryItems[i1].open * stockData1.stockHistoryItems[i1].open;
            sum2Squared += stockData2.stockHistoryItems[i2].open * stockData2.stockHistoryItems[i2].open;
            sumBoth += stockData1.stockHistoryItems[i1].open * stockData2.stockHistoryItems[i2].open;
            n++;
            i1++;
            i2++;
        }
        else {
            if(stockData1.stockHistoryItems[i1].date.getTime() > stockData2.stockHistoryItems[i2].date.getTime()) {
                i2++;
            } else {
                i1++;
            }
        }
    }
    const r: number = n * (sumBoth - sum1 * sum2) / Math.sqrt((n * sum1Squared - sum1 * sum1) * (n * sum2Squared - sum2 * sum2));
    return r;
}
document.addEventListener("DOMContentLoaded", () => {
    fetch(`.\\tickersList.json`)
        .then(res => res.json())
        .then(data => {
            const tickerList: HTMLSelectElement = (<HTMLSelectElement>document.getElementById('ticker'));
            Array.prototype.forEach.call(data['tickers'], (currentValue, index, arr) => {
                const option: HTMLOptionElement = document.createElement("option");
                option.value = currentValue.symbol;
                option.text = currentValue.name;
                tickerList.append(option);
            });
            tickerList.addEventListener("change", () => {
                const ticker: string = (<HTMLInputElement>document.getElementById("ticker")).value;
                document.getElementById("startDate").setAttribute("disabled", "disabled");
                document.getElementById("startingAmount").setAttribute("disabled", "disabled");
                fetch(`.\\alphavantage\\${ticker}.json`)
                    .then(res => res.json())
                    .then(data => {
                    })
                    .catch(error => {
                        console.log(error.message);
                    });
            });
        })
        .catch(error => {
            console.log(error.message);
        });
    tickers.forEach(ticker => {
        fetch(`.\\alphavantage\\${ticker}.json`)
            .then(res => res.json())
            .then(data => {
                stockDataList.push(new StockData(ticker, StockHistoryItem.loadFromAlphavantage(data).map(x => x as StockHistoryItem)));
            })
            .catch(error => {
                console.log(error.message);
            });
    });
    document.getElementById("run").addEventListener("click", () => {
        let r: number = calculateCorrelationForOpen(stockDataList[0], stockDataList[1]);
        console.log(`Correlation between ${stockDataList[0].symbol} and ${stockDataList[1].symbol} is ${r}`);
    });
});