
export class LogicalOperatorType {
    public code: string;
    public classDescription: string;
    constructor(code: string, classDescription: string) {
        this.code = code;
        this.classDescription = classDescription;
    }
}

export class LogicalOperatorTypes {
    public static readonly CONJUNCTION                 = new LogicalOperatorType("AND", "∧");
    public static readonly DISJUNCTION                 = new LogicalOperatorType("OR", "∨");
    public static readonly AllLogicalOperatorTypes: LogicalOperatorType[] = [ this.CONJUNCTION, this.DISJUNCTION ];
    public static item(key: string): LogicalOperatorType {
        return this.AllLogicalOperatorTypes.filter(x => x.code.toUpperCase() === key.toUpperCase())[0];
    }
}

export class LogicalOperator {
    public logicalOperatorType: LogicalOperatorType;
    public constructor(s: string) {
        this.logicalOperatorType = LogicalOperatorTypes.item(s);
    }
    public toString(): string {
        return this.logicalOperatorType.classDescription;
    }
    public toCode(): string {
        return this.logicalOperatorType.classDescription;
    }
}