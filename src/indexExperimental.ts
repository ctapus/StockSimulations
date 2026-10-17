import * as bootstrap from "bootstrap";
import * as d3 from "d3";
import TradeHistoryItem from "./entities/TradeHistoryItem";
import StockAndTradeHistoryItem from "./entities/StockAndTradeHistoryItem";
import Portofolio from "./entities/Portofolio";
import StockHistoryItem from "./entities/StockHistoryItem";
import StrategyBranch from "./entities/StrategyBranch";
import Strategy from "./entities/Strategy";
import StockHistoryItemsPresenterTable from "./Presenters/StockHistoryItemsPresenterTable";
import PortofolioPresenter from "./Presenters/PortofolioPresenter";
import StockHistoryItemsPresenterGraph from "./Presenters/StockHistoryItemsPresenterGraph";
import BinaryConditionPresenter from "./Presenters/BinaryConditionPresenter";
import ActionPresenter from "./Presenters/ActionPresenter";
import BinaryCondition from "./entities/BinaryCondition";
import Action from "./entities/Action";
import { StrategyParser } from "./entities/StrategyEvaluator";
import { IndicatorPresenter } from "./Presenters/IndicatorPresenter";
import ArithmeticOperatorPresenter from "./Presenters/ArithmeticOperatorPresenter";
import ComparisonOperatorPresenter from "./Presenters/ComparisonOperatorPresenter";
import CompositeCondition from "./entities/CompositeCondition";

interface TimeSelector {
    (tradeDate: StockHistoryItem, startDate: Date): boolean;
}
const startingDateSelector : TimeSelector = (tradeDate: StockHistoryItem, startDate: Date): boolean => { return tradeDate.date >= startDate; };

const binaryConditionPresenter: BinaryConditionPresenter = new BinaryConditionPresenter("binaryCondition");
const actionPresenter: ActionPresenter = new ActionPresenter("action");
let tradeData: Array<StockAndTradeHistoryItem>;
let strategy: Strategy = new Strategy();

const margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;
function initGraphs(): void {
    const svg = d3.select("#chart").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    const svg2 = d3.select("#chartEquity").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
}
function drawTransactionsGraph(tradeData: Array<StockHistoryItem>, portofolio: Portofolio): void {
    const xScale = d3.scaleTime().domain(d3.extent<StockHistoryItem, Date>(tradeData, d => { return d.date; })).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max<StockHistoryItem, number>(tradeData, d => { return d.open; })]).range([height, 0]);
    const svg = d3.select('#chart').select("svg").append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    svg.selectAll("circle")
        .data<TradeHistoryItem>(portofolio.history)
        .enter()
        .append("circle")
        .attr("cx", d => { return xScale(d.date); })
        .attr("cy", d => { return yScale(d.sharePrice); })
        .attr("r", 2)
        .attr("style", d => { return d.action === "BUY" ? "stroke:blue; stroke-width:1; fill: blue;" : "stroke:red; stroke-width:1; fill: red;"; })
        .attr("data-bs-toggle", "tooltip")
        .attr("data-bs-placement", "auto")
        .attr("data-bs-html", "true")
        .attr("title", d => `On ${d.date.toISOString().split('T')[0]}<br /> ${d.action} ${d.numberOfShares} shares at ${d.sharePrice}`);
    [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(x => { return new bootstrap.Tooltip(x); })
}
function runStrategy(tradeData: Array<StockAndTradeHistoryItem>, strategy: Strategy): void {
    const startingAmount = Number((<HTMLInputElement>document.getElementById("startingAmount")).value);
    const startDate: Date = new Date((<HTMLInputElement>document.getElementById("startDate")).value);
    const portofolio: Portofolio = new Portofolio(startingAmount, 0, startDate, tradeData);
    strategy.run(tradeData.filter((item) => { return startingDateSelector(item, startDate); }), portofolio);
    PortofolioPresenter.printResults((<HTMLDivElement>document.getElementById("menu1")), portofolio);
    PortofolioPresenter.printSummary((<HTMLDivElement>document.getElementById("home")), tradeData, portofolio);
    drawTransactionsGraph(tradeData, portofolio);
    const svgContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select("#chartEquity").select("svg");
    PortofolioPresenter.drawEquityGraph(svgContainer, portofolio, margin);
    //HACK
    tradeData.forEach(item => {
        const t: TradeHistoryItem = portofolio.history.find(x => x.date === item.date);
        item.trade = t ? `On ${t.date.toISOString().split('T')[0]} ${t.action} ${t.numberOfShares} shares for ${t.sharePrice}$ each. Total number of shares ${t.totalNumberOfShares}. Total Equity ${t.totalEquity}$. <br/>RULE: ${t.executionDescription}` : "";
    });
    document.getElementById("menu2").innerHTML = "";
    StockHistoryItemsPresenterTable.printHistoricData(document.getElementById("menu2"), tradeData);
}
function addStrategy(strategy: Strategy): void {
    document.getElementById("run").removeAttribute("disabled");
    const binaryCondition: BinaryCondition = binaryConditionPresenter.read();
    const action: Action = actionPresenter.read();
    const strategyBranch: StrategyBranch = new StrategyBranch(action, new CompositeCondition(binaryCondition));
    strategy.strategyBranches.push(strategyBranch);
    document.getElementById("globalStrategy").innerHTML = `<p>${strategy.toString()}</p>`;
    // REFACTORING
    document.getElementById("actionRender").innerHTML = actionPresenter.render();
    document.getElementById("conditionRender").innerHTML = `${binaryConditionPresenter.render()}`;
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
                        tradeData = StockHistoryItem.loadFromAlphavantage(data).map(x => x as StockAndTradeHistoryItem);
                        (<HTMLInputElement>document.getElementById("startDate")).value = tradeData[0].date.toISOString().split('T')[0];
                        StockHistoryItemsPresenterTable.printHistoricData(document.getElementById("menu2"), tradeData);
                        const svgContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select("chart").select("svg");
                        const graph: StockHistoryItemsPresenterGraph = new StockHistoryItemsPresenterGraph(svgContainer, tradeData, margin);
                        graph.drawDayOpenGraph();
                        graph.draw50DaysSMAGraph();
                        graph.draw100DaysSMAGraph();
                        graph.draw200DaysSMAGraph();
                        graph.draw50DaysEMAGraph();
                        graph.draw100DaysEMAGraph();
                        graph.draw200DaysEMAGraph();
                        graph.drawLegend();
                        document.getElementById("startDate").removeAttribute("disabled");
                        document.getElementById("startingAmount").removeAttribute("disabled");
                    })
                    .catch(error => {
                        console.log(error.message);
                    });
            });
        })
        .catch(error => {
            console.log(error.message);
        });
    document.getElementById("run").addEventListener("click", () => runStrategy(tradeData, strategy));
    initGraphs();
    // REFACTORING
    const urlParamStrategy = "strategy";
    document.getElementById("getLink").addEventListener("click", () => {
        document.getElementById("link").setAttribute("value", window.location.href + "?" + urlParamStrategy + "=" + encodeURIComponent(strategy.toCode()));
    });
    const searchParams = new URLSearchParams(window.location.search);
    if(searchParams.has(urlParamStrategy)) {
        const strategiesString = searchParams.get(urlParamStrategy);
		const parser: StrategyParser = new StrategyParser();
        strategy = parser.parse(decodeURIComponent(strategiesString));
        strategy.simplify();
        document.getElementById("globalStrategy").innerHTML = `<p>${strategy.toString()}</p>`;
        document.getElementById("run").removeAttribute("disabled");
    }

    document.getElementById("iconIndicator").addEventListener("dragstart", (e: DragEvent) => {
        e.dataTransfer.setData("text/plain", "indicator");
    });
    document.getElementById("iconArithmeticOperator").addEventListener("dragstart", (e: DragEvent) => {
        e.dataTransfer.setData("text/plain", "arithmeticOperator");
    });
    document.getElementById("iconComparisonOperator").addEventListener("dragstart", (e: DragEvent   ) => {
        e.dataTransfer.setData("text/plain", "comparisonOperator");
    });
    document.getElementById("iconNumber").addEventListener("dragstart", (e: DragEvent) => {
        e.dataTransfer.setData("text/plain", "number");
    });
    document.getElementById("conditionRender").addEventListener("dragenter", (e: DragEvent) => {
        e.preventDefault();
        (<HTMLElement>e.target).style.backgroundColor = "SkyBlue";
    });
    document.getElementById("conditionRender").addEventListener("dragover", (e: DragEvent) => {
        e.preventDefault();
        (<HTMLElement>e.target).style.backgroundColor = "SkyBlue";
    });
    document.getElementById("conditionRender").addEventListener("dragleave", (e: DragEvent) => {
        (<HTMLElement>e.target).style.backgroundColor = "Azure";
    });
    document.getElementById("conditionRender").addEventListener("drop", (e: DragEvent) => {
        (<HTMLElement>e.target).style.backgroundColor = "Azure";
        const dt: string = e.dataTransfer.getData("text/plain");
        if(dt === "indicator") {
            (<HTMLElement>e.target).appendChild((new IndicatorPresenter("indicator")).renderHTML());
        }
        if(dt === "arithmeticOperator") {
            (<HTMLElement>e.target).appendChild((new ArithmeticOperatorPresenter("arithmeticOperator")).renderHTML());
        }
        if(dt === "comparisonOperator") {
            (<HTMLElement>e.target).appendChild((new ComparisonOperatorPresenter("comparisonOperator")).renderHTML());
        }
        if(dt === "number") {
            const input: HTMLElement = document.createElement("input");
            input.setAttribute("type", "number");
            input.setAttribute("size", "6");
            input.setAttribute("step", ".01");
            input.setAttribute("class", "input-sm");
            input.setAttribute('data-glyph-type', 'Value');
            (<HTMLElement>e.target).appendChild(input);
        }
    });
    document.getElementById("addStrategyBranch").addEventListener("click", () => {
        const myElement: HTMLElement = document.getElementById("conditionRender");
        for (const child of myElement.children) {
            console.log(child);
            console.log((child as HTMLElement).dataset.glyphType);
            console.log((child as HTMLElement).getAttribute('data-glyph-type'));
            console.log(child.tagName);
            console.log((child as HTMLElement).dataset.glyphType);
        }
        addStrategy(strategy)
    });
});