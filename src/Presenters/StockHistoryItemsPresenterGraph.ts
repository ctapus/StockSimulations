import StockHistoryItem from "../entities/StockHistoryItem";
import * as d3 from "d3";

export default class StockHistoryItemsPresenterGraph {
    private svgContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    private tradeData: Array<StockHistoryItem>;
    private margin: any;
    private readonly width: number;
    private readonly height: number;
    private readonly xScale: d3.ScaleTime<number, number, never>;
    private readonly yScale: d3.ScaleLinear<number, number, never>;
    private readonly svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    private readonly openDayColor: string = "steelblue";
    private readonly sma50DaysColor: string = "chocolate";
    private readonly sma100DaysColor: string = "brown";
    private readonly sma200DaysColor: string = "maroon";
    private readonly ema50DaysColor: string = "darkgreen";
    private readonly ema100DaysColor: string = "forestgreen";
    private readonly ema200DaysColor: string = "lightgreen";
    private readonly rsi14DaysColor: string = "mediumpurple";
    private readonly derivativeFirst: string = "mediumslateblue";
    private readonly derivativeSecond: string = "mediumturquoise";
    private readonly derivativeThird: string = "midnightblue";
    public constructor(svgContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, tradeData: Array<StockHistoryItem>, margin) {
        this.svgContainer = svgContainer;
        this.tradeData = tradeData;
        this.margin = margin;
        this.width = window.innerWidth - margin.left - margin.right;
        this.height = window.innerHeight - margin.top - margin.bottom;
        this.xScale = d3.scaleTime().domain(d3.extent<StockHistoryItem, Date>(tradeData, d => { return d.date; })).range([0, this.width]);
        this.yScale = d3.scaleLinear().domain([0, d3.max<StockHistoryItem, number>(tradeData, d => { return d.open; })]).range([this.height, 0]);
        this.svg = this.svgContainer.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    }
    public drawDayOpenGraph(): void {
        this.svg.append("g").attr("id", "xAxis").attr("transform", `translate(0, ${this.height})`).call(d3.axisBottom(this.xScale));
        this.svg.append("g").attr("id", "yAxis").attr("transform", `translate(${this.width}, 0)`).call(d3.axisRight(this.yScale));
        const line = d3.line<StockHistoryItem>().x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.open); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "dayOpen")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.openDayColor)
            .attr("stroke-width", "1.5")
            .attr("d", line);
    }
    public draw50DaysSMAGraph(): void {
        const line = d3.line<StockHistoryItem>().defined(d => null !== d.sma50DaysOpen).x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.sma50DaysOpen); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "sma50Days")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.sma50DaysColor)
            .attr("stroke-width", "1.5")
            .attr("d", line)
            .attr("id","sma50Days");
    }
    public draw100DaysSMAGraph(): void {
        const line = d3.line<StockHistoryItem>().defined(d => null !== d.sma100DaysOpen).x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.sma100DaysOpen); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "sma100Days")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.sma100DaysColor)
            .attr("stroke-width", "1.5")
            .attr("d", line)
            .attr("id","sma100Days");
    }
    public draw200DaysSMAGraph(): void {
        const line = d3.line<StockHistoryItem>().defined(d => null !== d.sma200DaysOpen).x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.sma200DaysOpen); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "sma200Days")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.sma200DaysColor)
            .attr("stroke-width", "1.5")
            .attr("d", line)
            .attr("id","sma200Days");
    }
    public draw50DaysEMAGraph(): void {
        const line = d3.line<StockHistoryItem>().defined(d => null !== d.ema50DaysOpen).x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.ema50DaysOpen); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "ema50Days")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.ema50DaysColor)
            .attr("stroke-width", "1.5")
            .attr("d", line)
            .attr("id","ema50Days");
    }
    public draw100DaysEMAGraph(): void {
        const line = d3.line<StockHistoryItem>().defined(d => null !== d.ema100DaysOpen).x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.ema100DaysOpen); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "ema100Days")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.ema100DaysColor)
            .attr("stroke-width", "1.5")
            .attr("d", line)
            .attr("id","ema100Days");
    }
    public draw200DaysEMAGraph(): void {
        const line = d3.line<StockHistoryItem>().defined(d => null !== d.ema200DaysOpen).x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.ema200DaysOpen); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "ema200Days")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.ema200DaysColor)
            .attr("stroke-width", "1.5")
            .attr("d", line)
            .attr("id","ema200Days");
    }
    public draw14DaysRSIGraph(): void {
        const line = d3.line<StockHistoryItem>().defined(d => null !== d.rsi14DaysOpen).x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.rsi14DaysOpen); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "rsi14Days")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.rsi14DaysColor)
            .attr("stroke-width", "1.5")
            .attr("d", line)
            .attr("id","rsi14Days");
    }
    public drawLegend() {
        const g: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = this.svgContainer.append("g");
        const legendOffsetX: number = 50;
        const legendOffsetY: number = 50;
        const squareLength: number = 20;
        const dict =   [["Day open",                        this.openDayColor,      "dayOpen"],
                        ["50 simple moving average",        this.sma50DaysColor,    "sma50Days"],
                        ["100 simple moving average",       this.sma100DaysColor,   "sma100Days"],
                        ["200 simple moving average",       this.sma200DaysColor,   "sma200Days"],
                        ["50 exponential moving average",   this.ema50DaysColor,    "ema50Days"],
                        ["100 exponential moving average",  this.ema100DaysColor,   "ema100Days"],
                        ["200 exponential moving average",  this.ema200DaysColor,   "ema200Days"],
                        ["14 relative strength index",      this.rsi14DaysColor,    "rsi14Days"]]; // TODO: type this!
        const legendBgColor: string = "lightsteelblue";
        g.append("rect").attr("x", legendOffsetX).attr("y", legendOffsetY)
                        .attr("width", 270).attr("height", dict.length * (squareLength + 10) + 20)
                        .style("fill", legendBgColor).style("stroke", legendBgColor).style("stroke-width", 2);
        for(var i: number=0; i<dict.length; i++) {
            const lineId: string = `#${dict[i][2]}`;
            const color: string = dict[i][1];
            g.append("rect").attr("x", legendOffsetX + 10).attr("y", legendOffsetY + i * (squareLength + 10) + 10)
                            .attr("width", squareLength).attr("height", squareLength)
                            .style("fill", color).style("stroke", color).style("stroke-width", 2)
                            .attr("id", `icon${dict[i][2]}`)
            .on("click", (sender) => {
                const d3Sender: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select(`#${sender.currentTarget.id}`);
                const opacity: number = Number(d3.select(lineId).style("opacity"));
                if(0 === opacity) {
                    d3.select(lineId).style("opacity", 1);
                    d3Sender.style("fill", color);
                }
                else {
                    d3.select(lineId).style("opacity", 0);
                    d3Sender.style("fill", legendBgColor);
                }
            });
            g.append("text").attr("x", legendOffsetX + squareLength + 10 + 10).attr("y", legendOffsetY + i * (squareLength + 10) + 10 + 10)
                            .style("fill", "black").text(dict[i][0]).attr("text-anchor", "left").style("alignment-baseline", "middle");
        }
    }
    public drawDerivativeFirstGraph(): void {
        const line = d3.line<StockHistoryItem>().defined(d => null !== d.derivativeFirst).x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.derivativeFirst); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "derivativeFirst")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.derivativeFirst)
            .attr("stroke-width", "1.5")
            .attr("d", line)
            .attr("id","derivativeFirst");
    }
    public drawDerivativeSecondGraph(): void {
        const line = d3.line<StockHistoryItem>().defined(d => null !== d.derivativeSecond).x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.derivativeSecond); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "derivativeSecond")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.derivativeSecond)
            .attr("stroke-width", "1.5")
            .attr("d", line)
            .attr("id","derivativeSecond");
    }
    public drawDerivativeThirdGraph(): void {
        const line = d3.line<StockHistoryItem>().defined(d => null !== d.derivativeThird).x(d => { return this.xScale(d.date); }).y(d => { return this.yScale(d.derivativeThird); }).curve(d3.curveBasis);
        this.svg.append("path")
            .attr("id", "derivativeThird")
            .data<StockHistoryItem[]>([this.tradeData])
            .style("fill", "none")
            .attr("stroke", this.derivativeThird)
            .attr("stroke-width", "1.5")
            .attr("d", line)
            .attr("id","derivativeThird");
    }
}