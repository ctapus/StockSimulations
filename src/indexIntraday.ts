import * as $ from "jquery";
import HistoryItem from "./HistoryItem";
import Portofolio from "./Portofolio";
import TradeData from "./TradeData";
import TradeCondition from './TradeCondition';
import TradeConditionTemplate from './TradeConditionTemplate';
import TradeActionTemplate from './TradeActionTemplate';
import TradeAction from './TradeAction';
import StrategyBranch from "./StrategyBranch";
import Strategy from "./Strategy";

const tradeConditionTemplates: { [id: string]: TradeConditionTemplate } = {
    "DAILY":                new TradeConditionTemplate("DAILY", "every heartbeat",
                                    (tradeData: TradeData, thresholdValue: number): boolean => { return true; }),
    "CUR_LOWER_PREV":       new TradeConditionTemplate("CUR_LOWER_PREV", "if current heartbeat opens lower than previous heartbeat",
                                    (tradeData: TradeData, thresholdValue: number): boolean => { return tradeData.open < tradeData.previousDay?.open; }),
    "CUR_X%LOWER_PREV":     new TradeConditionTemplate("CUR_X%LOWER_PREV", "if current heartbeat opens lower than previous heartbeat with at least",
                                    (tradeData: TradeData, thresholdValue: number): boolean => { return (100 - thresholdValue) / 100 * tradeData.open < tradeData.previousDay?.open }),
    "CUR_HIGHER_PREV":      new TradeConditionTemplate("CUR_HIGHER_PREV", "if current heartbeat open higher than previous heartbeat",
                                    (tradeData: TradeData, thresholdValue: number): boolean => { return tradeData.open > tradeData.previousDay?.open; }),
    "CUR_X%HIGHER_PREV":    new TradeConditionTemplate("CUR_X%HIGHER_PREV", "if current heartbeat opens higher than previous heartbeat with at least",
                                    (tradeData: TradeData, thresholdValue: number): boolean => { return (100 - thresholdValue) / 100 * tradeData.open > tradeData.previousDay?.open })
}
const tradeActionTemplates: { [id: string]: TradeActionTemplate } = {
    "BUY":                  new TradeActionTemplate("BUY", "Buy",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                    let sharePrice: number = tradeData.open * numberOfShares;
                                    if(portofolio.amountOfMoney < sharePrice) {
                                        return;
                                    }
                                    portofolio.numberOfShares += numberOfShares;
                                    portofolio.amountOfMoney -= sharePrice;
                                    portofolio.history.push(new HistoryItem("BUY", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                }),
    "BUY_ALL":              new TradeActionTemplate("BUY_ALL", "Buy all",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                    if(portofolio.amountOfMoney < tradeData.open) {
                                        return;
                                    }
                                    numberOfShares = Math.floor(portofolio.amountOfMoney / tradeData.open);
                                    portofolio.numberOfShares += numberOfShares;
                                    portofolio.amountOfMoney -= tradeData.open * numberOfShares;
                                    portofolio.history.push(new HistoryItem("BUY", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                }),
    "SELL":                 new TradeActionTemplate("SELL", "Sell",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                    if(portofolio.numberOfShares < numberOfShares) {
                                        return;
                                    }
                                    let sharePrice: number = tradeData.open * numberOfShares;
                                    portofolio.numberOfShares -= numberOfShares;
                                    portofolio.amountOfMoney += sharePrice;
                                    portofolio.history.push(new HistoryItem("SELL", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                }),
    "SELL_ALL":             new TradeActionTemplate("SELL_ALL", "Sell all",
                                (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                    if(portofolio.numberOfShares === 0) {
                                        return;
                                    }
                                    portofolio.amountOfMoney += tradeData.open * portofolio.numberOfShares;
                                    portofolio.numberOfShares = 0;
                                    portofolio.history.push(new HistoryItem("SELL", tradeData.date, portofolio.numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                                })
}


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
        timeValues.filter((item) => { return startingDateSelector(item, startDate); }).forEach(item => {
            strategy.strategyBranches.forEach((strategyBranch: StrategyBranch) => {
                if(strategyBranch.tradeCondition.condition(item)) {
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