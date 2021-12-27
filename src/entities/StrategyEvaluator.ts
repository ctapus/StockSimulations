import { ActionType } from "./Action";
import { ComparisonOperatorType, IndicatorType } from "./BinaryCondition";

export enum StrategyTokenType { Action, When, Plus, Minus, Asterisk, Slash, Number, Indicator, LParen, RParen, Percentage, ComparisonOperator, End, Unknown }

export class StrategyToken {
    public type: StrategyTokenType;
    public value: number;
    public indicator: IndicatorType;
    public action: ActionType;
    public comparisonOperator: ComparisonOperatorType;
    constructor(type: StrategyTokenType, value?: number, indicator?: IndicatorType, action?: ActionType, comparisonOperator?: ComparisonOperatorType) {
        this.type = type;
        this.value = value;
        this.indicator = indicator;
        this.action = action;
        this.comparisonOperator = comparisonOperator;
    }
}

export class StrategyLexer {
    private tokens: string[];
    private tokenIndex: number;
    constructor(input: string) {
		this.tokens = input.match(/\(|\)|\d+(\.\d+)?|[\+\-\*\/]|[a-zA-Z]+[a-zA-Z0-9_]*|\s+|%|BUY|SELL|WHEN|!=|=|<|>|<=|>=/g);
		this.tokenIndex = 0;
    }
    public getTokenAndAdvance(): StrategyToken {
        if(this.tokens.length === this.tokenIndex) { return new StrategyToken(StrategyTokenType.End); }
        let input: string;
        do {
            input = this.tokens[this.tokenIndex++];
        } while(/\s+/.test(input));
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
        for(let x in ComparisonOperatorType) {
            const co: ComparisonOperatorType =  ComparisonOperatorType[x] as ComparisonOperatorType;
            if(co.toUpperCase() === input.toUpperCase()) { return new StrategyToken(StrategyTokenType.ComparisonOperator, null, null, null, co); }
        }
        for(let x in IndicatorType) {
            const i: IndicatorType =  IndicatorType[x] as IndicatorType;
            if(x.toUpperCase() === input.toUpperCase()) { return new StrategyToken(StrategyTokenType.Indicator, null, i, null, null); }
        }
        if(/\(/.test(input)) { return new StrategyToken(StrategyTokenType.LParen); }
        if(/\)/.test(input)) { return new StrategyToken(StrategyTokenType.RParen); }
        if(/%/.test(input)) { return new StrategyToken(StrategyTokenType.Percentage); }
        if(/BUY/i.test(input)) { return new StrategyToken(StrategyTokenType.Action, null, null, ActionType.BUY); }
        if(/BUY_PERCENTAGE/i.test(input)) { return new StrategyToken(StrategyTokenType.Action, null, null, ActionType.BUY_PERCENTAGE); }
        if(/SELL/i.test(input)) { return new StrategyToken(StrategyTokenType.Action, null, null, ActionType.SELL); }
        if(/SELL_PERCENTAGE/i.test(input)) { return new StrategyToken(StrategyTokenType.Action, null, null, ActionType.SELL_PERCENTAGE); }
		if (/\d+(\.\d+)?/.test(input)) { return new StrategyToken(StrategyTokenType.Number, parseFloat(input)); }
        if(/WHEN/i.test(input)) { return new StrategyToken(StrategyTokenType.When); }

        return new StrategyToken(StrategyTokenType.Unknown);
    }
}

export class StrategyParser {
    private lex: StrategyLexer;
    public parse(code: string): StrategyTree {
        this.lex = new StrategyLexer(code);
        const expression: StrategyTree = this.expr();
        const token: StrategyToken = this.lex.getTokenAndAdvance();
		if (token.type === StrategyTokenType.End) {
			return expression;
		}
		throw Error("End expected");
    }
    private expr(): StrategyTree {
        let strategyTree: StrategyTree = new StrategyTree();
        strategyTree.actionBranch = this.actionBranch();
        strategyTree.conditionBranch = this.conditionBranch();
        return strategyTree;
    }
    private actionBranch(): ActionBranch { // ACTION number %|
        const ret: ActionBranch = new ActionBranch();
        let token: StrategyToken = this.lex.getTokenAndAdvance();
        if(token.type === StrategyTokenType.Action) {
            token = this.lex.getTokenAndAdvance();
            if(token.type === StrategyTokenType.Number) {
                token = this.lex.getTokenAndAdvance();
                if(token.type === StrategyTokenType.Percentage) {
                    return ret;
                } else {
                    this.lex.revert();
                    return ret;
                }
            }
        }
        throw "Incorect syntax: ActionBrach";
    }
    private conditionBranch(): ConditionBranch {
        throw "";
    }
}

export class StrategyTree {
    public actionBranch: ActionBranch;
    public conditionBranch: ConditionBranch;
}
export class ActionBranch {

}
export class ConditionBranch {

}