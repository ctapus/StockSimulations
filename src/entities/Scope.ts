import Portofolio from "./Portofolio";
import StockHistoryItem from "./StockHistoryItem";

export class ScopeType {
    public code: string;
    public classDescription: string;
    constructor(code: string, classDescription: string) {
        this.code = code;
        this.classDescription = classDescription;
    }
}
export class ScopeTypes {
    public static readonly TODAY                  = new ScopeType("TODAY", "Today");
    public static readonly YESTERDAY              = new ScopeType("YESTERDAY", "Yesterday");
    public static AllScopeTypes: ScopeType[] = [ this.TODAY, this.YESTERDAY ];
    public static item(key: string): ScopeType {
        return this.AllScopeTypes.filter(x => x.code.toUpperCase() === key.toUpperCase())[0];
    }
}
export class Scope {
    public scopeType: ScopeType;
    public constructor(s: string) {
        this.scopeType = ScopeTypes.item(s);
    }
    public evaluate(tradeTick: StockHistoryItem, portofolio: Portofolio): StockHistoryItem {
        switch(this.scopeType) {
            case ScopeTypes.TODAY: return tradeTick;
            case ScopeTypes.YESTERDAY: return tradeTick.previousDay;
        }
    }
    public toString(): string {
        return this.scopeType.classDescription;
    }
    public toCode(): string {
        return this.scopeType.code;
    }
}