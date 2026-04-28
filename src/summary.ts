import Portofolio from "./entities/Portofolio";
import StockHistoryItem from "./entities/StockHistoryItem";
import Strategy from "./entities/Strategy";
import StockAndTradeHistoryItem from "./entities/StockAndTradeHistoryItem";
import StockHistoryItemsPresenterTable from "./Presenters/StockHistoryItemsPresenterTable";
import StockHistoryItemsPresenterGraph from "./Presenters/StockHistoryItemsPresenterGraph";
import BinaryConditionPresenter from "./Presenters/BinaryConditionPresenter";
import ActionPresenter from "./Presenters/ActionPresenter";
import BinaryCondition from "./entities/BinaryCondition";
import Action from "./entities/Action";
import StrategyBranch from "./entities/StrategyBranch";
import CompositeCondition from "./entities/CompositeCondition";
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

document.addEventListener("DOMContentLoaded", () => {
    fetch(`.\\tickersList.json`)
        .then(res => res.json())
        .then(data => {
            Array.prototype.forEach.call(data['tickers'], (currentValue, index, arr) => {
                document.getElementById('ticker').append(new Option(data['tickers'][index].name, data['tickers'][index].symbol));
            });
        })
        .catch(error => {
            console.log(error.message);
        });
    /*$(document)
    .ajaxStart(function () {
        $('#overlay').fadeIn();
    })
    .ajaxStop(function () {
        $('#overlay').fadeOut();
    });*/
    let tradeData: Array<StockAndTradeHistoryItem>;
    const strategies: Array<Strategy> = new Array<Strategy>();
    let strategy: Strategy = new Strategy();
    document.getElementById("ticker").addEventListener("change", () => {
        let ticker: string = (<HTMLInputElement>document.getElementById("ticker")).value;
        document.getElementById("startDate").setAttribute("disabled", "disabled");
        document.getElementById("startingAmount").setAttribute("disabled", "disabled");
        fetch(`.\\alphavantage\\${ticker}.json`)
            .then(res => res.json())
            .then(data => {
                tradeData = StockHistoryItem.loadFromAlphavantage(data).map(x => x as StockAndTradeHistoryItem);
                (<HTMLInputElement>document.getElementById("startDate")).value = tradeData[0].date.toISOString().split('T')[0];
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
        const binaryCondition: BinaryCondition = binaryConditionPresenter.read();
        const action: Action = actionPresenter.read();
        const strategyBranch: StrategyBranch = new StrategyBranch(action, new CompositeCondition(binaryCondition));
        strategy.strategyBranches.push(strategyBranch);
        document.getElementById("globalStrategy").innerHTML = `<p>${strategy.toString()}</p>`;
        // REFACTORING
        document.getElementById("actionRender").innerHTML = actionPresenter.render();
        document.getElementById("conditionRender").innerHTML = binaryConditionPresenter.render();
    });
    document.getElementById("addStrategy").addEventListener("click", function() {
        if(null == strategy.strategyBranches) {
            return;
        }
        strategies.push(strategy);
        const p: HTMLParagraphElement = document.createElement("p");
        p.innerHTML = strategy.toString();
        document.getElementById("globalStrategies").append(p);
        document.getElementById("globalStrategies").append(document.createElement("hr"));
        strategy = new Strategy();
        document.getElementById("globalStrategy").innerHTML = "";
    });
    document.getElementById("run").addEventListener("click", function() {
        const startingAmount = Number((<HTMLInputElement>document.getElementById("startingAmount")).value);
        const startDate: Date = new Date((<HTMLInputElement>document.getElementById("startDate")).value.toString());
        document.getElementById("globalStrategies").innerHTML = "";
        strategies.forEach((strategy:Strategy) => {
            document.getElementById("globalStrategies").append(`<p>${strategy.toString()}</p><br/>`);
            const portofolio: Portofolio = new Portofolio(startingAmount, 0, startDate, tradeData);
            strategy.run(tradeData.filter((item) => { return startingDateSelector(item, startDate); }), portofolio);
            const firstTimeValue: StockHistoryItem = tradeData[0];
            const lastTimeValue: StockHistoryItem = tradeData[tradeData.length - 1];
            document.getElementById("globalStrategies").append(`
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
    document.getElementById("actionRender").innerHTML = actionPresenter.render();
    document.getElementById("conditionRender").innerHTML = binaryConditionPresenter.render();
});