import Action, { ActionType, ActionTypes } from "./Action";
import { ComparisonOperatorType, ComparisonOperatorTypes } from "./ComparisonOperator";
import { IndicatorType, IndicatorTypes } from "./Indicator";

export enum StrategyTokenType { Action, When, Plus, Minus, Asterisk, Slash, Number, Indicator, LParen, RParen, Percentage, ComparisonOperator, End, Unknown }

export class StrategyToken {
    public type: StrategyTokenType;
    public value: number;
    public indicator: IndicatorType;
    public actionType: ActionType;
    public comparisonOperator: ComparisonOperatorType;
    constructor(type: StrategyTokenType, value?: number, indicator?: IndicatorType, action?: ActionType, comparisonOperator?: ComparisonOperatorType) {
        this.type = type;
        this.value = value;
        this.indicator = indicator;
        this.actionType = action;
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
        for(let x of ComparisonOperatorTypes.AllComparisonOperatorTypes) {
            if(x.classDescription.toUpperCase() === input.toUpperCase()) { return new StrategyToken(StrategyTokenType.ComparisonOperator, null, null, null, x); }
        }
        for(let x of IndicatorTypes.AllIndicatorTypes) {
            if(x.code.toUpperCase() === input.toUpperCase()) { return new StrategyToken(StrategyTokenType.Indicator, null, x, null, null); }
        }
        if(/\(/.test(input)) { return new StrategyToken(StrategyTokenType.LParen); }
        if(/\)/.test(input)) { return new StrategyToken(StrategyTokenType.RParen); }
        if(/%/.test(input)) { return new StrategyToken(StrategyTokenType.Percentage); }
        if(/BUY/i.test(input)) { return new StrategyToken(StrategyTokenType.Action, null, null, ActionTypes.BUY); }
        if(/BUY_PERCENTAGE/i.test(input)) { return new StrategyToken(StrategyTokenType.Action, null, null, ActionTypes.BUY_PERCENTAGE); }
        if(/SELL/i.test(input)) { return new StrategyToken(StrategyTokenType.Action, null, null, ActionTypes.SELL); }
        if(/SELL_PERCENTAGE/i.test(input)) { return new StrategyToken(StrategyTokenType.Action, null, null, ActionTypes.SELL_PERCENTAGE); }
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
    private actionBranch(): Action { // ACTION number %|
        let actionType: ActionType;
        let param: number;
        let token: StrategyToken = this.lex.getTokenAndAdvance();
        if(token.type === StrategyTokenType.Action) {
            token = this.lex.getTokenAndAdvance();
            actionType = token.actionType;
            if(token.type === StrategyTokenType.Number) {
                token = this.lex.getTokenAndAdvance();
                param = token.value;
                if(token.type === StrategyTokenType.Percentage) {
                    return new Action(actionType, param);// TODO: Investigate removing BUY_PERCENTAGE and SELL_PERCENTAGE or replacing with %
                } else {
                    this.lex.revert();
                    return new Action(actionType, param);
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
    public actionBranch: Action;
    public conditionBranch: ConditionBranch;
}
export class ConditionBranch {

}