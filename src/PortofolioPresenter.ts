import StockHistoryItem from "./StockHistoryItem";
import * as d3 from "d3";
import Portofolio from "./Portofolio";
import TradeHistoryItem from "./TradeHistoryItem";
import "datatables.net"

export default class PortofolioPresenter {
    public static printResults(container: JQuery, portofolio: Portofolio): void {
        const table: JQuery = $(`
        <table class="table table-striped">
            <thead>
                <td>transaction no.</td>
                <td>date</td>
                <td>action</td>
                <td>number of shares</td>
                <td>share price</td>
                <td>available cash</td>
                <td>total number of shares</td>
                <td>total equity</td>
            </thead>
            <tbody></tbody>
        </table>`);
        let transactionNo: number = 1;
        portofolio.history.forEach((item: TradeHistoryItem) => {
            let styleColor: string = item.action.startsWith("BUY") ? "blue" : "red";
            table.children('tbody').append(`
                <tr style='color:${styleColor}'>
                    <td>${transactionNo}</td>
                    <td>${item.date.toISOString().split('T')[0]}</td>
                    <td>${item.action}</td>
                    <td>${item.numberOfShares}</td>
                    <td>${item.sharePrice}</td>
                    <td>${item.availableCash.toFixed(2)}</td>
                    <td>${item.totalNumberOfShares}</td>
                    <td>${(item.totalEquity).toFixed(2)}</td>
                </tr>`);
              transactionNo++;
        });
        container.append(table);
    }
    public static printSummary(container: JQuery, tradeData: Array<StockHistoryItem>, portofolio: Portofolio): void {
        const table: JQuery = $(`
        <table class="table table-striped">
            <thead>
                <td>number of transactions</td>
                <td>date</td>
                <td>number of shares</td>
                <td>share price</td>
                <td>available cash</td>
                <td>total equity</td>
            </thead>
            <tbody></tbody>
        </table>`);
        const lastTimeValue: StockHistoryItem = tradeData[tradeData.length - 1];
        table.children('tbody').append(`
            <tr>
                <td>${portofolio.history.length}</td>
                <td>${lastTimeValue.date.toISOString().split('T')[0]}</td>
                <td>${portofolio.numberOfShares}</td>
                <td>${lastTimeValue.close}</td>
                <td>${portofolio.amountOfMoney.toFixed(2)}</td>
                <td>${(portofolio.amountOfMoney + portofolio.numberOfShares * lastTimeValue.close).toFixed(2)}</td>
            </tr>`);
        container.append(table);
    }
    public static printSummary2(container: JQuery, tradeData: Array<StockHistoryItem>, portofolios: Array<Portofolio>): void {
        const table: JQuery = $(`
        <table class="table table-striped">
            <thead>
                <td>started on</td>
                <td>ended on</td>
                <td>number of transactions</td>
                <td>number of shares</td>
                <td>share price</td>
                <td>available cash</td>
                <td>total equity</td>
            </thead>
            <tbody></tbody>
        </table>`);
        const lastTimeValue: StockHistoryItem = tradeData[tradeData.length - 1];
        for(var i: number = 0; i < portofolios.length; i++) {
            const portofolio: Portofolio = portofolios[i];
            table.children('tbody').append(`
                <tr>
                    <td>${portofolio.startDate.toISOString().split('T')[0]}</td>
                    <td>${lastTimeValue.date.toISOString().split('T')[0]}</td>
                    <td>${portofolio.numberOfTrades}</td>
                    <td>${portofolio.numberOfShares}</td>
                    <td>${lastTimeValue.close}</td>
                    <td>${portofolio.amountOfMoney.toFixed(2)}</td>
                    <td>${(portofolio.amountOfMoney + portofolio.numberOfShares * lastTimeValue.close).toFixed(2)}</td>
                </tr>`);
        }
        table.DataTable({
            paging: false,
            ordering: true
        });
        container.append(table);
    }
}