import { expect } from "chai";
import { ActionTypes } from "../entities/Action";
import { StrategyLexer, StrategyToken, StrategyTokenType } from "../entities/StrategyEvaluator";

describe("BooleanEvaluatorMath test suite", () => {
	it("Can lex", () => {
		const lexer: StrategyLexer = new StrategyLexer("BUY_PERCENTAGE 100 WHEN PREV_DAY_OPEN < DAY_OPEN");
		let token: StrategyToken = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.Action);
		expect(token.actionType).to.equal(ActionTypes.BUY_PERCENTAGE);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.Number);
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