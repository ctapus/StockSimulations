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
interface Selector {
    (tradeDate: TradeData): boolean;
}
const strategyMap: { [id: string]: Selector } = {
    "DAILY":                (tradeDate: TradeData): boolean => { return true; },
    "CUR_LOWER_PREV":       (tradeDate: TradeData): boolean => { return tradeDate.open < tradeDate.previousDay?.open; },
    "CUR_3%LOWER_PREV":     (tradeDate: TradeData): boolean => { return 0.97 * tradeDate.open < tradeDate.previousDay?.open },
    "CUR_HIGHER_PREV":      (tradeDate: TradeData): boolean => { return tradeDate.open > tradeDate.previousDay?.open; },
    "CUR_3%HIGHER_PREV":    (tradeDate: TradeData): boolean => { return 0.97 * tradeDate.open > tradeDate.previousDay?.open }
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
    let positions: Array<TradeData>;
    let lastOpen: number = 0;
    let startDate: Date;
    $("#ticker").on("change", function() {
        let ticker: string = $("#ticker").val().toString();
        $.getJSON(`.\\alphavantage\\${ticker}.json`, (data) => {
            timeValues = getTimeValues(data);
            timeValues.sort((a, b) => a.date.getTime() - b.date.getTime());
            startDate = timeValues[0].date;
            lastOpen = timeValues[timeValues.length - 1].open;
            $("#startDate").val(startDate.toISOString().split('T')[0]);
            timeValues.forEach(item => {
                $('#data > tbody').append("<tr><td>" + item.date.toISOString().split('T')[0] + "</td><td>" + item.open + "</td><td>" + item.high +
                    "</td><td>" + item.low +"</td><td>" + item.close +"</td><td>" + item.volume +"</td></tr>");
                });
        }).fail(() => {
            console.log("Error while reading json");
        });
    });
    $("#addStrategy").on("click", function() {
        let startingAmount: number = Number($("#startingAmount").val());
        let actionText: string = $("#action option:selected").text();
        let action: string = $("#action option:selected").val().toString();
        let numberOfShares: number = Number($("#numberOfShares").val());
        let conditionText: string = $("#condition option:selected").text();
        let condition: string = $("#condition option:selected").val().toString();
        let startDate: Date = new Date($("#startDate").val().toString());
        
        let endingNumberOfShares: number = 0;
        let endingMoney: number = startingAmount;
        positions = new Array<TradeData>();
        timeValues.forEach(item => {
            if(item.date < startDate) {
                return false;
            }
            let open: number = item.open;
            switch(action){
                case "BUY" :
                    {
                        let actionPrice: number = open * numberOfShares;
                        if(endingMoney < actionPrice) {
                            return false;
                        }
                        if(strategyMap[condition](item)) {
                            endingNumberOfShares += numberOfShares;
                            endingMoney -= actionPrice;
                            positions.push(item.deepCopy());
                        } else {
                            return false;
                        }
                    }
                case "SELL":
                    break;
            }
        });
        $("#strategies").append(`<p>${actionText} ${numberOfShares} shares ${conditionText}</p>`);
        $("#strategies").append(`<p>${endingNumberOfShares} shares x ${lastOpen.toFixed(2)} $ = ${(endingNumberOfShares * lastOpen).toFixed(2)} $. And ${endingMoney.toFixed(2)} $ left. Total = ${(endingNumberOfShares * lastOpen + endingMoney).toFixed(2)}</p>`);
        $("#strategies").append("<br />");
    });
});