import * as $ from "jquery";
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
    let tradeData: Array<StockHistoryItem>;
    const strategies: Array<Strategy> = new Array<Strategy>();
    strategies.push(new Strategy());
    $("#ticker").on("change", function() {
        let ticker: string = $("#ticker").val().toString();
        $("#startDate").prop("disabled", true);
        $("#startingAmount").prop("disabled", true);
        $("#action").prop("disabled", true);
        $("#numberOfShares").prop("disabled", true);
        $("#condition").prop("disabled", true);
        $("#addStrategyBranch").prop("disabled", true);
        $("#newStrategy").prop("disabled", true);
        $.getJSON(`.\\alphavantage\\${ticker}.json`, (data) => {
            tradeData = StockHistoryItem.loadFromAlphavantage(data);
            tradeData.sort((a, b) => a.date.getTime() - b.date.getTime());
            $("#startDate").val(tradeData[0].date.toISOString().split('T')[0]);
            $("#startDate").prop("disabled", false);
            $("#startingAmount").prop("disabled", false);
            $("#action").prop("disabled", false);
            $("#numberOfShares").prop("disabled", false);
            $("#condition").prop("disabled", false);
            $("#addStrategyBranch").prop("disabled", false);
            $("#newStrategy").prop("disabled", false);
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
        $("#run").prop("disabled", false);
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
        $("#globalStrategies").html(strategiesDescription);
    });
    $("#run").on("click", function() {
        let startingAmount: number = Number($("#startingAmount").val());
        let startDate: Date = new Date($("#startDate").val().toString());
        $("#globalStrategies").empty();
        strategies.forEach((strategy:Strategy) => {
            $("#globalStrategies").append(`<p>${strategy.toString()}</p><br/>`);
            let portofolio: Portofolio = new Portofolio(startingAmount, 0);
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
    const urlParams = new URLSearchParams(window.location.search);
    const tickerParam = urlParams.get('ticker');
    if(tickerParam) {
        $("#ticker").val(tickerParam);
        $("#ticker").trigger("change");
    }
});