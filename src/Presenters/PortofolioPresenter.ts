import StockHistoryItem from "../entities/StockHistoryItem";
import * as d3 from "d3";
import Portofolio from "../entities/Portofolio";
import TradeHistoryItem from "../entities/TradeHistoryItem";
import "datatables.net"
import MonteCarloSimulation from "../entities/MonteCarloSimulation";
import MonteCarloSimulationGroup from "../entities/MonteCarloSimulationGroup";

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
        let transactionNo = 1;
        portofolio.history.forEach((item: TradeHistoryItem) => {
            const styleColor: string = item.action.startsWith("BUY") ? "blue" : "red";
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
    public static printSummary2(container: JQuery<HTMLElement>, tradeData: Array<StockHistoryItem>, monteCarloSimulation: MonteCarloSimulation): void {
        const table: JQuery<HTMLElement> = $(`
        <table style="width: 100%;">
            <thead>
                <td>strategy</td>
                <td>started on</td>
                <td>total equity</td>
                <td>number of transactions</td>
                <td>number of shares</td>
                <td>share price</td>
                <td>available cash</td>
            </thead>
        </table>`);
        let tbody: JQuery<HTMLElement>;
        let isAlternateRow = false;
        const lastTimeValue: StockHistoryItem = tradeData[tradeData.length - 1];
        for(const monteCarloSimulationGroup of monteCarloSimulation.monteCarloSimulationGroups) {
            tbody = $("<tbody>", {"style": isAlternateRow ? "background-color: lightsteelblue": "background-color: linen"});
            isAlternateRow = !isAlternateRow;
            table.append(tbody);
            for(const portofolio of monteCarloSimulationGroup.portofolios) {
                let style = "outline: thin solid;";
                if(portofolio === monteCarloSimulationGroup.bestPerformer) {
                    style += " font-weight: bold;";
                }
                tbody.append(`
                    <tr style="${style}">
                        <td>${portofolio.strategy?.toString()}</td>
                        <td>${portofolio.startDate.toISOString().split('T')[0]}</td>
                        <td style="text-align: right;">${(portofolio.currentValue).toFixed(2)}</td>
                        <td style="text-align: right;">${portofolio.numberOfTrades}</td>
                        <td style="text-align: right;">${portofolio.numberOfShares}</td>
                        <td style="text-align: right;">${lastTimeValue.close}</td>
                        <td style="text-align: right;">${portofolio.amountOfMoney.toFixed(2)}</td>
                    </tr>`);
            }
        }
        container.append(table);
    }
    public static drawEquityGraph(svgContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, portofolio: Portofolio, margin): void {
        const width: number = window.innerWidth - margin.left - margin.right;
        const height: number = window.innerHeight - margin.top - margin.bottom;
        const xScale = d3.scaleTime().domain(d3.extent<TradeHistoryItem, Date>(portofolio.history, d => { return d.date; })).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, d3.max<TradeHistoryItem, number>(portofolio.history, d => { return d.totalEquity; })]).range([height, 0]);
        const svg = svgContainer.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
        svg.append("g").attr("id", "xAxis").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));
        svg.append("g").attr("id", "yAxis").attr("transform", `translate(${width}, 0)`).call(d3.axisRight(yScale));
        const line = d3.line<TradeHistoryItem>().x(d => { return xScale(d.date); }).y(d => { return yScale(d.totalEquity); }).curve(d3.curveBasis);
        svg.append("path")
            .data<TradeHistoryItem[]>([portofolio.history])
            .style("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", "1.5")
            .attr("d", line);
    }
}