import * as $ from "jquery";
import TradeHistoryItem from "./TradeHistoryItem";
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
            tradeData = StockHistoryItem.loadFromAlphavantage(data);
            tradeData.sort((a, b) => a.date.getTime() - b.date.getTime());
            $("#startDate").val(tradeData[0].date.toISOString().split('T')[0]);
            tradeData.forEach(item => {
                $('#data > tbody').append(`
                    <tr>
                        <td>${item.date.toISOString().split('T')[0]}</td>
                        <td>${item.open}</td>
                        <td>${item.high}</td>
                        <td>${item.low}</td>
                        <td>${item.close}</td>
                        <td>${item.volume}</td>
                    </tr>`);
                });
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
        let numberOfSharesOrPercentage: number = Number($("#numberOfSharesOrPercentage").val());
        let condition: string = $("#condition option:selected").val().toString();
        let thresholdValue: number = Number($("#thresholdValue").val());
        const strategyBranch: StrategyBranch = new StrategyBranch(
                                                    new TradeCondition(tradeConditionTemplates[condition], thresholdValue), new TradeAction(tradeActionTemplates[action], numberOfSharesOrPercentage),
                                                    tradeConditionTemplates[condition].instanceDescription, tradeActionTemplates[action].instanceDescription);
        strategy.strategyBranches.push(strategyBranch);
        $("#globalStrategy").html(`<p>${strategy.toString()}</p>`);
    });
    $("#run").on("click", function() {
        let startingAmount: number = Number($("#startingAmount").val());
        let startDate: Date = new Date($("#startDate").val().toString());
        let portofolio: Portofolio = new Portofolio(startingAmount, 0);
        strategy.run(tradeData.filter((item) => { return startingDateSelector(item, startDate); }), portofolio);
        let transactionNo: number = 1;
        portofolio.history.forEach((item: TradeHistoryItem) => {
            let styleColor: string = item.action === 'BUY' ? "blue" : "red";
            $('#results > tbody').append(`
                <tr style='color:${styleColor}'>
                    <td>${transactionNo}</td>
                    <td>${item.date.toISOString()}</td>
                    <td>${item.action}</td>
                    <td>${item.numberOfShares}</td>
                    <td>${item.sharePrice}</td>
                    <td>${item.availableCash.toFixed(2)}</td>
                    <td>${item.totalNumberOfShares}</td>
                    <td>${(item.availableCash + item.totalNumberOfShares * item.sharePrice).toFixed(2)}</td>
                </tr>`);
              transactionNo++;
        });
        const lastTimeValue: StockHistoryItem = tradeData[tradeData.length - 1];
        $('#summary > tbody').append(`
            <tr>
                <td>${portofolio.history.length}</td>
                <td>${lastTimeValue.date.toISOString()}</td>
                <td>${portofolio.numberOfShares}</td>
                <td>${lastTimeValue.close}</td>
                <td>${portofolio.amountOfMoney.toFixed(2)}</td>
                <td>${(portofolio.amountOfMoney + portofolio.numberOfShares * lastTimeValue.close).toFixed(2)}</td>
            </tr>`);
    });
    const urlParams = new URLSearchParams(window.location.search);
    const tickerParam = urlParams.get('ticker');
    if(tickerParam) {
        $("#ticker").val(tickerParam);
        $("#ticker").trigger("change");
    }
});