import "jquery-ui/ui/widgets/tooltip";
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
import TradeHistoryItemsPresenterGraph from "./Presenters/TradeHistoryItemsPresenterGraph";
import BinaryConditionPresenter from "./Presenters/BinaryConditionPresenter";
import ActionPresenter from "./Presenters/ActionPresenter";
import BinaryCondition from "./entities/BinaryCondition";
import Action from "./entities/Action";
import { StrategyParser } from "./entities/StrategyEvaluator";
import CompositeCondition from "./entities/CompositeCondition";
import PredefinedStrategies from "./predefinedStrategies";

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
    const svg = d3.select("chart").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    const svg2 = d3.select("chartEquity").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    const svg3 = d3.select("chartExperimental").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
}

function runStrategy(tradeData: Array<StockAndTradeHistoryItem>, strategy: Strategy): void {
    const startingAmount = Number((<HTMLInputElement>document.getElementById("startingAmount")).value);
    const startDate: Date = new Date((<HTMLInputElement>document.getElementById("startDate")).value);
    const portofolio: Portofolio = new Portofolio(startingAmount, 0, startDate, tradeData);
    strategy.run(tradeData.filter((item) => { return startingDateSelector(item, startDate); }), portofolio);
    PortofolioPresenter.printResults((<HTMLDivElement>document.getElementById("menu1")), portofolio);
    PortofolioPresenter.printSummary((<HTMLDivElement>document.getElementById("home")), tradeData, portofolio);
    const svgChart = d3.select('chart').select("svg");
    const graph: TradeHistoryItemsPresenterGraph = new TradeHistoryItemsPresenterGraph(svgChart, tradeData, portofolio, margin);
    graph.drawTransactionsGraph();
    const svgChartEquity: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select("chartEquity").select("svg");
    PortofolioPresenter.drawEquityGraph(svgChartEquity, portofolio, margin);
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
                        graph.draw10DaysEMAGraph();
                        graph.draw20DaysEMAGraph();
                        graph.draw50DaysEMAGraph();
                        graph.draw100DaysEMAGraph();
                        graph.draw200DaysEMAGraph();
                        graph.draw14DaysRSIGraph();
                        graph.drawLegend();
                        const svgContainerExperimental: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select("chartExperimental").select("svg");
                        const graphExperimental: StockHistoryItemsPresenterGraph = new StockHistoryItemsPresenterGraph(svgContainerExperimental, tradeData, margin);
                        graphExperimental.drawDayOpenGraph();
                        graphExperimental.drawDerivativeFirstGraph();
                        graphExperimental.drawDerivativeSecondGraph();
                        graphExperimental.drawDerivativeThirdGraph();
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
    document.getElementById("addStrategyBranch").addEventListener("click", () => addStrategy(strategy));
    document.getElementById("run").addEventListener("click", () => runStrategy(tradeData, strategy));
    initGraphs();
    // REFACTORING
    document.getElementById("actionRender").innerHTML = actionPresenter.render();
    document.getElementById("conditionRender").innerHTML = binaryConditionPresenter.render();

    actionPresenter.addJavascript();
    const urlParamStrategy = "strategy";
    document.getElementById("getLink").addEventListener("click", () => {
        (<HTMLInputElement>document.getElementById("link")).value = window.location.href + "?" + urlParamStrategy + "=" + encodeURIComponent(strategy.toCode());
    });
    const searchParams = new URLSearchParams(window.location.search);
    if(searchParams.has(urlParamStrategy)) {
        const strategiesString = searchParams.get(urlParamStrategy);
		const parser: StrategyParser = new StrategyParser();
        strategy = parser.parse(decodeURIComponent(strategiesString));
        strategy.simplify();
        const p: HTMLParagraphElement = document.createElement("p");
        p.innerHTML = strategy.toString();
        document.getElementById("globalStrategy").append(p);
        document.getElementById("run").removeAttribute("disabled");
    }
    // Build predefined
    document.getElementById("menu7").innerHTML = PredefinedStrategies.SingleStragies.map(x => `<br/><a href='?strategy=${encodeURIComponent(x[0])}'>${x[1]}</a>`).reduce((p, c) => p + c);
});