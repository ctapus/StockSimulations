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

interface TimeSelector {
    (tradeDate: StockHistoryItem, startDate: Date): boolean;
}
const startingDateSelector : TimeSelector = (tradeDate: StockHistoryItem, startDate: Date): boolean => { return tradeDate.date >= startDate; };
function getTimeValues(data: any): Array<StockHistoryItem> {
    let ret: Array<StockHistoryItem> = new Array<StockHistoryItem>();
    $.each(data["Time Series (Daily)"], (index, value) =>{
        const tradeData: StockHistoryItem = new StockHistoryItem();
        tradeData.date = new Date(index.toString());
        tradeData.open = Number(data["Time Series (Daily)"][index]["1. open"]);
        tradeData.high = Number(data["Time Series (Daily)"][index]["2. high"]);
        tradeData.low = Number(data["Time Series (Daily)"][index]["3. low"]);
        tradeData.close = Number(data["Time Series (Daily)"][index]["4. close"]);
        tradeData.volume = Number(data["Time Series (Daily)"][index]["5. volume"]);
        ret.push(tradeData);
    });
    let previousDayTrade: StockHistoryItem = null;
    let low52Weeks: number = Number.MAX_SAFE_INTEGER;
    let high52Weeks: number = Number.MIN_SAFE_INTEGER;
    ret.sort((a, b) => a.date.getTime() - b.date.getTime());
    $.each(ret, (index, value) => {
        ret[index].previousDay = previousDayTrade;
        previousDayTrade = ret[index];
        if(null != ret[index].previousDay) {
            ret[index].openVariation = ret[index].open / ret[index].previousDay.open * 100;
        }
        if (index >= 52 * 5) { // Ignore the first 52*5 days
            for(let i: number = index - 52 * 5; i<= index; i++) {
                if(ret[i].high >= high52Weeks) {
                    high52Weeks = ret[index].high;
                }
                if(ret[i].low <= low52Weeks) {
                    low52Weeks = ret[index].low;
                }
            }
            ret[index].high52Weeks = high52Weeks;
            ret[index].low52Weeks = low52Weeks;
        }
    })
    return ret;
}
const   margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom;
function initGraph(): void {
    const svg = d3.select("#chart").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom()
                .scaleExtent([1, 5])
                .translateExtent([[0, 0], [width - margin.left - margin.right, Infinity]])
                .extent([[0, 0], [width, height]])
                .on("zoom", (event) => { svg.attr("transform", event.transform); }));
}
function drawGraph(tradeData: Array<StockHistoryItem>): void {
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
function drawActions(tradeData: Array<StockHistoryItem>, portofolio: Portofolio): void {
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
                <td>${(item.availableCash + item.totalNumberOfShares * item.sharePrice).toFixed(2)}</td>
            </tr>`);
          transactionNo++;
    });
}
function printSummary(tradeData: Array<StockHistoryItem>, portofolio: Portofolio): void {
    const lastTimeValue: StockHistoryItem = tradeData[tradeData.length - 1];
    $('#summary > tbody').append(`
        <tr>
            <td>${portofolio.history.length}</td>
            <td>${lastTimeValue.date.toISOString().split('T')[0]}</td>
            <td>${portofolio.numberOfShares}</td>
            <td>${lastTimeValue.close}</td>
            <td>${portofolio.amountOfMoney.toFixed(2)}</td>
            <td>${(portofolio.amountOfMoney + portofolio.numberOfShares * lastTimeValue.close).toFixed(2)}</td>
        </tr>`);
}
function runStrategy(tradeData: Array<StockAndTradeHistoryItem>, strategy: Strategy): void {
    let startingAmount: number = Number($("#startingAmount").val());
    let startDate: Date = new Date($("#startDate").val().toString());
    let portofolio: Portofolio = new Portofolio(startingAmount, 0);
    tradeData.filter((item) => { return startingDateSelector(item, startDate); }).forEach(item => {
        strategy.strategyBranches.forEach((strategyBranch: StrategyBranch) => {
            if(strategyBranch.tradeCondition.condition(item, portofolio)) {
                strategyBranch.tradeAction.action(item, portofolio);
                portofolio.lastHistoryItem.executionDescription = strategyBranch.toString();
            } else {
                return false;
            }
        });
    });
    printResults(portofolio);
    printSummary(tradeData, portofolio);
    drawActions(tradeData, portofolio);
    //HACK
    tradeData.forEach(item => {
        const t: TradeHistoryItem = portofolio.history.find(x => x.date === item.date);
        item.trade = t ? `On ${t.date.toISOString().split('T')[0]} ${t.action} ${t.numberOfShares} shares for ${t.sharePrice}$ each. Total number of shares ${t.totalNumberOfShares} <br/>RULE: ${t.executionDescription}` : "";
    });
    $('#data > tbody').empty();
    printHistoricData(tradeData);
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
                <td style="text-align: right;">${item.open.toFixed(4)}</td>
                <td style="text-align: right;">${item.high.toFixed(4)}</td>
                <td style="text-align: right;">${item.low.toFixed(4)}</td>
                <td style="text-align: right;">${item.close.toFixed(4)}</td>
                <td style="text-align: right;">${item.volume}</td>
                <td style="text-align: right;">${item.low52Weeks === null || item.low52Weeks === undefined ? "" : item.low52Weeks}</td>
                <td style="text-align: right;">${item.high52Weeks === null || item.high52Weeks == undefined ? "" : item.high52Weeks}</td>
                <td style="text-align: right;">${item.openVariation ? item.openVariation.toFixed(4) + "%" : ""}</td>
                <td style="text-align: right;">${variationIcon}</td>
                <td style="text-align: left;">${item.trade}</td>
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
            tradeData = getTimeValues(data).map(x => x as StockAndTradeHistoryItem);
            $("#startDate").val(tradeData[0].date.toISOString().split('T')[0]);
            printHistoricData(tradeData);
            drawGraph(tradeData);
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
    initGraph();
});