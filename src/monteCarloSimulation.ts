import * as $ from "jquery";
import "jquery-ui/ui/widgets/tooltip";
import "datatables.net"
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
function drawHistoricDataGraph(tradeData: Array<StockHistoryItem>): void {
    const xScale = d3.scaleTime().domain(d3.extent<StockHistoryItem, Date>(tradeData, d => { return d.date; })).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max<StockHistoryItem, number>(tradeData, d => { return d.open; })]).range([height, 0]);
    const svg = d3.select("#chart").select("svg").append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    svg.append("g").attr("id", "xAxis").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));
    svg.append("g").attr("id", "yAxis").attr("transform", `translate(${width}, 0)`).call(d3.axisRight(yScale));
    const line = d3.line<StockHistoryItem>().x(d => { return xScale(d.date); }).y(d => { return yScale(d.open); }).curve(d3.curveBasis);
    svg.append("path")
        .data<StockHistoryItem[]>([tradeData])
        .style("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", "1.5")
        .attr("d", line);
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
function printResults(portofolio: Portofolio): void {
    let transactionNo: number = 1;
    portofolio.history.forEach((item: TradeHistoryItem) => {
        let styleColor: string = item.action === 'BUY' ? "blue" : "red";
        $('#results > tbody').append(`
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
}
function printSummary(tradeData: Array<StockHistoryItem>, startDate: Date, portofolio: Portofolio): void {
    const lastTimeValue: StockHistoryItem = tradeData[tradeData.length - 1];
    $('#summary > tbody').append(`
        <tr>
            <td>${startDate.toISOString().split('T')[0]}</td>
            <td>${lastTimeValue.date.toISOString().split('T')[0]}</td>
            <td>${portofolio.history.length}</td>
            <td>${portofolio.numberOfShares}</td>
            <td>${lastTimeValue.close}</td>
            <td>${portofolio.amountOfMoney.toFixed(2)}</td>
            <td>${(portofolio.amountOfMoney + portofolio.numberOfShares * lastTimeValue.close).toFixed(2)}</td>
        </tr>`);
}
function runSimulations(tradeData: Array<StockAndTradeHistoryItem>, strategy: Strategy): void {
    let startingAmount: number = Number($("#startingAmount").val());
    let numberOfSimulations: number = Number($("#numberOfSimulations").val());
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
        let portofolio: Portofolio = new Portofolio(startingAmount, 0);
        strategy.run(tradeData.filter((item) => { return startingDateSelector(item, simulationDay); }), portofolio);
        printSummary(tradeData, simulationDay, portofolio);
    }
    $("#summary").DataTable({
        paging: false,
        ordering: true
    });
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
function printHistoricData(tradeData: Array<StockAndTradeHistoryItem>): void {
    tradeData.forEach(item => {
        let variationIcon: string = "";
        if(item.openVariation > 100) {
            variationIcon = "<i style='color: green;' class='fas fa-arrow-up'></i>";
        }
        if(item.openVariation < 100) {
            variationIcon = "<i style='color: red;' class='fas fa-arrow-down'></i>";
        }
        $('#data > tbody').append(`
            <tr>
                <td>${item.date.toISOString().split('T')[0]}</td>
                <td>${item.open.toFixed(4)}</td>
                <td>${item.high.toFixed(4)}</td>
                <td>${item.low.toFixed(4)}</td>
                <td>${item.close.toFixed(4)}</td>
                <td>${item.volume}</td>
                <td>${item.low52Weeks === null || item.low52Weeks === undefined ? "" : item.low52Weeks}</td>
                <td>${item.high52Weeks === null || item.high52Weeks == undefined ? "" : item.high52Weeks}</td>
                <td>${item.openVariation ? item.openVariation.toFixed(4) + "%" : ""}</td>
                <td>${variationIcon}</td>
            </tr>`);
        });
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
            printHistoricData(tradeData);
            drawHistoricDataGraph(tradeData);
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