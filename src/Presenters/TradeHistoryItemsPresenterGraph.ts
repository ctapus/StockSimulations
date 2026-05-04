import StockHistoryItem from "../entities/StockHistoryItem";
import Portofolio from "../entities/Portofolio"
import TradeHistoryItem from "../entities/TradeHistoryItem"
import * as d3 from "d3";
import * as bootstrap from "bootstrap";

export default class TradeHistoryItemsPresenterGraph {
    private tradeData: Array<StockHistoryItem>;
    private portofolio: Portofolio;
    private margin: any;
    private readonly width: number;
    private readonly height: number;
    private readonly xScale: d3.ScaleTime<number, number, never>;
    private readonly yScale: d3.ScaleLinear<number, number, never>;
    private readonly svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    public constructor(svgContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, tradeData: Array<StockHistoryItem>, portofolio: Portofolio, margin: { top: any; right: any; bottom: any; left: any; }) {
        this.svg = svgContainer;
        this.tradeData = tradeData;
        this.portofolio = portofolio;
        this.margin = margin;
        this.width = window.innerWidth - margin.left - margin.right;
        this.height = window.innerHeight - margin.top - margin.bottom;
        this.xScale = d3.scaleTime().domain(d3.extent<StockHistoryItem, Date>(tradeData, d => { return d.date; })).range([0, this.width]);
        this.yScale = d3.scaleLinear().domain([0, d3.max<StockHistoryItem, number>(tradeData, d => { return d.open; })]).range([this.height, 0]);
        this.svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    }
    public drawTransactionsGraph(): void {
        const xScale = d3.scaleTime().domain(d3.extent<StockHistoryItem, Date>(this.tradeData, d => { return d.date; })).range([0, this.width]);
        const yScale = d3.scaleLinear().domain([0, d3.max<StockHistoryItem, number>(this.tradeData, d => { return d.open; })]).range([this.height, 0]);
        this.svg.selectAll("circle")
            .data<TradeHistoryItem>(this.portofolio.history)
            .enter()
            .append("circle")
            .attr("cx", d => { return xScale(d.date); })
            .attr("cy", d => { return yScale(d.sharePrice); })
            .attr("r", 2)
            .attr("style", d => { return d.action === "BUY" ? "stroke:blue; stroke-width:1; fill: blue;" : "stroke:red; stroke-width:1; fill: red;"; })
            .attr("data-bs-toggle", "tooltip")
            .attr("data-bs-placement", "auto")
            .attr("data-bs-html", "true")
            .attr("title", d => `On ${d.date.toISOString().split('T')[0]}<br /> ${d.action} ${d.numberOfShares} shares at ${d.sharePrice}`);
        [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(x => { return new bootstrap.Tooltip(x); })
    }
}