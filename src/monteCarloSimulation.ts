import "datatables.net"
import * as d3 from "d3";
import StockAndTradeHistoryItem from "./entities/StockAndTradeHistoryItem";
import Portofolio from "./entities/Portofolio";
import StockHistoryItem from "./entities/StockHistoryItem";
import Strategy from "./entities/Strategy";
import StockHistoryItemsPresenterTable from "./Presenters/StockHistoryItemsPresenterTable";
import PortofolioPresenter from "./Presenters/PortofolioPresenter";
import StockHistoryItemsPresenterGraph from "./Presenters/StockHistoryItemsPresenterGraph";
import BinaryConditionPresenter from "./Presenters/BinaryConditionPresenter";
import ActionPresenter from "./Presenters/ActionPresenter";
import BinaryCondition from "./entities/BinaryCondition";
import Action from "./entities/Action";
import StrategyBranch from "./entities/StrategyBranch";
import { StrategyParser } from "./entities/StrategyEvaluator";
import MonteCarloSimulationGroup from "./entities/MonteCarloSimulationGroup";
import MonteCarloSimulation from "./entities/MonteCarloSimulation";
import CompositeCondition from "./entities/CompositeCondition";
import PredefinedStrategies from "./predefinedStrategies";

interface TimeSelector {
    (tradeDate: StockHistoryItem, startDate: Date): boolean;
}
const startingDateSelector : TimeSelector = (tradeDate: StockHistoryItem, startDate: Date): boolean => { return tradeDate.date >= startDate; };
const binaryConditionPresenter: BinaryConditionPresenter = new BinaryConditionPresenter("binaryCondition");
const actionPresenter: ActionPresenter = new ActionPresenter("action");
let tradeData: Array<StockAndTradeHistoryItem>;
const strategies: Array<Strategy> = new Array<Strategy>();
let strategy: Strategy = new Strategy();

const   margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom;
function initGraphs(): void {
    /*const svg = d3.select("#chart").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom()
                .scaleExtent([1, 5])
                .translateExtent([[0, 0], [width - margin.left - margin.right, Infinity]])
                .extent([[0, 0], [width, height]])
                .on("zoom", (event) => { svg.attr("transform", event.transform); }));
    const svg2 = d3.select("#chartEquity").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom()
                .scaleExtent([1, 5])
                .translateExtent([[0, 0], [width - margin.left - margin.right, Infinity]])
                .extent([[0, 0], [width, height]])
                .on("zoom", (event) => { svg.attr("transform", event.transform); }));*/
}

document.addEventListener("DOMContentLoaded", () => {
    fetch(`.\\tickersList.json`)
        .then(res => res.json())
        .then(data => {
            const tickerList: HTMLSelectElement = (<HTMLSelectElement>document.getElementById('ticker'));
            Array.prototype.forEach.call(data['tickers'], (currentValue, index, arr) => {
                const option: HTMLOptionElement = document.createElement("option");
                option.value = data['tickers'][index].symbol;
                option.text = data['tickers'][index].name;
                tickerList.append(option);
            });
            tickerList.addEventListener("change", () => {
                const overlay: HTMLDivElement = (<HTMLDivElement>document.getElementById('overlay'));
                overlay.style.display = "block";
                const ticker: string = (<HTMLInputElement>document.getElementById("ticker")).value;
                document.getElementById("startingAmount").setAttribute("disabled", "disabled");
                document.getElementById("numberOfSimulations").setAttribute("disabled", "disabled");
                document.querySelectorAll('[id^="action"]').forEach(value => value.setAttribute("disabled", "disabled"));
                document.querySelectorAll('[id^="condition"]').forEach(value => value.setAttribute("disabled", "disabled"));
                document.getElementById("addStrategyBranch").setAttribute("disabled", "disabled");
                fetch(`.\\alphavantage\\${ticker}.json`)
                    .then(res => res.json())
                    .then(data => {
                        tradeData = StockHistoryItem.loadFromAlphavantage(data).map(x => x as StockAndTradeHistoryItem);
                        StockHistoryItemsPresenterTable.printHistoricData(document.getElementById("menu2"), tradeData);
                        const svgContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select("#chart").select("svg");
                        const graph: StockHistoryItemsPresenterGraph = new StockHistoryItemsPresenterGraph(svgContainer, tradeData, margin);
                        graph.drawDayOpenGraph();
                        document.getElementById("startingAmount").removeAttribute("disabled");
                        document.getElementById("numberOfSimulations").removeAttribute("disabled");
                        document.querySelectorAll('[id^="action"]').forEach(value => value.removeAttribute("disabled"));
                        document.querySelectorAll('[id^="condition"]').forEach(value => value.removeAttribute("disabled"));
                        document.getElementById("addStrategyBranch").removeAttribute("disabled");
                    })
                    .catch(error => {
                        console.log(error.message);
                    })
                    .finally(() => {
                        overlay.style.display = "none";
                    });
            });
        })
        .catch(error => {
            console.log(error.message);
        });
    document.getElementById("addStrategyBranch").addEventListener("click", () => {
        const binaryCondition: BinaryCondition = binaryConditionPresenter.read();
        const action: Action = actionPresenter.read();
        const strategyBranch: StrategyBranch = new StrategyBranch(action, new CompositeCondition(binaryCondition));
        strategy.strategyBranches.push(strategyBranch);
        document.getElementById("globalStrategy").innerHTML = `<p>${strategy.toString()}</p>`;
        // REFACTORING
        document.getElementById("actionRender").innerHTML = actionPresenter.render();
        document.getElementById("conditionRender").innerHTML = binaryConditionPresenter.render();
    });
    document.getElementById("addStrategy").addEventListener("click", () => {
        if(null == strategy.strategyBranches) {
            return;
        }
        strategies.push(strategy);
        document.getElementById("run").setAttribute("value", `Run ${strategies.length} strategies`);
        const p: HTMLParagraphElement = document.createElement("p");
        p.innerHTML = strategy.toString();
        document.getElementById("globalStrategies").append(p);
        document.getElementById("globalStrategies").append(document.createElement("hr"));
        strategy = new Strategy();
        document.getElementById("globalStrategy").innerHTML = "";
    });
    document.getElementById("run").addEventListener("click", () => {
        const startingAmount = Number((<HTMLInputElement>document.getElementById("startingAmount")).value);
        const numberOfSimulations = Number((<HTMLInputElement>document.getElementById("numberOfSimulations")).value);
        const portofolios: Array<Portofolio> = new Array<Portofolio>();
        const firstTradingDay: Date = tradeData[0].date;
        const lastTradingDay: Date = tradeData[tradeData.length - 1].date;
        const totalTradingDays = (lastTradingDay.getTime() - firstTradingDay.getTime())/(1000*3600*24);
        const simulationDayOffsets: Set<number> = new Set<number>();
        const monteCarloSimulation: MonteCarloSimulation = new MonteCarloSimulation();
        for(let i = 0; i < numberOfSimulations; i++) {
            let simulationDayOffset: number;
            do {
                simulationDayOffset = Math.floor(Math.random()*totalTradingDays);
            } while(simulationDayOffsets.has(simulationDayOffset));
            simulationDayOffsets.add(simulationDayOffset);
            const simulationDay: Date = new Date(firstTradingDay.getTime() + simulationDayOffset*1000*3600*24);
            const monteCarloSimulationGroup: MonteCarloSimulationGroup = new MonteCarloSimulationGroup();
            monteCarloSimulation.monteCarloSimulationGroups.push(monteCarloSimulationGroup);
            strategies.forEach((strategy:Strategy) => {
                const portofolio: Portofolio = new Portofolio(startingAmount, 0, simulationDay, tradeData);
                strategy.run(tradeData.filter((item) => { return startingDateSelector(item, simulationDay); }), portofolio);
                portofolios.push(portofolio);
                monteCarloSimulationGroup.portofolios.push(portofolio);
            });
        }
        const divSummary: HTMLDivElement = document.createElement("div");
        divSummary.style.fontWeight = "bold";
        divSummary.innerHTML = `Best performing strategy (${monteCarloSimulation.bestPerformer[1]} times):<br/>${monteCarloSimulation.bestPerformer[0].toString()}`;
        document.getElementById("home").append(divSummary);
        PortofolioPresenter.printSummary2((<HTMLDivElement>document.getElementById("home")), tradeData, monteCarloSimulation);
    });
    initGraphs();
    document.getElementById("actionRender").innerHTML = actionPresenter.render();
    document.getElementById("conditionRender").innerHTML = binaryConditionPresenter.render();
    const urlParamStrategies = "strategies";
    document.getElementById("getLink").addEventListener("click", () => {
        let strategiesString = "";
        strategies.forEach(x => { strategiesString += `{${x.toCode()}}`; });
        (<HTMLInputElement>document.getElementById("link")).setAttribute("value", window.location.href + "?" + urlParamStrategies + "=" + encodeURIComponent(strategiesString));
    });
    const searchParams = new URLSearchParams(window.location.search);
    if(searchParams.has(urlParamStrategies)) {
		const parser: StrategyParser = new StrategyParser();
        document.getElementById("globalStrategies").innerHTML = "";
        (decodeURIComponent(searchParams.get(urlParamStrategies))).match(/\{(.*?)\}/g).forEach(strategyString => {
            const strategy: Strategy = parser.parse(strategyString.replace("{", "").replace("}", ""));
            strategy.simplify();
            strategies.push(strategy);
            document.getElementById("run").setAttribute("value", `Run ${strategies.length} strategies`);
            const p: HTMLParagraphElement = document.createElement("p");
            p.innerHTML = strategy.toString();
            document.getElementById("globalStrategies").append(p);
            document.getElementById("globalStrategies").append(document.createElement("hr"));
        });
        document.getElementById("run").removeAttribute("disabled");
    }
    // Build predefined
    document.getElementById("menu6").innerHTML = PredefinedStrategies.multipleStrategies.map(x => `<br/><a href='?strategies=${encodeURIComponent(x[0])}'>${x[1]}</a>`).reduce((p, c) => p + c);
});