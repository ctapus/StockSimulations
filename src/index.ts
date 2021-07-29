import * as $ from "jquery";
import "jquery-ui/ui/widgets/tooltip";
import * as d3 from "d3";
import HistoryItem from "./HistoryItem";
import Portofolio from "./Portofolio";
import TradeData from "./TradeData";
import TradeCondition from './TradeCondition';
import TradeAction from './TradeAction';
import StrategyBranch from "./StrategyBranch";
import Strategy from "./Strategy";
import {tradeConditionTemplates, tradeActionTemplates} from "./Strategies";

interface TimeSelector {
    (tradeDate: TradeData, startDate: Date): boolean;
}
const startingDateSelector : TimeSelector = (tradeDate: TradeData, startDate: Date): boolean => { return tradeDate.date >= startDate; };

function getTimeValues(data: any): Array<TradeData> {
    let ret: Array<TradeData> = new Array<TradeData>();
    $.each(data["Time Series (Daily)"], (index, value) =>{
        const tradeData: TradeData = new TradeData();
        tradeData.date = new Date(index.toString());
        tradeData.open = Number(data["Time Series (Daily)"][index]["1. open"]);
        tradeData.high = Number(data["Time Series (Daily)"][index]["2. high"]);
        tradeData.low = Number(data["Time Series (Daily)"][index]["3. low"]);
        tradeData.close = Number(data["Time Series (Daily)"][index]["4. close"]);
        tradeData.volume = Number(data["Time Series (Daily)"][index]["5. volume"]);
        ret.push(tradeData);
    });
    let previousDayTrade: TradeData = null;
    ret.sort((a, b) => a.date.getTime() - b.date.getTime());
    $.each(ret, (index, value) => {
        ret[index].previousDay = previousDayTrade;
        previousDayTrade = ret[index];
        if(null != ret[index].previousDay) {
            ret[index].openVariation = ret[index].open / ret[index].previousDay.open * 100;
        }
    })
    return ret;
}
const   margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom;
function drawGraph(tradeData: Array<TradeData>): void {
    const xScale = d3.scaleTime().domain(d3.extent<TradeData, Date>(tradeData, d => { return d.date; })).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max<TradeData, number>(tradeData, d => { return d.open; })]).range([height, 0]);
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    svg.append("g").attr("id", "xAxis").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));
    svg.append("g").attr("id", "yAxis").attr("transform", `translate(${width}, 0)`).call(d3.axisRight(yScale));
    const line = d3.line<TradeData>().x(d => { return xScale(d.date); }).y(d => { return yScale(d.open); }).curve(d3.curveBasis);
    svg.append("path")
        .data<TradeData[]>([tradeData])
        .style("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", "1.5")
        .attr("d", line);
}
function drawActions(tradeData: Array<TradeData>, portofolio: Portofolio): void {
    const xScale = d3.scaleTime().domain(d3.extent<TradeData, Date>(tradeData, d => { return d.date; })).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max<TradeData, number>(tradeData, d => { return d.open; })]).range([height, 0]);
    const svg = d3.select('#chart').select("svg").append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    svg.selectAll("circle")
        .data<HistoryItem>(portofolio.history)
        .enter()
        .append("circle")
        .attr("cx", d => { return xScale(d.date); })
        .attr("cy", d => { return yScale(d.sharePrice); })
        .attr("r", 2)
        .attr("style", d => { return d.action === "BUY" ? "stroke:blue; stroke-width:1; fill: blue;" : "stroke:red; stroke-width:1; fill: red;"; })
        .attr("data-toggle", "tooltip")
        .attr("data-placement", "bottom")
        .attr("title", d => `${d.action} ${d.numberOfShares} shares at ${d.sharePrice}`);
    $('[data-toggle="tooltip"]').tooltip();
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
    let tradeData: Array<TradeData>;
    const strategy: Strategy = new Strategy();
    $("#ticker").on("change", function() {
        let ticker: string = $("#ticker").val().toString();
        $("#startDate").prop("disabled", true);
        $("#startingAmount").prop("disabled", true);
        $("#action").prop("disabled", true);
        $("#numberOfShares").prop("disabled", true);
        $("#condition").prop("disabled", true);
        $("#addStrategyBranch").prop("disabled", true);
        $.getJSON(`.\\alphavantage\\${ticker}.json`, (data) => {
            tradeData = getTimeValues(data);
            $("#startDate").val(tradeData[0].date.toISOString().split('T')[0]);
            tradeData.forEach(item => {
                $('#data > tbody').append(`
                    <tr>
                        <td>${item.date.toISOString().split('T')[0]}</td>
                        <td style="text-align: right;">${item.open.toFixed(4)}</td>
                        <td style="text-align: right;">${item.high.toFixed(4)}</td>
                        <td style="text-align: right;">${item.low.toFixed(4)}</td>
                        <td style="text-align: right;">${item.close.toFixed(4)}</td>
                        <td style="text-align: right;">${item.volume}</td>
                        <td style="text-align: right;">${item.openVariation ? item.openVariation.toFixed(4) + "%" : ""}</td>
                    </tr>`);
                });
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
    $("#addStrategyBranch").on("click", function() {
        $("#run").prop("disabled", false);
        let action: string = $("#action option:selected").val().toString();
        let numberOfShares: number = Number($("#numberOfShares").val());
        let condition: string = $("#condition option:selected").val().toString();
        let thresholdValue: number = Number($("#thresholdValue").val());
        const strategyBranch: StrategyBranch = new StrategyBranch(new TradeCondition(tradeConditionTemplates[condition], thresholdValue), new TradeAction(tradeActionTemplates[action], numberOfShares));
        strategy.strategyBranches.push(strategyBranch);
        $("#globalStrategy").html(`<p>${strategy.toString()}</p>`);
    });
    $("#run").on("click", function() {
        let startingAmount: number = Number($("#startingAmount").val());
        let startDate: Date = new Date($("#startDate").val().toString());
        let portofolio: Portofolio = new Portofolio(startingAmount, 0);
        tradeData.filter((item) => { return startingDateSelector(item, startDate); }).forEach(item => {
            strategy.strategyBranches.forEach((strategyBranch: StrategyBranch) => {
                if(strategyBranch.tradeCondition.condition(item, portofolio)) {
                    strategyBranch.tradeAction.action(item, portofolio);
                } else {
                    return false;
                }
            });
        });
        let transactionNo: number = 1;
        portofolio.history.forEach((item: HistoryItem) => {
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
        const lastTimeValue: TradeData = tradeData[tradeData.length - 1];
        $('#summary > tbody').append(`
            <tr>
                <td>${portofolio.history.length}</td>
                <td>${lastTimeValue.date.toISOString().split('T')[0]}</td>
                <td>${portofolio.numberOfShares}</td>
                <td>${lastTimeValue.close}</td>
                <td>${portofolio.amountOfMoney.toFixed(2)}</td>
                <td>${(portofolio.amountOfMoney + portofolio.numberOfShares * lastTimeValue.close).toFixed(2)}</td>
            </tr>`);
        drawActions(tradeData, portofolio);
    });
});