import * as $ from "jquery";

class TradeData {
    public date : Date;
    public open: number;
    public high: number;
    public low: number;
    public close: number;
    public volume: number;
}
$(() => {
    let timeValues: Array<TradeData> = new Array<TradeData>();
    let lastOpen: number = 0;
    let startDate: Date;
    $("#ticker").on("change", function() {
        let ticker: string = $("#ticker").val().toString();
        $.getJSON(`.\\alphavantage\\${ticker}.json`, (data) => {
            $('#symbol').text(data["Meta Data"]["2. Symbol"]);
            $.each(data["Time Series (Daily)"], (index, value) =>{
                const tradeData: TradeData = new TradeData();
                tradeData.date = new Date(index.toString());
                tradeData.open = Number(data["Time Series (Daily)"][index]["1. open"]);
                tradeData.high = Number(data["Time Series (Daily)"][index]["2. high"]);
                tradeData.low = Number(data["Time Series (Daily)"][index]["3. low"]);
                tradeData.close = Number(data["Time Series (Daily)"][index]["4. close"]);
                tradeData.volume = Number(data["Time Series (Daily)"][index]["5. volume"]);
                timeValues.push(tradeData);
            });
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
        let previousOpen: number = 0;
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
                        switch(condition) {
                            case "DAILY" : 
                                endingNumberOfShares += numberOfShares;
                                endingMoney -= actionPrice;
                                break;
                            case "PREV_LOWER" :
                                if(previousOpen > open) {
                                    endingNumberOfShares += numberOfShares;
                                    endingMoney -= actionPrice;
                                }
                                previousOpen = open;
                                break;
                            case "PREV_LE3%LOWER" :
                                if(previousOpen >= open * 1.03) {
                                    endingNumberOfShares += numberOfShares;
                                    endingMoney -= actionPrice;
                                }
                                previousOpen = open;
                                break;
                            case "PREV_HIGHER" :
                                if(previousOpen < open) {
                                    endingNumberOfShares += numberOfShares;
                                    endingMoney -= actionPrice;
                                }
                                previousOpen = open;
                                break;
                            case "PREV_GE3%HIGHER" :
                                if(previousOpen <= open * 1.03) {
                                    endingNumberOfShares += numberOfShares;
                                    endingMoney -= actionPrice;
                                }
                                previousOpen = open;
                                break;
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