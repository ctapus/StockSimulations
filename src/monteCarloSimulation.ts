import * as $ from "jquery";
import "jquery-ui/ui/widgets/tooltip";
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

interface TimeSelector {
    (tradeDate: StockHistoryItem, startDate: Date): boolean;
}
const startingDateSelector : TimeSelector = (tradeDate: StockHistoryItem, startDate: Date): boolean => { return tradeDate.date >= startDate; };

const binaryConditionPresenter: BinaryConditionPresenter = new BinaryConditionPresenter("binaryCondition");
const actionPresenter: ActionPresenter = new ActionPresenter("action");

const   margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom;
function initGraphs(): void {
    const svg = d3.select("#chart").select("svg")
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
                .on("zoom", (event) => { svg.attr("transform", event.transform); }));
}

$(() => {
    $.getJSON(`.\\tickersList.json`, (data) => {
        $.each(data['tickers'], (index, value) => {
            $('#ticker').append($('<option></option>').val(data['tickers'][index].symbol).html(data['tickers'][index].name));
        });
    }).fail(() => {
        console.log("Error while reading json");
    }).always(() => {
    });
    $(document)
    .ajaxStart(() => {
        $("#overlay").fadeIn();
    })
    .ajaxStop(() => {
        $("#overlay").fadeOut();
    });
    $("#ticker").on("change", () => {
        const ticker: string = $("#ticker").val().toString();
        $("#startingAmount").prop("disabled", true);
        $("#numberOfSimulations").prop("disabled", true);
        $("#action").prop("disabled", true);
        $("#numberOfShares").prop("disabled", true);
        $("#condition").prop("disabled", true);
        $("#addStrategyBranch").prop("disabled", true);
        $.getJSON(`.\\alphavantage\\${ticker}.json`, (data) => {
            tradeData = StockHistoryItem.loadFromAlphavantage(data).map(x => x as StockAndTradeHistoryItem);
            StockHistoryItemsPresenterTable.printHistoricData($("#menu2"), tradeData);
            const svgContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select("#chart").select("svg");
            const graph: StockHistoryItemsPresenterGraph = new StockHistoryItemsPresenterGraph(svgContainer, tradeData, margin);
            graph.drawDayOpenGraph();
            $("#startingAmount").prop("disabled", false);
            $("#numberOfSimulations").prop("disabled", false);
            $("#action").prop("disabled", false);
            $("#numberOfShares").prop("disabled", false);
            $("#condition").prop("disabled", false);
            $("#addStrategyBranch").prop("disabled", false);
        }).fail(() => {
            console.log("Error while reading json");
        }).always(() => {
        });
    });
    let tradeData: Array<StockAndTradeHistoryItem>;
    const strategies: Array<Strategy> = new Array<Strategy>();
    let strategy: Strategy = new Strategy();
    $("#addStrategyBranch").on("click", () => {
        const binaryCondition: BinaryCondition = binaryConditionPresenter.read();
        const action: Action = actionPresenter.read();
        const strategyBranch: StrategyBranch = new StrategyBranch(action, binaryCondition);
        strategy.strategyBranches.push(strategyBranch);
        $("#globalStrategy").html(`<p>${strategy.toString()}</p>`);
        // REFACTORING
        $("#actionRender").html(actionPresenter.render());
        $("#conditionRender").html(`${binaryConditionPresenter.render()}`);
    });
    $("#addStrategy").on("click", () => {
        strategies.push(strategy);
        $("#run").attr("value", `Run ${strategies.length} strategies`);
        $("#globalStrategies").append(`<p>${strategy.toString()}</p>`);
        $("#globalStrategies").append(`<hr/>`);
        strategy = new Strategy();
        $("#globalStrategy").empty();
    });
    $("#run").on("click", () => {
        const startingAmount = Number($("#startingAmount").val());
        const numberOfSimulations = Number($("#numberOfSimulations").val());
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
        const divSummary: JQuery<HTMLElement> = $(`
        <div style='font-weight: bold;'>Best performing strategy (${monteCarloSimulation.bestPerformer[1]} times):<br/>${monteCarloSimulation.bestPerformer[0].toString()}</div>`);
        $("#home").append(divSummary);
        PortofolioPresenter.printSummary2($("#home"), tradeData, monteCarloSimulation);
    });
    initGraphs();
    $("#actionRender").html(actionPresenter.render());
    $("#conditionRender").html(binaryConditionPresenter.render());
    const urlParamStrategies = "strategies";
    $("#getLink").on("click", () => {
        let strategiesString = "";
        strategies.forEach(x => { strategiesString += `{${x.toCode()}}`; });
        $("#link").val(window.location.href + "?" + urlParamStrategies + "=" + encodeURIComponent(strategiesString));
    });
    const searchParams = new URLSearchParams(window.location.search);
    if(searchParams.has(urlParamStrategies)) {
		const parser: StrategyParser = new StrategyParser();
        $("#globalStrategies").empty();
        (decodeURIComponent(searchParams.get(urlParamStrategies))).match(/\{(.*?)\}/g).forEach(strategyString => {
            const strategy: Strategy = parser.parse(strategyString.replace("{", "").replace("}", ""));
            strategy.simplify();
            strategies.push(strategy);
            $("#run").attr("value", `Run ${strategies.length} strategies`);
            $("#globalStrategies").append(`<p>${strategy.toString()}</p>`);
            $("#globalStrategies").append(`<hr/>`);
        });
        $("#globalStrategy").html(`<p>${strategy.toString()}</p>`);
        $("#run").prop("disabled", false);
    }
});