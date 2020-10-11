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
    constructor(action: string, date: Date, numberOfShares: number, sharePrice: number) {
        this.action = action;
        this.date = date;
        this.numberOfShares = numberOfShares;
        this.sharePrice = sharePrice;
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
    (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): boolean;
}
const actionsMap: { [id: string]: MappableAction } = {
    "BUY":                  (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): boolean => {
                                let actionPrice: number = tradeData.open * numberOfShares;
                                if(portofolio.amountOfMoney < actionPrice) {
                                    return false;
                                }
                                portofolio.numberOfShares += numberOfShares;
                                portofolio.amountOfMoney -= actionPrice;
                                portofolio.history.push(new HistoryItem("BUY", tradeData.date, numberOfShares, tradeData.open));
                            },
    "SELL":                 (tradeData: TradeData, portofolio: Portofolio, numberOfShares: number): boolean => {
                                if(portofolio.numberOfShares < numberOfShares) {
                                    return false;
                                }
                                let actionPrice: number = tradeData.open * numberOfShares;
                                portofolio.numberOfShares -= numberOfShares;
                                portofolio.amountOfMoney += actionPrice;
                                portofolio.history.push(new HistoryItem("SELL", tradeData.date, numberOfShares, tradeData.open));
                            }
}
interface Action {
    (tradeData: TradeData, portofolio: Portofolio): boolean;
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
        });
    });
    $("#addStrategy").on("click", function() {
        $("#run").prop("disabled", false);
        let actionText: string = $("#action option:selected").text();
        let action: string = $("#action option:selected").val().toString();
        let numberOfShares: number = Number($("#numberOfShares").val());
        let conditionText: string = $("#condition option:selected").text();
        let condition: string = $("#condition option:selected").val().toString();
        strategies.push(new Strategy(conditionSelectorsMap[condition], (tradeData: TradeData, portofolio: Portofolio): boolean => { return actionsMap[action](tradeData, portofolio, numberOfShares) }));
        $("#globalStrategy").append(`<p>${actionText} ${numberOfShares} shares ${conditionText}</p>`);
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
        portofolio.history.forEach((item: HistoryItem) => {
            $("#results").append(`On ${item.date.toLocaleDateString()} ${item.action} ${item.numberOfShares} shares for ${item.sharePrice} each.<br />`);
        });
    });
});