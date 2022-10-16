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
function runSimulations(tradeData: Array<StockAndTradeHistoryItem>, strategy: Strategy): void {
    let startingAmount: number = Number($("#startingAmount").val());
    let numberOfSimulations: number = Number($("#numberOfSimulations").val());
    let portofolios: Array<Portofolio> = new Array<Portofolio>();
    let firstTradingDay: Date = tradeData[0].date;
    let lastTradingDay: Date = tradeData[tradeData.length - 1].date;
    let totalTradingDays = (lastTradingDay.getTime() - firstTradingDay.getTime())/(1000*3600*24);
    let simulationDayOffsets: Set<number> = new Set<number>();
    for(var i: number = 0; i < numberOfSimulations; i++) {
        let simulationDayOffset: number;
        do {
            simulationDayOffset = Math.floor(Math.random()*totalTradingDays);
        } while(simulationDayOffsets.has(simulationDayOffset));
        simulationDayOffsets.add(simulationDayOffset);
        const simulationDay: Date = new Date(firstTradingDay.getTime() + simulationDayOffset*1000*3600*24);
        let portofolio: Portofolio = new Portofolio(startingAmount, 0, simulationDay);
        strategy.run(tradeData.filter((item) => { return startingDateSelector(item, simulationDay); }), portofolio);
        portofolios.push(portofolio);
    }
    PortofolioPresenter.printSummary2($("#home"), tradeData, portofolios);
}
function addStrategy(strategy: Strategy): void {
    $("#run").prop("disabled", false);
    let binaryCondition: BinaryCondition = binaryConditionPresenter.read();
    let action: Action = actionPresenter.read();
    const strategyBranch: StrategyBranch = new StrategyBranch(binaryCondition, action);
    strategy.strategyBranches.push(strategyBranch);
    $("#globalStrategy").html(`<p>${strategy.toString()}</p>`);
    // REFACTORING
    $("#actionRender").empty();
    $("#actionRender").html(actionPresenter.render());
    $("#conditionRender").empty();
    $("#conditionRender").html(`${binaryConditionPresenter.render()}`);
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
    .ajaxStart(function () {
        $("#overlay").fadeIn();
    })
    .ajaxStop(function () {
        $("#overlay").fadeOut();
    });
    let tradeData: Array<StockAndTradeHistoryItem>;
    const strategy: Strategy = new Strategy();
    $("#ticker").on("change", () => {
        let ticker: string = $("#ticker").val().toString();
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
    $("#addStrategyBranch").on("click", () => addStrategy(strategy));
    $("#run").on("click", () => runSimulations(tradeData, strategy));
    initGraphs();
    $("#actionRender").html(actionPresenter.render());
    $("#conditionRender").html(binaryConditionPresenter.render());
});