import { expect } from "chai";
import { StrategyLexer, StrategyToken, StrategyTokenType } from "../entities/StrategyEvaluator";

describe("BooleanEvaluatorMath test suite", () => {
	it("Can lex", () => {
		const lexer: StrategyLexer = new StrategyLexer("BUY ");
		let token: StrategyToken = lexer.getTokenAndAdvance();
		expect(token.type).to.equal(StrategyTokenType.Buy);
	});
});