import * as $ from "jquery";
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
import BinaryConditionPresenter from "./Presenters/BinaryConditionPresenter";
import ActionPresenter from "./Presenters/ActionPresenter";
import BinaryCondition from "./entities/BinaryCondition";
import Action from "./entities/Action";
import { StrategyParser } from "./entities/StrategyEvaluator";
import { IndicatorPresenter } from "./Presenters/IndicatorPresenter";
import ArithmeticOperatorPresenter from "./Presenters/ArithmeticOperatorPresenter";
import ComparisonOperatorPresenter from "./Presenters/ComparisonOperatorPresenter";

interface TimeSelector {
    (tradeDate: StockHistoryItem, startDate: Date): boolean;
}
const startingDateSelector : TimeSelector = (tradeDate: StockHistoryItem, startDate: Date): boolean => { return tradeDate.date >= startDate; };

const binaryConditionPresenter: BinaryConditionPresenter = new BinaryConditionPresenter("binaryCondition");
const actionPresenter: ActionPresenter = new ActionPresenter("action");

const margin = { top: 50, right: 50, bottom: 50, left: 50 },
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
function runStrategy(tradeData: Array<StockAndTradeHistoryItem>, strategy: Strategy): void {
    const startingAmount = Number($("#startingAmount").val());
    const startDate: Date = new Date($("#startDate").val().toString());
    const portofolio: Portofolio = new Portofolio(startingAmount, 0, startDate, tradeData);
    strategy.run(tradeData.filter((item) => { return startingDateSelector(item, startDate); }), portofolio);
    PortofolioPresenter.printResults($("#menu1"), portofolio);
    PortofolioPresenter.printSummary($("#home"), tradeData, portofolio);
    drawTransactionsGraph(tradeData, portofolio);
    const svgContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select("#chartEquity").select("svg");
    PortofolioPresenter.drawEquityGraph(svgContainer, portofolio, margin);
    //HACK
    tradeData.forEach(item => {
        const t: TradeHistoryItem = portofolio.history.find(x => x.date === item.date);
        item.trade = t ? `On ${t.date.toISOString().split('T')[0]} ${t.action} ${t.numberOfShares} shares for ${t.sharePrice}$ each. Total number of shares ${t.totalNumberOfShares}. Total Equity ${t.totalEquity}$. <br/>RULE: ${t.executionDescription}` : "";
    });
    $("#menu2").empty();
    StockHistoryItemsPresenterTable.printHistoricData($("#menu2"), tradeData);
}
function addStrategy(strategy: Strategy): void {
    $("#run").prop("disabled", false);
    const binaryCondition: BinaryCondition = binaryConditionPresenter.read();
    const action: Action = actionPresenter.read();
    const strategyBranch: StrategyBranch = new StrategyBranch(action, binaryCondition);
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
        $('#overlay').fadeIn();
    })
    .ajaxStop(function () {
        $('#overlay').fadeOut();
    });
    let tradeData: Array<StockAndTradeHistoryItem>;
    let strategy: Strategy = new Strategy();
    $("#ticker").on("change", () => {
        const ticker: string = $("#ticker").val().toString();
        $("#startDate").prop("disabled", true);
        $("#startingAmount").prop("disabled", true);
        $.getJSON(`.\\alphavantage\\${ticker}.json`, (data) => {
            tradeData = StockHistoryItem.loadFromAlphavantage(data).map(x => x as StockAndTradeHistoryItem);
            $("#startDate").val(tradeData[0].date.toISOString().split('T')[0]);
            StockHistoryItemsPresenterTable.printHistoricData($("#menu2"), tradeData);
            const svgContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select("#chart").select("svg");
            const graph: StockHistoryItemsPresenterGraph = new StockHistoryItemsPresenterGraph(svgContainer, tradeData, margin);
            graph.drawDayOpenGraph();
            graph.draw50DaysSMAGraph();
            graph.draw100DaysSMAGraph();
            graph.draw200DaysSMAGraph();
            graph.draw50DaysEMAGraph();
            graph.draw100DaysEMAGraph();
            graph.draw200DaysEMAGraph();
            graph.drawLegend();
            $("#startDate").prop("disabled", false);
            $("#startingAmount").prop("disabled", false);
        }).fail(() => {
            console.log("Error while reading json");
        }).always(() => {
        });
    });
    $("#run").on("click", () => runStrategy(tradeData, strategy));
    initGraphs();
    // REFACTORING
    const urlParamStrategy = "strategy";
    $("#getLink").on("click", () => {
        $("#link").val(window.location.href + "?" + urlParamStrategy + "=" + encodeURIComponent(strategy.toCode()));
    });
    const searchParams = new URLSearchParams(window.location.search);
    if(searchParams.has(urlParamStrategy)) {
        const strategiesString = searchParams.get(urlParamStrategy);
		const parser: StrategyParser = new StrategyParser();
        strategy = parser.parse(decodeURIComponent(strategiesString));
        strategy.simplify();
        $("#globalStrategy").html(`<p>${strategy.toString()}</p>`);
        $("#run").prop("disabled", false);
    }

    $("#iconIndicator").on("dragstart", (e) => {
        e.originalEvent.dataTransfer.setData("text/plain", "indicator");
    });
    $("#iconArithmeticOperator").on("dragstart", (e) => {
        e.originalEvent.dataTransfer.setData("text/plain", "arithmeticOperator");
    });
    $("#iconComparisonOperator").on("dragstart", (e) => {
        e.originalEvent.dataTransfer.setData("text/plain", "comparisonOperator");
    });
    $("#iconNumber").on("dragstart", (e) => {
        e.originalEvent.dataTransfer.setData("text/plain", "number");
    });
    $("#conditionRender").on("dragenter", (e) => {
        e.preventDefault();
        e.target.style.backgroundColor = "SkyBlue";
    });
    $("#conditionRender").on("dragover", (e) => {
        e.preventDefault();
        e.target.style.backgroundColor = "SkyBlue";
    });
    $("#conditionRender").on("dragleave", (e) => {
        e.target.style.backgroundColor = "Azure";
    });
    $("#conditionRender").on("drop", (e) => {
        e.target.style.backgroundColor = "Azure";
        const dt: string = e.originalEvent.dataTransfer.getData("text/plain");
        if(dt === "indicator") {
            e.target.appendChild((new IndicatorPresenter("indicator")).renderHTML());
        }
        if(dt === "arithmeticOperator") {
            e.target.appendChild((new ArithmeticOperatorPresenter("arithmeticOperator")).renderHTML());
        }
        if(dt === "comparisonOperator") {
            e.target.appendChild((new ComparisonOperatorPresenter("comparisonOperator")).renderHTML());
        }
        if(dt === "number") {
            const input: HTMLElement = document.createElement("input");
            input.setAttribute("type", "number");
            input.setAttribute("size", "6");
            input.setAttribute("step", ".01");
            input.setAttribute("class", "input-sm");
            input.setAttribute('data-glyph-type', 'Value');
            e.target.appendChild(input);
        }
    });
    $("#addStrategyBranch").on("click", () => {
        console.log('meh');
        $("#conditionRender").children().each(() => {
            console.log($(this).attr('data-glyph-type'));
        });
        //addStrategy(strategy)
    });
});