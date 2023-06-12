import { expect } from "chai";
import { ActionTypes } from "../entities/Action";
import Strategy from "../entities/Strategy";
import { StrategyLexer, StrategyParser, StrategyToken, StrategyTokenType } from "../entities/StrategyEvaluator";
import StockAndTradeHistoryItem from "../entities/StockAndTradeHistoryItem";
import TestDataSet from "./testDataset";
import Portofolio from "../entities/Portofolio";

describe("BooleanEvaluatorMath test suite", () => {
	it("Can lex", () => {
		const lexer: StrategyLexer = new StrategyLexer("BUY_PERCENTAGE 100 WHEN YESTERDAY::OPEN < TODAY::OPEN;");
		let token: StrategyToken = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Action);
		expect(token.actionType).to.be.equal(ActionTypes.BUY_PERCENTAGE);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Number);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.When);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Scope);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.ResolutionOperator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Indicator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.ComparisonOperator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Scope);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.ResolutionOperator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Indicator);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.Semicolon);
		token = lexer.getTokenAndAdvance();
		expect(token.type).to.be.equal(StrategyTokenType.End);
	});
	it("Can parse one branch", () => {
		const parser: StrategyParser = new StrategyParser();
        const strategy: Strategy = parser.parse("BUY_PERCENTAGE 100 WHEN YESTERDAY::OPEN < 0.97 * TODAY::OPEN;");
		expect(strategy).to.be.not.null;
	});
	it("Can parse one branch with multiple conditions", () => {
		const parser: StrategyParser = new StrategyParser();
        const strategy: Strategy = parser.parse("BUY_PERCENTAGE 100 WHEN YESTERDAY::OPEN < 0.97 * TODAY::OPEN && TODAY::OPEN >= TODAY::SMA_200_DAYS;");
		expect(strategy).to.be.not.null;
	});
	it("Can parse two branches", () => {
		const parser: StrategyParser = new StrategyParser();
        const strategy: Strategy = parser.parse("SELL_PERCENTAGE 100 WHEN 1 * TODAY::OPEN >= 1.03 * YESTERDAY::OPEN; BUY_PERCENTAGE 100 WHEN 1 * TODAY::OPEN <= 0.97 * YESTERDAY::OPEN; ");
		expect(strategy).to.be.not.null;
	});
	it("Can run 2% strategy", () => {
        const tradeDataSet: Array<StockAndTradeHistoryItem> = TestDataSet.get3DaysDataset2PercentVariation();
		const portofolio: Portofolio = new Portofolio(5000, 0, tradeDataSet[0].date, tradeDataSet);
		const parser: StrategyParser = new StrategyParser();
        const strategy: Strategy = parser.parse("BUY_PERCENTAGE 100 WHEN YESTERDAY::OPEN <= 0.98 * TODAY::OPEN;");
		strategy.run(tradeDataSet, portofolio);
		expect(portofolio.numberOfShares).to.be.equal(50, "portofolio should have 50 shares");
		expect(portofolio.numberOfTrades).to.be.equal(1, "portofolio should have 1 trade");
		expect(portofolio.history[0].date.toISOString()).to.be.equal("2022-01-02T00:00:00.000Z", "trade should have occured on 2022-01-02T00:00:00.000Z");
	});
});