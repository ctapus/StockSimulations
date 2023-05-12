import { expect } from "chai";
import { ActionTypes } from "../entities/Action";
import Strategy from "../entities/Strategy";
import { StrategyLexer, StrategyParser, StrategyToken, StrategyTokenType } from "../entities/StrategyEvaluator";

describe("BooleanEvaluatorMath test suite", () => {
	it("Can lex", () => {
		const lexer: StrategyLexer = new StrategyLexer("BUY_PERCENTAGE 100 WHEN PREV_DAY_OPEN < DAY_OPEN;");
		let token: StrategyToken = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Action);
		expect(token.actionType).to.be.equal(ActionTypes.BUY_PERCENTAGE);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Number);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.When);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Indicator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.ComparisonOperator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Indicator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Semicolon);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.End);
	});
	it("Can parse one branch", () => {
		const parser: StrategyParser = new StrategyParser();
        const strategy: Strategy = parser.parse("BUY_PERCENTAGE 100 WHEN PREV_DAY_OPEN < 0.97 * DAY_OPEN;");
		expect(strategy).to.be.not.null;
	});
	it("Can parse one branch with multiple conditions", () => {
		const parser: StrategyParser = new StrategyParser();
        const strategy: Strategy = parser.parse("BUY_PERCENTAGE 100 WHEN PREV_DAY_OPEN < 0.97 * DAY_OPEN && DAY_OPEN >= SMA_200_DAYS;");
		expect(strategy).to.be.not.null;
	});
	it("Can parse two branches", () => {
		const parser: StrategyParser = new StrategyParser();
        const strategy: Strategy = parser.parse("SELL_PERCENTAGE 100 WHEN 1 * DAY_OPEN >= 1.03 * PREV_DAY_OPEN; BUY_PERCENTAGE 100 WHEN 1 * DAY_OPEN <= 0.97 * PREV_DAY_OPEN; ");
		expect(strategy).to.be.not.null;
	});
});