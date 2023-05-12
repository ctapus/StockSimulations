/* eslint-disable prefer-const */
import Action, { ActionType, ActionTypes } from "./Action";
import { ArithmeticOperator, ArithmeticOperatorType, ArithmeticOperatorTypes } from "./ArithmeticOperator";
import BinaryCondition from "./BinaryCondition";
import { ComparisonOperator, ComparisonOperatorType, ComparisonOperatorTypes } from "./ComparisonOperator";
import CompositeCondition from "./CompositeCondition";
import { Indicator, IndicatorType, IndicatorTypes } from "./Indicator";
import { LogicalOperator, LogicalOperatorType, LogicalOperatorTypes } from "./LogicalOperator";
import Strategy from "./Strategy";
import StrategyBranch from "./StrategyBranch";
import Term from "./Term";

export enum StrategyTokenType { Action, When, ArithmeticOperator, LogicalOperator, Number, Indicator, LParen, RParen, Percentage, ComparisonOperator, Semicolon, End }

export class StrategyToken {
    public type: StrategyTokenType;
    public value: number;
    public indicator: IndicatorType;
    public actionType: ActionType;
    public comparisonOperator: ComparisonOperatorType;
    public arithmeticOperator: ArithmeticOperatorType;
    public logicalOperator: LogicalOperatorType;
    constructor(type: StrategyTokenType, value?: number, indicator?: IndicatorType, action?: ActionType, comparisonOperator?: ComparisonOperatorType, arithmeticOperator?: ArithmeticOperatorType, logicalOperator?: LogicalOperatorType) {
        this.type = type;
        this.value = value;
        this.indicator = indicator;
        this.actionType = action;
        this.comparisonOperator = comparisonOperator;
        this.arithmeticOperator = arithmeticOperator;
        this.logicalOperator = logicalOperator;
    }
}

export class StrategyLexer {
    private tokens: string[];
    private tokenIndex: number;
    constructor(input: string) {
		this.tokens = input.trim().match(/\(|\)|\d+(\.\d+)?|[\+\-\*\/]|[a-zA-Z]+[a-zA-Z0-9_]*|\s+|%|&&|\|\||BUY|SELL|WHEN|!=|=|<=|>=|<|>|;/g);
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
        if(/\(/.test(input)) { return new StrategyToken(StrategyTokenType.LParen); }
        if(/\)/.test(input)) { return new StrategyToken(StrategyTokenType.RParen); }
        if(/%/.test(input)) { return new StrategyToken(StrategyTokenType.Percentage); }
        if(/WHEN/i.test(input)) { return new StrategyToken(StrategyTokenType.When); }
        for(let x of ComparisonOperatorTypes.AllComparisonOperatorTypes) {
            if(x.classDescription.toUpperCase() === input.toUpperCase()) { return new StrategyToken(StrategyTokenType.ComparisonOperator, null, null, null, x, null, null); }
        }
        for(let x of ArithmeticOperatorTypes.AllArithmeticOperatorTypes) {
            if(x.classDescription.toUpperCase() === input.toUpperCase()) { return new StrategyToken(StrategyTokenType.ArithmeticOperator, null, null, null, null, x, null); }
        }
        for(let x of LogicalOperatorTypes.AllLogicalOperatorTypes) {
            if(x.classDescription.toUpperCase() === input.toUpperCase()) { return new StrategyToken(StrategyTokenType.LogicalOperator, null, null, null, null, null, x); }
        }
        for(let x of IndicatorTypes.AllIndicatorTypes) {
            if(x.code.toUpperCase() === input.toUpperCase()) { return new StrategyToken(StrategyTokenType.Indicator, null, x, null, null, null, null); }
        }
        for(let x of ActionTypes.AllActionTypes) {
            if(x.code.toUpperCase() === input.toUpperCase()) { return new StrategyToken(StrategyTokenType.Action, null, null, x, null, null, null); }
        }
		if (/\d+(\.\d+)?/.test(input)) { return new StrategyToken(StrategyTokenType.Number, parseFloat(input)); }
        if(/;/.test(input)) { return new StrategyToken(StrategyTokenType.Semicolon); }
        throw "Unknown token";
    }
}

export class StrategyParser {
    private lex: StrategyLexer;
    // Strategy = StrategyBranch; [StrategyBranch;]
    public parse(code: string): Strategy {
        this.lex = new StrategyLexer(code);
        const strategy: Strategy = new Strategy();
        let token: StrategyToken;
        do {
            const strategyBranch: StrategyBranch = this.strategyBranch();
            strategy.strategyBranches.push(strategyBranch);
            token = this.lex.getTokenAndAdvance();
            if(token.type !== StrategyTokenType.Semicolon) {
                throw "Missing ;";
            }
            token = this.lex.getTokenAndAdvance();
            this.lex.revert();
        } while (token.type !== StrategyTokenType.End);
        return strategy;
    }
    // StrategyBranch = Action | Action WHEN BinaryCondition | Action WHEN CompositeCondition
    private strategyBranch(): StrategyBranch {
        const action: Action = this.action();
        let compositeCondition: CompositeCondition;
        const token: StrategyToken = this.lex.getTokenAndAdvance();
        if(token.type === StrategyTokenType.Semicolon) {
            this.lex.revert();
            return new StrategyBranch(action);
        }
        if(token.type === StrategyTokenType.When) {
            compositeCondition = this.compositeCondition();
            return new StrategyBranch(action, compositeCondition);
        }
        throw "Incorect syntax: Strategy";
    }
    private action(): Action { // ACTION number %|
        let actionType: ActionType;
        let param: number;
        let token: StrategyToken = this.lex.getTokenAndAdvance();
        if(token.type === StrategyTokenType.Action) {
            actionType = token.actionType;
            token = this.lex.getTokenAndAdvance();
            if(token.type === StrategyTokenType.Number) {
                param = token.value;
                return new Action(actionType, param);
            }
        }
        throw "Incorect syntax: Action";
    }
    //CompositeCondition = BinaryCondition logicalOperator BinaryCondition | BinaryCondition logicalOperator CompositeCondition
    private compositeCondition(): CompositeCondition {
        const binaryCondition: BinaryCondition = this.binaryCondition();
        const token: StrategyToken = this.lex.getTokenAndAdvance();
        if(token.type === StrategyTokenType.LogicalOperator) {
            const logicalOperator: LogicalOperator = new LogicalOperator(token.logicalOperator.code);
            const compositeCondition: CompositeCondition = new CompositeCondition(logicalOperator);
            compositeCondition.left = new CompositeCondition(binaryCondition);
            compositeCondition.right = this.compositeCondition();
            return compositeCondition;
        }
        if(token.type === StrategyTokenType.Semicolon) {
            this.lex.revert();
            return new CompositeCondition(binaryCondition);
        }
        throw "Incorect syntax: CompositeCondition";
    }
    // BinaryCondition = Term ComparisonOperator Term
    private binaryCondition(): BinaryCondition {
        const term1: Term = this.term();
        let comparisonOperator: ComparisonOperatorType;
        let term2: Term;
        const token: StrategyToken = this.lex.getTokenAndAdvance();
        if(token.type === StrategyTokenType.ComparisonOperator) {
            comparisonOperator = token.comparisonOperator;
            term2 = this.term();
            return new BinaryCondition(term1, new ComparisonOperator(comparisonOperator.code), term2);
        }
        throw "Incorect syntax: BinaryCondition";
    }
    // Term = [number arithmeticOperator] indicator
    private term(): Term {
        let coeficient: number;
        let arithmeticOperator: ArithmeticOperator;
        let indicator: Indicator;
        let token: StrategyToken = this.lex.getTokenAndAdvance();
        if(token.type === StrategyTokenType.Number) {
            coeficient = token.value;
            token = this.lex.getTokenAndAdvance();
            if(token.type === StrategyTokenType.ArithmeticOperator) {
                arithmeticOperator = new ArithmeticOperator(token.arithmeticOperator.code);
                token = this.lex.getTokenAndAdvance();
                if(token.type === StrategyTokenType.Indicator) {
                    indicator = new Indicator(token.indicator.code);
                    return new Term(indicator, coeficient, arithmeticOperator);
                }
            }
        }
        else {
            if(token.type === StrategyTokenType.Indicator) {
                indicator = new Indicator(token.indicator.code);
                return new Term(indicator);
            }
        }
        throw "Incorect syntax: Term";
    }
}