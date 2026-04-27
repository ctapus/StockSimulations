import TradeHistoryItem from "./entities/TradeHistoryItem";
import Portofolio from "./entities/Portofolio";
import StockHistoryItem from "./entities/StockHistoryItem";
import Strategy from "./entities/Strategy";
import StockAndTradeHistoryItem from "./entities/StockAndTradeHistoryItem";
import StockHistoryItemsPresenterTable from "./Presenters/StockHistoryItemsPresenterTable";
import StockHistoryItemsPresenterGraph from "./Presenters/StockHistoryItemsPresenterGraph";
import BinaryConditionPresenter from "./Presenters/BinaryConditionPresenter";
import ActionPresenter from "./Presenters/ActionPresenter";
import * as d3 from "d3";

interface TimeSelector {
    (tradeDate: StockHistoryItem, startDate: Date): boolean;
}
const startingDateSelector : TimeSelector = (tradeDate: StockHistoryItem, startDate: Date): boolean => { return tradeDate.date >= startDate; };

const binaryConditionPresenter: BinaryConditionPresenter = new BinaryConditionPresenter("binaryCondition");
const actionPresenter: ActionPresenter = new ActionPresenter("action");

const   margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom;

document.addEventListener("DOMContentLoaded", () => {
    /*$(document)
    .ajaxStart(function () {
        $('#overlay').fadeIn();
    })
    .ajaxStop(function () {
        $('#overlay').fadeOut();
    });*/
    let tradeData: Array<StockAndTradeHistoryItem>;
    const strategy: Strategy = new Strategy();
    document.getElementById("ticker").addEventListener("change", () => {
        const ticker: string = $("#ticker").val().toString();
        document.getElementById("startDate").setAttribute("disabled", "disabled")
        document.getElementById("startingAmount").setAttribute("disabled", "disabled")
        fetch(`.\\alphavantage\\${ticker}.json`)
            .then(res => res.json())
            .then(data => {
                tradeData = StockHistoryItem.loadFromAlphavantage(data).map(x => x as StockAndTradeHistoryItem);
                $("#startDate").val(tradeData[0].date.toISOString().split('T')[0]);
                StockHistoryItemsPresenterTable.printHistoricData(document.getElementById("menu2"), tradeData);
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
                document.getElementById("startDate").removeAttribute("disabled");
                document.getElementById("startingAmount").removeAttribute("disabled");
            })
            .catch(error => {
                console.log(error.message);
            });
    });
    document.getElementById("addStrategyBranch").addEventListener("click", function() {
        /*$("#run").prop("disabled", false);
        let action: string = $("#action option:selected").val().toString();
        let numberOfSharesOrPercentage: number = Number($("#numberOfSharesOrPercentage").val());
        let condition: string = $("#condition option:selected").val().toString();
        let thresholdValue: number = Number($("#thresholdValue").val());
        const strategyBranch: StrategyBranch = new StrategyBranch(
                                                    new TradeCondition(tradeConditionTemplates[condition], thresholdValue), new TradeAction(tradeActionTemplates[action], numberOfSharesOrPercentage),
                                                    tradeConditionTemplates[condition].instanceDescription, tradeActionTemplates[action].instanceDescription);
        strategy.strategyBranches.push(strategyBranch);
        $("#globalStrategy").html(`<p>${strategy.toString()}</p>`);*/
    });
    document.getElementById("run").addEventListener("click", function() {
        const startingAmount = Number((<HTMLInputElement>document.getElementById("startingAmount")).value);
        const startDate: Date = new Date((<HTMLInputElement>document.getElementById("startDate")).value);
        const portofolio: Portofolio = new Portofolio(startingAmount, 0, startDate, tradeData);
        strategy.run(tradeData.filter((item) => { return startingDateSelector(item, startDate); }), portofolio);
        let transactionNo = 1;
        portofolio.history.forEach((item: TradeHistoryItem) => {
            const styleColor: string = item.action === 'BUY' ? "blue" : "red";
            document.getElementById('results > tbody').append(`
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
        document.getElementById('summary > tbody').append(`
            <tr>
                <td>${portofolio.history.length}</td>
                <td>${lastTimeValue.date.toISOString()}</td>
                <td>${portofolio.numberOfShares}</td>
                <td>${lastTimeValue.close}</td>
                <td>${portofolio.amountOfMoney.toFixed(2)}</td>
                <td>${(portofolio.amountOfMoney + portofolio.numberOfShares * lastTimeValue.close).toFixed(2)}</td>
            </tr>`);
    });
    document.getElementById("actionRender").innerHTML = actionPresenter.render();
    document.getElementById("conditionRender").innerHTML = binaryConditionPresenter.render();
});