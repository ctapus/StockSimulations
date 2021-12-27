import { expect } from "chai";
import { ActionType } from "../entities/Action";
import { StrategyLexer, StrategyToken, StrategyTokenType } from "../entities/StrategyEvaluator";

describe("BooleanEvaluatorMath test suite", () => {
	it("Can lex", () => {
		const lexer: StrategyLexer = new StrategyLexer("BUY 100 % WHEN PREV_DAY_OPEN < DAY_OPEN");
		let token: StrategyToken = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.Action);
		expect(token.action).to.equal(ActionType.BUY);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.Number);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.Percentage);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.When);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.Indicator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.ComparisonOperator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.Indicator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.End);
	});
});