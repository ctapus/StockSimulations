import StockHistoryItem from "./entities/StockHistoryItem";

class StockData {
    public ticker: string;
    public stockHistoryItems: StockHistoryItem[];
    constructor(ticker: string, stockHistoryItems: StockHistoryItem[]) {
        this.ticker = ticker;
        this.stockHistoryItems = stockHistoryItems;
    }
}

let tickers: string[] = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NVDA", "PYPL"];
let stockDataList: StockData[] = [];
function calculateCorrelationForOpen(stockData1: StockData, stockData2: StockData, startDate: Date, endDate: Date): number {
    let i1: number = 0;
    let i2: number = 0;
    let sum1: number = 0;
    let sum2: number = 0;
    let sum1Squared: number = 0;
    let sum2Squared: number = 0;
    let sumBoth: number = 0;
    let n: number = 0;
    while(i1 < stockData1.stockHistoryItems.length && i2 < stockData2.stockHistoryItems.length) {
        if(stockData1.stockHistoryItems[i1].date.getTime() < startDate.getTime() || stockData1.stockHistoryItems[i1].date.getTime() > endDate.getTime()) {
            i1++;
            continue;
        }
        if(stockData2.stockHistoryItems[i2].date.getTime() < startDate.getTime() || stockData2.stockHistoryItems[i2].date.getTime() > endDate.getTime()) {
            i2++;
            continue;
        }
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
    const initialEndDateValue: Date = new Date();
    const initialStartDateValue: Date = new Date();
    initialStartDateValue.setFullYear(initialStartDateValue.getFullYear() - 1);
    (<HTMLInputElement>document.getElementById("startDate")).value = initialStartDateValue.toISOString().split('T')[0];
    (<HTMLInputElement>document.getElementById("endDate")).value = initialEndDateValue.toISOString().split('T')[0];
    tickers.forEach(ticker => {
        fetch(`.\\tiingo\\${ticker}.json`)
            .then(res => res.json())
            .then(data => {
                stockDataList.push(new StockData(ticker, StockHistoryItem.loadFromTiingo(data).map(x => x as StockHistoryItem)));
            })
            .catch(error => {
                console.log(error.message);
            });
    });
    document.getElementById("run").addEventListener("click", () => {
        const startDate: Date = new Date((<HTMLInputElement>document.getElementById("startDate")).value);
        const endDate: Date = new Date((<HTMLInputElement>document.getElementById("endDate")).value);
        const table: HTMLTableElement = document.createElement("table");
        table.createTHead();
        const theadRow: HTMLTableRowElement = table.tHead.insertRow();
        const theadCell0: HTMLTableCellElement = theadRow.insertCell();
        theadCell0.style = "background: #eee; border: 2px solid #555; border-padding: 0.5rem; text-align: center;";
        table.createTBody();
        for(let i = 0; i < tickers.length; i++) {
            const theadCell: HTMLTableCellElement = theadRow.insertCell();
            theadCell.innerHTML = stockDataList[i].ticker;
            theadCell.style = "background: #eee; border: 2px solid #555; border-padding: 0.5rem; text-align: center;";
            const tbodyRow: HTMLTableRowElement = table.tBodies[0].insertRow();
            const tbodyCell0: HTMLTableCellElement = tbodyRow.insertCell();
            tbodyCell0.style = "background: #aaf; border: 2px solid #555; border-padding: 0.5rem; text-align: center;";
            tbodyCell0.innerHTML = stockDataList[i].ticker;
            for(let j = 0; j < tickers.length; j++) {
                const tbodyCell: HTMLTableCellElement = tbodyRow.insertCell();
                tbodyCell.style = "background: #aaf; border: 2px solid #555; border-padding: 0.5rem; text-align: center;";
                tbodyCell.innerHTML = calculateCorrelationForOpen(stockDataList[i], stockDataList[j], startDate, endDate).toFixed(2) + " " + stockDataList[i].ticker + ", " + stockDataList[j].ticker;
            }
        }
        document.getElementById("divMatrix").replaceChildren();
        document.getElementById("divMatrix").append(table);
    });
});