import * as $ from "jquery";
import "jquery-ui/ui/widgets/tooltip";
import "datatables.net"
import * as d3 from "d3";
import StockAndTradeHistoryItem from "./StockAndTradeHistoryItem";
import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";
import TradeCondition from './TradeCondition';
import TradeAction from './TradeAction';
import StrategyBranch from "./StrategyBranch";
import Strategy from "./Strategy";
import {tradeConditionTemplates, tradeActionTemplates} from "./Strategies";
import StockHistoryItemsPresenterTable from "./StockHistoryItemsPresenterTable";
import PortofolioPresenter from "./PortofolioPresenter";
import StockHistoryItemsPresenterGraph from "./StockHistoryItemsPresenterGraph";

interface TimeSelector {
    (tradeDate: StockHistoryItem, startDate: Date): boolean;
}
const startingDateSelector : TimeSelector = (tradeDate: StockHistoryItem, startDate: Date): boolean => { return tradeDate.date >= startDate; };
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
    let action: string = $("#action option:selected").val().toString();
    let numberOfSharesOrPercentage: number = Number($("#numberOfSharesOrPercentage").val());
    let condition: string = $("#condition option:selected").val().toString();
    let thresholdValue: number = Number($("#thresholdValue").val());
    const strategyBranch: StrategyBranch = new StrategyBranch(
                                                new TradeCondition(tradeConditionTemplates[condition], thresholdValue), new TradeAction(tradeActionTemplates[action], numberOfSharesOrPercentage),
                                                tradeConditionTemplates[condition].instanceDescription, tradeActionTemplates[action].instanceDescription);
    strategy.strategyBranches.push(strategyBranch);
    $("#globalStrategy").html(`<p>${strategy.toString()}</p>`);
    $("#action").val("");
    $("#condition").val("");
    $("#conditionRender").empty();
    $("#actionRender").empty();
}

$(() => {
    const ddlActions = $("#action");
    for(var key in tradeActionTemplates) {
        ddlActions.append($("<option></option>").val(tradeActionTemplates[key].name).html(tradeActionTemplates[key].description));
    }
    const ddlConditions = $("#condition");
    for(var key in tradeConditionTemplates) {
        ddlConditions.append($("<option></option>").val(tradeConditionTemplates[key].name).html(tradeConditionTemplates[key].description));
    }
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
    $("#action").on("change", () => {
        let key: string = $("#action").val().toString();
        $("#actionRender").html(tradeActionTemplates[key].htmlRender);
    });
    $("#condition").on("change", () => {
        let key: string = $("#condition").val().toString();
        $("#conditionRender").html(tradeConditionTemplates[key].htmlRender);
    });
    $("#addStrategyBranch").on("click", () => addStrategy(strategy));
    $("#run").on("click", () => runSimulations(tradeData, strategy));
    initGraphs();
});