import * as $ from "jquery";
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
    let previousDayTrade: TradeData = null;
    $.each(data["Time Series Crypto (1min)"], (index, value) =>{
        const tradeData: TradeData = new TradeData();
        tradeData.date = new Date(index.toString());
        tradeData.open = Number(data["Time Series Crypto (1min)"][index]["1. open"]);
        tradeData.high = Number(data["Time Series Crypto (1min)"][index]["2. high"]);
        tradeData.low = Number(data["Time Series Crypto (1min)"][index]["3. low"]);
        tradeData.close = Number(data["Time Series Crypto (1min)"][index]["4. close"]);
        tradeData.volume = Number(data["Time Series Crypto (1min)"][index]["5. volume"]);
        tradeData.previousDay = previousDayTrade;
        previousDayTrade = tradeData;
        ret.push(tradeData);
    });
    return ret;
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
    let timeValues: Array<TradeData>;
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
            timeValues = getTimeValues(data);
            timeValues.sort((a, b) => a.date.getTime() - b.date.getTime());
            $("#startDate").val(timeValues[0].date.toISOString().split('T')[0]);
            timeValues.forEach(item => {
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
        const strategyBranch: StrategyBranch = new StrategyBranch(new TradeCondition(tradeConditionTemplates[condition], thresholdValue),
                                                 new TradeAction(tradeActionTemplates[action], numberOfSharesOrPercentage),
                                                 tradeActionTemplates[action].instanceDescription);
        strategy.strategyBranches.push(strategyBranch);
        $("#globalStrategy").html(`<p>${strategy.toString()}</p>`);
    });
    $("#run").on("click", function() {
        let startingAmount: number = Number($("#startingAmount").val());
        let startDate: Date = new Date($("#startDate").val().toString());
        
        let portofolio: Portofolio = new Portofolio(startingAmount, 0);
        timeValues.filter((item) => { return startingDateSelector(item, startDate); }).forEach(item => {
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
        const lastTimeValue: TradeData = timeValues[timeValues.length - 1];
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