import { ActionType } from "./Action";
import { IndicatorType } from "./BinaryCondition";

export enum StrategyTokenType { Action, Plus, Minus, Asterisk, Slash, Number, Indicator, LParen, RParen, Percentage,
     Equal, NotEqual, GreaterThanOrEqualTo, LessThanOrEqualTo, GreaterThan, LessThan, Buy, Buy_Perentage, Sell, Sell_Percentage, Space, End, Unknown }

export class StrategyToken {
    public type: StrategyTokenType;
    public value: number;
    public indicator: IndicatorType;
    public action: ActionType;
    constructor(type: StrategyTokenType, value?: number, indicator?: IndicatorType, action?: ActionType) {
        this.type = type;
        this.value = value;
        this.indicator = indicator;
        this.action = action;
    }
}

export class StrategyLexer {
    private tokens: string[];
    private tokenIndex: number;
    constructor(input: string) {
		this.tokens = input.match(/\(|\)|\d+(\.\d+)?|[\+\-\*\/]|[a-zA-Z]+[a-zA-Z0-9_]*|\s*|\%/g);
		this.tokenIndex = 0;
    }
    public getTokenAndAdvance(): StrategyToken {
        if(this.tokens.length === this.tokenIndex) { return new StrategyToken(StrategyTokenType.End); }
        const input: string = this.tokens[this.tokenIndex++];
        return this.getToken(input);
    }
    public revert(): void {
        if(this.tokenIndex <= 0) { throw Error("Index out of range"); }
        this.tokenIndex--;
    }
    private getToken(input: string): StrategyToken {
        if(/\+/.test(input)) { return new StrategyToken(StrategyTokenType.Plus); }
        if(/\-/.test(input)) { return new StrategyToken(StrategyTokenType.Minus); }
        if(/\*/.test(input)) { return new StrategyToken(StrategyTokenType.Asterisk); }
        if(/\\/.test(input)) { return new StrategyToken(StrategyTokenType.Slash); }
        if(/\=/.test(input)) { return new StrategyToken(StrategyTokenType.Equal); }
        if(/\!=/.test(input)) { return new StrategyToken(StrategyTokenType.NotEqual); }
        if(/\</.test(input)) { return new StrategyToken(StrategyTokenType.LessThan); }
        if(/\<=/.test(input)) { return new StrategyToken(StrategyTokenType.LessThanOrEqualTo); }
        if(/\>/.test(input)) { return new StrategyToken(StrategyTokenType.GreaterThan); }
        if(/\>=/.test(input)) { return new StrategyToken(StrategyTokenType.GreaterThanOrEqualTo); }
        if(/\(/.test(input)) { return new StrategyToken(StrategyTokenType.LParen); }
        if(/\)/.test(input)) { return new StrategyToken(StrategyTokenType.RParen); }
        if(/\%/.test(input)) { return new StrategyToken(StrategyTokenType.Percentage); }
        if(/BUY/i.test(input)) { return new StrategyToken(StrategyTokenType.Buy); }
        if(/BUY_PERCENTAGE/i.test(input)) { return new StrategyToken(StrategyTokenType.Buy_Perentage); }
        if(/SELL/i.test(input)) { return new StrategyToken(StrategyTokenType.Sell); }
        if(/SELL_PERCENTAGE/i.test(input)) { return new StrategyToken(StrategyTokenType.Sell_Percentage); }
        if(/\s*/.test(input)) { return new StrategyToken(StrategyTokenType.Space); }
		if (/\d+(\.\d+)?/.test(input)) { return new StrategyToken(StrategyTokenType.Number, parseFloat(input)); }

        return new StrategyToken(StrategyTokenType.Unknown);
    }
}