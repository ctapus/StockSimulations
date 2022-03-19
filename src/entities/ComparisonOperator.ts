
export class ComparisonOperatorType {
    public code: string;
    public classDescription: string;
    constructor(code: string, classDescription: string) {
        this.code = code;
        this.classDescription = classDescription;
    }
}
export class ComparisonOperatorTypes {
    public static readonly EQUAL                    = new ComparisonOperatorType("EQUAL", "=");
    public static readonly NOT_EQUAL                = new ComparisonOperatorType("NOT_EQUAL", "!=");
    public static readonly GREATER_THAN_OR_EQUAL_TO = new ComparisonOperatorType("GREATER_THAN_OR_EQUAL_TO", ">=");
    public static readonly LESS_THAN_OR_EQUAL_TO    = new ComparisonOperatorType("LESS_THAN_OR_EQUAL_TO", "<=");
    public static readonly GREATER_THAN             = new ComparisonOperatorType("GREATER_THAN", ">");
    public static readonly LESS_THAN                = new ComparisonOperatorType("LESS_THAN", "<");
    public static readonly AllComparisonOperatorTypes: ComparisonOperatorType[] = [ this.EQUAL, this.NOT_EQUAL, this.GREATER_THAN_OR_EQUAL_TO, this.LESS_THAN_OR_EQUAL_TO,
                                                                                    this.GREATER_THAN, this.LESS_THAN ];
    public static item(key: string): ComparisonOperatorType {
        return this.AllComparisonOperatorTypes.filter(x => x.code.toUpperCase() === key.toUpperCase())[0];
    }
}
export class ComparisonOperator {
    public comparisonOperatorType: ComparisonOperatorType;
    public constructor(s: string) {
        this.comparisonOperatorType = ComparisonOperatorTypes.item(s);
    }
    public toString(): string {
        return this.comparisonOperatorType.classDescription;
    }
    public toCode(): string {
        return this.comparisonOperatorType.classDescription;
    }
}