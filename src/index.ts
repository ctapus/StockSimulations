import * as $ from "jquery";

class TradeData {
    public date : Date;
    public open: number;
    public high: number;
    public low: number;
    public close: number;
    public volume: number;
    public previousDay: TradeData;
    public deepCopy(): TradeData {
        const ret: TradeData = new TradeData();
        ret.date = this.date;
        ret.open = this.open;
        ret.high = this.high;
        ret.low = this.low;
        ret.close = this.close;
        ret.volume = this.volume;
        return ret;
    }
}
class HistoryItem {
    public action: string;
    public date: Date;
    public numberOfShares: number;
    public sharePrice: number;
    public availableCash: number;
    public totalNumberOfShares: number;
    constructor(action: string, date: Date, numberOfShares: number, sharePrice: number, availableCash: number, totalNumberOfShares: number) {
        this.action = action;
        this.date = date;
        this.numberOfShares = numberOfShares;
        this.sharePrice = sharePrice;
        this.availableCash = availableCash;
        this.totalNumberOfShares = totalNumberOfShares;
    }
}
interface ConditionSelector {
    (tradeData: TradeData): boolean;
}
const conditionSelectorsMap: { [id: string]: ConditionSelector } = {
    "DAILY":                (tradeData: TradeData): boolean => { return true; },
    "CUR_LOWER_PREV":       (tradeData: TradeData): boolean => { return tradeData.open < tradeData.previousDay?.open; },
    "CUR_3%LOWER_PREV":     (tradeData: TradeData): boolean => { return 0.97 * tradeData.open < tradeData.previousDay?.open },
    "CUR_HIGHER_PREV":      (tradeData: TradeData): boolean => { return tradeData.open > tradeData.previousDay?.open; },
    "CUR_3%HIGHER_PREV":    (tradeData: TradeData): boolean => { return 0.97 * tradeData.open > tradeData.previousDay?.open }
}
interface TimeSelector {
    (tradeDate: TradeData, startDate: Date): boolean;
}
const startingDateSelector : TimeSelector = (tradeDate: TradeData, startDate: Date): boolean => { return tradeDate.date >= startDate; };

class Portofolio {
    public amountOfMoney: number;
    public numberOfShares: number;
    public history: Array<HistoryItem>;
    constructor(amountOfMoney: number, numberOfShares: number) {
        this.amountOfMoney = amountOfMoney;
        this.numberOfShares = numberOfShares;
        this.history = new Array<HistoryItem>(); 
    }
}
interface MappableAction {
    (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void;
}
const actionsMap: { [id: string]: MappableAction } = {
    "BUY":                  (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                let sharePrice: number = tradeData.open * numberOfShares;
                                if(portofolio.amountOfMoney < sharePrice) {
                                    return;
                                }
                                portofolio.numberOfShares += numberOfShares;
                                portofolio.amountOfMoney -= sharePrice;
                                portofolio.history.push(new HistoryItem("BUY", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                            },
    "BUY_ALL":              (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                if(portofolio.amountOfMoney < tradeData.open) {
                                    return;
                                }
                                numberOfShares = Math.floor(portofolio.amountOfMoney / tradeData.open);
                                portofolio.numberOfShares += numberOfShares;
                                portofolio.amountOfMoney -= tradeData.open * numberOfShares;
                                portofolio.history.push(new HistoryItem("BUY", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                            },
    "SELL":                 (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                if(portofolio.numberOfShares < numberOfShares) {
                                    return;
                                }
                                let sharePrice: number = tradeData.open * numberOfShares;
                                portofolio.numberOfShares -= numberOfShares;
                                portofolio.amountOfMoney += sharePrice;
                                portofolio.history.push(new HistoryItem("SELL", tradeData.date, numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                            },
    "SELL_ALL":             (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): void => {
                                if(portofolio.numberOfShares === 0) {
                                    return;
                                }
                                portofolio.amountOfMoney += tradeData.open * portofolio.numberOfShares;
                                portofolio.numberOfShares = 0;
                                portofolio.history.push(new HistoryItem("SELL", tradeData.date, portofolio.numberOfShares, tradeData.open, portofolio.amountOfMoney, portofolio.numberOfShares));
                            }
}
interface Action {
    (tradeData: TradeData, portofolio: Portofolio): void;
}

class Strategy {
    public conditionSelector: ConditionSelector;
    public action: Action;
    constructor(conditionSelector: ConditionSelector, action: Action) {
        this.conditionSelector = conditionSelector;
        this.action = action;
    }
}
function getTimeValues(data: any): Array<TradeData> {
    let ret: Array<TradeData> = new Array<TradeData>();
    let previousDayTrade: TradeData = null;
    $.each(data["Time Series (Daily)"], (index, value) =>{
        const tradeData: TradeData = new TradeData();
        tradeData.date = new Date(index.toString());
        tradeData.open = Number(data["Time Series (Daily)"][index]["1. open"]);
        tradeData.high = Number(data["Time Series (Daily)"][index]["2. high"]);
        tradeData.low = Number(data["Time Series (Daily)"][index]["3. low"]);
        tradeData.close = Number(data["Time Series (Daily)"][index]["4. close"]);
        tradeData.volume = Number(data["Time Series (Daily)"][index]["5. volume"]);
        tradeData.previousDay = previousDayTrade;
        previousDayTrade = tradeData;
        ret.push(tradeData);
    });
    return ret;
}
$(() => {
    $(document)
    .ajaxStart(function () {
        $('#overlay').fadeIn();
    })
    .ajaxStop(function () {
        $('#overlay').fadeOut();
    });
    let timeValues: Array<TradeData>;
    const strategies: Array<Strategy> = new Array<Strategy>();
    $("#ticker").on("change", function() {
        let ticker: string = $("#ticker").val().toString();
        $("#startDate").prop("disabled", true);
        $("#startingAmount").prop("disabled", true);
        $("#action").prop("disabled", true);
        $("#numberOfShares").prop("disabled", true);
        $("#condition").prop("disabled", true);
        $("#addStrategy").prop("disabled", true);
        $.getJSON(`.\\alphavantage\\${ticker}.json`, (data) => {
            timeValues = getTimeValues(data);
            timeValues.sort((a, b) => a.date.getTime() - b.date.getTime());
            $("#startDate").val(timeValues[0].date.toISOString().split('T')[0]);
            timeValues.forEach(item => {
                $('#data > tbody').append("<tr><td>" + item.date.toISOString().split('T')[0] + "</td><td>" + item.open + "</td><td>" + item.high +
                    "</td><td>" + item.low +"</td><td>" + item.close +"</td><td>" + item.volume +"</td></tr>");
                });
            $("#startDate").prop("disabled", false);
            $("#startingAmount").prop("disabled", false);
            $("#action").prop("disabled", false);
            $("#numberOfShares").prop("disabled", false);
            $("#condition").prop("disabled", false);
            $("#addStrategy").prop("disabled", false);
        }).fail(() => {
            console.log("Error while reading json");
        }).always(() => {
        });
    });
    $("#addStrategy").on("click", function() {
        $("#run").prop("disabled", false);
        let actionText: string = $("#action option:selected").text();
        let action: string = $("#action option:selected").val().toString();
        let numberOfShares: number = Number($("#numberOfShares").val());
        let conditionText: string = $("#condition option:selected").text();
        let condition: string = $("#condition option:selected").val().toString();
        strategies.push(new Strategy(conditionSelectorsMap[condition], (tradeData: TradeData, portofolio: Portofolio): void => { return actionsMap[action](tradeData, portofolio, numberOfShares) }));
        if(action === "BUY_ALL" || action === "SELL_ALL") {
            $("#globalStrategy").append(`<p>${actionText} shares ${conditionText}</p>`);
        } else {
            $("#globalStrategy").append(`<p>${actionText} ${numberOfShares} shares ${conditionText}</p>`);
        }
    });
    $("#run").on("click", function() {
        let startingAmount: number = Number($("#startingAmount").val());
        let startDate: Date = new Date($("#startDate").val().toString());
        
        let portofolio: Portofolio = new Portofolio(startingAmount, 0);
        timeValues.filter((item) => { return startingDateSelector(item, startDate); }).forEach(item => {
            strategies.forEach((strategy: Strategy) => {
                if(strategy.conditionSelector(item)) {
                    strategy.action(item, portofolio);
                } else {
                    return false;
                }
            });
        });
        let transactionNo: number = 1;
        portofolio.history.forEach((item: HistoryItem) => {
            let styleColor: string = item.action === 'BUY' ? "blue" : "red";
             $('#results > tbody').append("<tr style='color:" + styleColor + "'><td>" + transactionNo + "</td><td>" + item.date.toLocaleDateString() +
              "</td><td>" + item.action + "</td><td>" + item.numberOfShares + "</td><td>" + item.sharePrice +"</td><td>" + item.availableCash.toFixed(2) +
              "</td><td>" + item.totalNumberOfShares + "</td><td>" + (item.availableCash + item.totalNumberOfShares * item.sharePrice).toFixed(2) +"</td></tr>");
              transactionNo++;
        });
        const lastTimeValue: TradeData = timeValues[timeValues.length - 1];
        $('#summary > tbody').append("<tr><td>" + portofolio.history.length + "</td><td>" + lastTimeValue.date.toLocaleDateString() +
         "</td><td>" + portofolio.numberOfShares + "</td><td>" + lastTimeValue.close +"</td><td>" + portofolio.amountOfMoney.toFixed(2) +
         "</td><td>" + portofolio.numberOfShares + "</td><td>" + (portofolio.amountOfMoney + portofolio.numberOfShares * lastTimeValue.close).toFixed(2) +"</td></tr>");
    });
    const urlParams = new URLSearchParams(window.location.search);
    const tickerParam = urlParams.get('ticker');
    if(tickerParam) {
        $("#ticker").val(tickerParam);
        $("#ticker").trigger("change");
    }
});