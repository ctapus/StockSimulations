import StockHistoryItem from "../entities/StockHistoryItem";
import * as d3 from "d3";
import Portofolio from "../entities/Portofolio";
import TradeHistoryItem from "../entities/TradeHistoryItem";
import "datatables.net"
import MonteCarloSimulation from "../entities/MonteCarloSimulation";

export default class PortofolioPresenter {
    public static printResults(container: HTMLDivElement, portofolio: Portofolio): void {
        const table: HTMLTableElement = document.createElement("table");
        table.classList.add("table", "table-striped");
        table.createTHead();
        const theadRow: HTMLTableRowElement = table.tHead.insertRow(-1);
        const theadCell0: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell0.innerHTML = "transaction no.";
        const theadCell1: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell1.innerHTML = "date";
        const theadCell2: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell2.innerHTML = "action";
        const theadCell3: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell3.innerHTML = "number of shares";
        const theadCell4: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell4.innerHTML = "share price";
        const theadCell5: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell5.innerHTML = "available cash";
        const theadCell6: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell6.innerHTML = "total number of shares";
        const theadCell7: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell7.innerHTML = "total equity";
        table.createTBody();
        let transactionNo = 1;
        portofolio.history.forEach((item: TradeHistoryItem) => {
            const row: HTMLTableRowElement = table.insertRow(-1);
            row.style.color = item.action.startsWith("BUY") ? "blue" : "red";
            const cel0: HTMLTableCellElement = row.insertCell(-1);
            cel0.innerHTML = `${transactionNo}`;
            const cel1: HTMLTableCellElement = row.insertCell(-1);
            cel1.innerHTML = `${item.date.toISOString().split('T')[0]}`;
            const cel2: HTMLTableCellElement = row.insertCell(-1);
            cel2.innerHTML = `${item.action}`;
            const cel3: HTMLTableCellElement = row.insertCell(-1);
            cel3.innerHTML = `${item.numberOfShares}`;
            const cel4: HTMLTableCellElement = row.insertCell(-1);
            cel4.innerHTML = `${item.sharePrice}`;
            const cel5: HTMLTableCellElement = row.insertCell(-1);
            cel5.innerHTML = `${item.availableCash.toFixed(2)}`;
            const cel6: HTMLTableCellElement = row.insertCell(-1);
            cel6.innerHTML = `${item.totalNumberOfShares}`;
            const cel7: HTMLTableCellElement = row.insertCell(-1);
            cel7.innerHTML = `${(item.totalEquity).toFixed(2)}`;
            transactionNo++;
        });
        container.append(table);
    }
    public static printSummary(container: HTMLDivElement, tradeData: Array<StockHistoryItem>, portofolio: Portofolio): void {
        const table: HTMLTableElement = document.createElement("table");
        table.classList.add("table", "table-striped");
        table.createTHead();
        const theadRow: HTMLTableRowElement = table.tHead.insertRow(-1);
        const theadCell0: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell0.innerHTML = "number of transactions";
        const theadCell1: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell1.innerHTML = "date";
        const theadCell2: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell2.innerHTML = "number of shares";
        const theadCell3: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell3.innerHTML = "share price";
        const theadCell4: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell4.innerHTML = "available cash";
        const theadCell5: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell5.innerHTML = "total equity";
        const lastTimeValue: StockHistoryItem = tradeData[tradeData.length - 1];
        table.createTBody();
        const row: HTMLTableRowElement = table.insertRow(-1);
        const cel0: HTMLTableCellElement = row.insertCell(-1);
        cel0.innerHTML = `${portofolio.history.length}`;
        const cel1: HTMLTableCellElement = row.insertCell(-1);
        cel1.innerHTML = `${lastTimeValue.date.toISOString().split('T')[0]}`;
        const cel2: HTMLTableCellElement = row.insertCell(-1);
        cel2.innerHTML = `${portofolio.numberOfShares}`;
        const cel3: HTMLTableCellElement = row.insertCell(-1);
        cel3.innerHTML = `${lastTimeValue.close}`;
        const cel4: HTMLTableCellElement = row.insertCell(-1);
        cel4.innerHTML = `${portofolio.amountOfMoney.toFixed(2)}`;
        const cel5: HTMLTableCellElement = row.insertCell(-1);
        cel5.innerHTML = `${(portofolio.amountOfMoney + portofolio.numberOfShares * lastTimeValue.close).toFixed(2)}`;
        container.append(table);
    }
    public static printSummary2(container: HTMLDivElement, tradeData: Array<StockHistoryItem>, monteCarloSimulation: MonteCarloSimulation): void {
        const table: HTMLTableElement = document.createElement("table");
        table.style.width = "100%";
        table.createTHead();
        const theadRow: HTMLTableRowElement = table.tHead.insertRow(-1);
        const theadCell0: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell0.innerHTML = "strategy";
        const theadCell1: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell1.innerHTML = "started on";
        const theadCell2: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell2.innerHTML = "total equity";
        const theadCell3: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell3.innerHTML = "number of transactions";
        const theadCell4: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell4.innerHTML = "number of shares";
        const theadCell5: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell5.innerHTML = "hare price";
        const theadCell6: HTMLTableCellElement = theadRow.insertCell(-1);
        theadCell6.innerHTML = "available cash";
        const tbody: HTMLTableSectionElement = table.createTBody();
        let isAlternateRow = false;
        const lastTimeValue: StockHistoryItem = tradeData[tradeData.length - 1];
        for(const monteCarloSimulationGroup of monteCarloSimulation.monteCarloSimulationGroups) {
            tbody.style.backgroundColor = isAlternateRow ? "lightsteelblue": "linen";
            isAlternateRow = !isAlternateRow;
            for(const portofolio of monteCarloSimulationGroup.portofolios) {
                let style = "outline: thin solid;";
                if(portofolio === monteCarloSimulationGroup.bestPerformer) {
                    style += " font-weight: bold;";
                }
                const row: HTMLTableRowElement = table.insertRow(-1);
                row.style = style;
                const cel0: HTMLTableCellElement = row.insertCell(-1);
                cel0.innerHTML = `${portofolio.strategy?.toString()}`;
                const cel1: HTMLTableCellElement = row.insertCell(-1);
                cel1.innerHTML = `${portofolio.startDate.toISOString().split('T')[0]}`;
                const cel2: HTMLTableCellElement = row.insertCell(-1);
                cel2.style.textAlign = "right";
                cel2.innerHTML = `${(portofolio.currentValue).toFixed(2)}`;
                const cel3: HTMLTableCellElement = row.insertCell(-1);
                cel3.style.textAlign = "right";
                cel3.innerHTML = `${portofolio.numberOfTrades}`;
                const cel4: HTMLTableCellElement = row.insertCell(-1);
                cel4.style.textAlign = "right";
                cel4.innerHTML = `$${portofolio.numberOfShares}`;
                const cel5: HTMLTableCellElement = row.insertCell(-1);
                cel5.style.textAlign = "right";
                cel5.innerHTML = `${lastTimeValue.close}`;
                const cel6: HTMLTableCellElement = row.insertCell(-1);
                cel6.style.textAlign = "right";
                cel6.innerHTML = `${portofolio.amountOfMoney.toFixed(2)}`;
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