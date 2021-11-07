import * as $ from "jquery";
import "jquery-ui/ui/widgets/tooltip";
import * as bootstrap from "bootstrap";
import * as d3 from "d3";
import TradeHistoryItem from "./TradeHistoryItem";
import StockAndTradeHistoryItem from "./StockAndTradeHistoryItem";
import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";
import TradeCondition from './TradeCondition';
import TradeAction from './TradeAction';
import StrategyBranch from "./StrategyBranch";
import Strategy from "./Strategy";
import {tradeConditionTemplates, tradeActionTemplates} from "./Strategies";
import StockHistoryItemsPresenter from "./StockHistoryItemsPresenter";
import PortofolioPresenter from "./PortofolioPresenter";

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
function drawEquityGraph(portofolio: Portofolio): void {
    const xScale = d3.scaleTime().domain(d3.extent<TradeHistoryItem, Date>(portofolio.history, d => { return d.date; })).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max<TradeHistoryItem, number>(portofolio.history, d => { return d.totalEquity; })]).range([height, 0]);
    const svg = d3.select("#chartEquity").select("svg").append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
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
function runStrategy(tradeData: Array<StockAndTradeHistoryItem>, strategy: Strategy): void {
    let startingAmount: number = Number($("#startingAmount").val());
    let startDate: Date = new Date($("#startDate").val().toString());
    let portofolio: Portofolio = new Portofolio(startingAmount, 0, startDate);
    strategy.run(tradeData.filter((item) => { return startingDateSelector(item, startDate); }), portofolio);
    PortofolioPresenter.printResults($("#menu1"), portofolio);
    PortofolioPresenter.printSummary($("#home"), tradeData, portofolio);
    drawTransactionsGraph(tradeData, portofolio);
    drawEquityGraph(portofolio);
    //HACK
    tradeData.forEach(item => {
        const t: TradeHistoryItem = portofolio.history.find(x => x.date === item.date);
        item.trade = t ? `On ${t.date.toISOString().split('T')[0]} ${t.action} ${t.numberOfShares} shares for ${t.sharePrice}$ each. Total number of shares ${t.totalNumberOfShares}. Total Equity ${t.totalEquity}$. <br/>RULE: ${t.executionDescription}` : "";
    });
    $("#menu2").empty();
    StockHistoryItemsPresenter.printHistoricData($("#menu2"), tradeData);
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
        $('#overlay').fadeIn();
    })
    .ajaxStop(function () {
        $('#overlay').fadeOut();
    });
    let tradeData: Array<StockAndTradeHistoryItem>;
    const strategy: Strategy = new Strategy();
    $("#ticker").on("change", () => {
        let ticker: string = $("#ticker").val().toString();
        $("#startDate").prop("disabled", true);
        $("#startingAmount").prop("disabled", true);
        $("#action").prop("disabled", true);
        $("#numberOfShares").prop("disabled", true);
        $("#condition").prop("disabled", true);
        $("#addStrategyBranch").prop("disabled", true);
        $.getJSON(`.\\alphavantage\\${ticker}.json`, (data) => {
            tradeData = StockHistoryItem.loadFromAlphavantage(data).map(x => x as StockAndTradeHistoryItem);
            $("#startDate").val(tradeData[0].date.toISOString().split('T')[0]);
            StockHistoryItemsPresenter.printHistoricData($("#menu2"), tradeData);
            StockHistoryItemsPresenter.drawHistoricDataGraph(tradeData, margin);
            $("#startDate").prop("disabled", false);
            $("#startingAmount").prop("disabled", false);
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
    $("#run").on("click", () => runStrategy(tradeData, strategy));
    initGraphs();
});