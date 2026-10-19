import { Statistics } from "./entities/Statistics";
import StockHistoryItem from "./entities/StockHistoryItem";

class StockData {
    public ticker: string;
    public stockHistoryItems: StockHistoryItem[];
    constructor(ticker: string, stockHistoryItems: StockHistoryItem[]) {
        this.ticker = ticker;
        this.stockHistoryItems = stockHistoryItems;
    }
}

let stockDataList: StockData[] = [];
function calculateCorrelationForOpen(stockData1: StockData, stockData2: StockData, startDate: Date, endDate: Date): number {
    let v1: number[] = [];
    let v2: number[] = [];
    let i1: number = 0;
    let i2: number = 0;
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
            v1.push(stockData1.stockHistoryItems[i1].open);
            v2.push(stockData2.stockHistoryItems[i2].open);
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
    return Statistics.calculateCorrelation(v1, v2);
}
function printCorrelationMatrix(tickers: string[]) {
    const startDate: Date = new Date((<HTMLInputElement>document.getElementById("startDate")).value);
    const endDate: Date = new Date((<HTMLInputElement>document.getElementById("endDate")).value);
    const table: HTMLTableElement = document.createElement("table");
    table.createTHead();
    const theadRow: HTMLTableRowElement = table.tHead.insertRow();
    const theadCell0: HTMLTableCellElement = theadRow.insertCell();
    theadCell0.style = "background: #eee; border: 2px solid #555; padding: 1rem; text-align: center;";
    table.createTBody();
    for(let i = 0; i < tickers.length; i++) {
        const theadCell: HTMLTableCellElement = theadRow.insertCell();
        theadCell.innerHTML = stockDataList[i].ticker;
        theadCell.style = "background: #eee; border: 2px solid #555; padding: 1rem; text-align: center;";
        const tbodyRow: HTMLTableRowElement = table.tBodies[0].insertRow();
        const tbodyCell0: HTMLTableCellElement = tbodyRow.insertCell();
        tbodyCell0.style = "background: #aaa; border: 2px solid #555; padding: 1rem; text-align: center;";
        tbodyCell0.innerHTML = stockDataList[i].ticker;
        for(let j = 0; j < tickers.length; j++) {
            const tbodyCell: HTMLTableCellElement = tbodyRow.insertCell();
            tbodyCell.style = "background: #fff; border: 2px solid #555; padding: 1rem; text-align: center;";
            const r: number = calculateCorrelationForOpen(stockDataList[i], stockDataList[j], startDate, endDate);
            tbodyCell.innerHTML = r.toFixed(2);
            if(r <0 ) {
                tbodyCell.style.background = `rgba(255, ${Math.abs(255 + 255 * r)}, 0, 1)`;
            }
            if(r > 0) {
                tbodyCell.style.background = `rgba(${Math.abs(255 - 255 * r)}, 255, 0, 1)`;
            }
        }
    }
    document.getElementById("divMatrix").replaceChildren();
    document.getElementById("divMatrix").append(table);
}
async function fetchDataForSelectedTickers(tickers: string[]) {
    const fetchPromisses = tickers.map(async (ticker) => {
        try {
            const res = fetch(`.\\tiingo\\${ticker}.json`);
            const data = await (await res).json();
            stockDataList.push(new StockData(ticker, StockHistoryItem.loadFromTiingo(data).map(x => x as StockHistoryItem)));
        } catch(error) {
            console.log(`Parsing ${ticker}`);
            console.log(error);
        }
    });
    try {
        await Promise.all(fetchPromisses);
    } catch(error) {
        console.log(error);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const initialEndDateValue: Date = new Date();
    const initialStartDateValue: Date = new Date();
    initialStartDateValue.setFullYear(initialStartDateValue.getFullYear() - 1);
    (<HTMLInputElement>document.getElementById("startDate")).value = initialStartDateValue.toISOString().split('T')[0];
    (<HTMLInputElement>document.getElementById("endDate")).value = initialEndDateValue.toISOString().split('T')[0];
    fetch(`.\\tickersList.json`)
        .then(res => res.json())
        .then(data => {
            const tickersList: HTMLSelectElement = (<HTMLSelectElement>document.getElementById('tickers'));
            Array.prototype.forEach.call(data['tickers'], (currentValue, index, arr) => {
                const option: HTMLOptionElement = document.createElement("option");
                option.value = currentValue.symbol;
                option.text = currentValue.name;
                tickersList.append(option);
            });
            Array.from(tickersList.options).forEach((option) => {
                option.selected = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NVDA", "PYPL"].includes(option.value);
            });
        });
    document.getElementById("run").addEventListener("click", async() => {
        const tickers: string[] = Array.from((<HTMLSelectElement>document.getElementById("tickers")).selectedOptions).map(x => x.value);
        await fetchDataForSelectedTickers(tickers);
        printCorrelationMatrix(tickers);
    });
});