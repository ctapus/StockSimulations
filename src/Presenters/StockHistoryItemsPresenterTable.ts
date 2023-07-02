import StockAndTradeHistoryItem from "../entities/StockAndTradeHistoryItem";

export default class StockHistoryItemsPresenterTable {
    public static printHistoricData(container: JQuery, tradeData: Array<StockAndTradeHistoryItem>): void {
        const table: JQuery = $(`
        <table class="table table-striped" style="width: 100%">
            <thead>
                <tr><td style="width: 110px">date</td>
                    <td style="width: 80px; text-align: right;">open</td>
                    <td style="width: 80px; text-align: right;">high</td>
                    <td style="width: 80px; text-align: right;">low</td>
                    <td style="width: 80px; text-align: right;">close</td>
                    <td style="width: 80px; text-align: right;">volume</td>
                    <td style="width: 80px; text-align: right;">52 weeks low</td>
                    <td style="width: 80px; text-align: right;">52 weeks high</td>
                    <td style="width: 80px; text-align: right;">10 days SMA</td>
                    <td style="width: 80px; text-align: right;">20 days SMA</td>
                    <td style="width: 80px; text-align: right;">50 days SMA</td>
                    <td style="width: 80px; text-align: right;">100 days SMA</td>
                    <td style="width: 80px; text-align: right;">200 days SMA</td>
                    <td style="width: 80px; text-align: right;">10 days EMA</td>
                    <td style="width: 80px; text-align: right;">20 days EMA</td>
                    <td style="width: 80px; text-align: right;">50 days EMA</td>
                    <td style="width: 80px; text-align: right;">100 days EMA</td>
                    <td style="width: 80px; text-align: right;">200 days EMA</td>
                    <td style="width: 80px; text-align: right;">14 days average gains/losses</td>
                    <td style="width: 80px; text-align: right;">14 days RSI</td>
                    <td style="width: 80px; text-align: right;">open variation</td>
                    <td style="width: 10px"></td>
                    <td style="width: 80px; text-align: right;">1 day variation</td>
                    <td style="width: 80px; text-align: right;">2 days variation</td>
                    <td style="width: 80px; text-align: right;">3 days variation</td>
                    <td>trade</td>
                </tr>
            </thead>
            <tbody></tbody>
        </table>`);
        tradeData.forEach(item => {
            let variationIcon: string = "";
            if(item.openVariation > 100) {
                variationIcon = "<i style='color: green;' class='fas fa-arrow-up'></i>";
            }
            if(item.openVariation < 100) {
                variationIcon = "<i style='color: red;' class='fas fa-arrow-down'></i>";
            }
            table.children('tbody').append(`
                <tr>
                    <td>${item.date.toISOString().split('T')[0]}</td>
                    <td>${item.open.toFixed(4)}</td>
                    <td>${item.high.toFixed(4)}</td>
                    <td>${item.low.toFixed(4)}</td>
                    <td>${item.close.toFixed(4)}</td>
                    <td>${item.volume}</td>
                    <td>${item.low52Weeks == null ? "" : item.low52Weeks}</td>
                    <td>${item.high52Weeks == null ? "" : item.high52Weeks}</td>
                    <td>${item.sma10Days == null ? "" : item.sma10Days.toFixed(4)}</td>
                    <td>${item.sma20Days == null ? "" : item.sma20Days.toFixed(4)}</td>
                    <td>${item.sma50Days == null ? "" : item.sma50Days.toFixed(4)}</td>
                    <td>${item.sma100Days == null ? "" : item.sma100Days.toFixed(4)}</td>
                    <td>${item.sma200Days == null ? "" : item.sma200Days.toFixed(4)}</td>
                    <td>${item.ema10Days == null ? "" : item.ema10Days.toFixed(4)}</td>
                    <td>${item.ema20Days == null ? "" : item.ema20Days.toFixed(4)}</td>
                    <td>${item.ema50Days == null ? "" : item.ema50Days.toFixed(4)}</td>
                    <td>${item.ema100Days == null ? "" : item.ema100Days.toFixed(4)}</td>
                    <td>${item.ema200Days == null ? "" : item.ema200Days.toFixed(4)}</td>
                    <td>
                        ${item.averageGains14Days == null || item.averageGains14Days == undefined || item.averageGains14Days == 0 ? "" : "+" + item.averageGains14Days.toFixed(4)}
                        ${item.averageLosses14Days == null || item.averageLosses14Days == undefined || item.averageLosses14Days == 0 ? "" : "-" + item.averageLosses14Days.toFixed(4)}
                    </td>
                    <td>${item.rsi14Days == null ? "" : item.rsi14Days.toFixed(4)}</td>
                    <td>${item.openVariation ? item.openVariation.toFixed(4) + "%" : ""}</td>
                    <td>${variationIcon}</td>
                    <td>${item.oneDayVariation ? item.oneDayVariation.toFixed(4) + "%" : ""}</td>
                    <td>${item.twoDaysVariation ? item.twoDaysVariation.toFixed(4) + "%" : ""}</td>
                    <td>${item.threeDaysVariation ? item.threeDaysVariation.toFixed(4) + "%" : ""}</td>
                    <td style="text-align: left;">${item.trade ? item.trade : ""}</td>
                </tr>`);
            });
            container.append(table);
    }
}