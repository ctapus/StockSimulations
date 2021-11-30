import * as $ from "jquery";
import Portofolio from "./entities/Portofolio";
import StockHistoryItem from "./entities/StockHistoryItem";
import StrategyBranch from "./entities/StrategyBranch";
import Strategy from "./entities/Strategy";
import StockAndTradeHistoryItem from "./entities/StockAndTradeHistoryItem";
import StockHistoryItemsPresenterTable from "./Presenters/StockHistoryItemsPresenterTable";
import StockHistoryItemsPresenterGraph from "./Presenters/StockHistoryItemsPresenterGraph";
import BinaryConditionPresenter from "./Presenters/BinaryConditionPresenter";
import ActionPresenter from "./Presenters/ActionPresenter";
import BinaryCondition from "./entities/BinaryCondition";
import Action from "./entities/Action";
import * as d3 from "d3";

interface TimeSelector {
    (tradeDate: StockHistoryItem, startDate: Date): boolean;
}
const startingDateSelector : TimeSelector = (tradeDate: StockHistoryItem, startDate: Date): boolean => { return tradeDate.date >= startDate; };

const binaryConditionPresenter: BinaryConditionPresenter = new BinaryConditionPresenter("binaryCondition");
const actionPresenter: ActionPresenter = new ActionPresenter("action");

const margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

$(() => {
    $(document)
    .ajaxStart(function () {
        $('#overlay').fadeIn();
    })
    .ajaxStop(function () {
        $('#overlay').fadeOut();
    });
    let tradeData: Array<StockAndTradeHistoryItem>;
    const strategies: Array<Strategy> = new Array<Strategy>();
    strategies.push(new Strategy());
    $("#ticker").on("change", () => {
        let ticker: string = $("#ticker").val().toString();
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
    $("#newStrategy").on("click", function() {
        strategies.push(new Strategy());
        $("#globalStrategies").append(`<hr/>`);
    });
    $("#addStrategyBranch").on("click", function() {
        /*$("#run").prop("disabled", false);
        let action: string = $("#action option:selected").val().toString();
        let numberOfSharesOrPercentage: number = Number($("#numberOfSharesOrPercentage").val());
        let condition: string = $("#condition option:selected").val().toString();
        let thresholdValue: number = Number($("#thresholdValue").val());
        const strategyBranch: StrategyBranch = new StrategyBranch(
                                                    new TradeCondition(tradeConditionTemplates[condition], thresholdValue), new TradeAction(tradeActionTemplates[action], numberOfSharesOrPercentage),
                                                    tradeConditionTemplates[condition].instanceDescription, tradeActionTemplates[action].instanceDescription);
        strategies[strategies.length - 1].strategyBranches.push(strategyBranch);
        let strategiesDescription: string = "";
        strategies.forEach((strategy: Strategy) => {
            strategiesDescription += `<p>${strategy.toString()}</p><hr/>`;
        });
        $("#globalStrategies").html(strategiesDescription);*/
    });
    $("#run").on("click", function() {
        let startingAmount: number = Number($("#startingAmount").val());
        let startDate: Date = new Date($("#startDate").val().toString());
        $("#globalStrategies").empty();
        strategies.forEach((strategy:Strategy) => {
            $("#globalStrategies").append(`<p>${strategy.toString()}</p><br/>`);
            let portofolio: Portofolio = new Portofolio(startingAmount, 0, startDate);
            strategy.run(tradeData.filter((item) => { return startingDateSelector(item, startDate); }), portofolio);
            const firstTimeValue: StockHistoryItem = tradeData[0];
            const lastTimeValue: StockHistoryItem = tradeData[tradeData.length - 1];
            $("#globalStrategies").append(`
            <table class="table table-striped">
                <thead>
                    <td>number of transactions</td>
                    <td>date</td>
                    <td>number of shares</td>
                    <td>initial share price</td>
                    <td>final share price</td>
                    <td>available cash</td>
                    <td>total equity</td>
                </thead>
                <tbody>
                    <tr>
                        <td>${portofolio.history.length}</td>
                        <td>${lastTimeValue.date.toLocaleDateString()}</td>
                        <td>${portofolio.numberOfShares}</td>
                        <td>${firstTimeValue.close}</td>
                        <td>${lastTimeValue.close}</td>
                        <td>${portofolio.amountOfMoney.toFixed(2)}</td>
                        <td>${(portofolio.amountOfMoney + portofolio.numberOfShares * lastTimeValue.close).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>`);
        });
    });
    $("#actionRender").html(actionPresenter.render());
    $("#conditionRender").html(binaryConditionPresenter.render());
});