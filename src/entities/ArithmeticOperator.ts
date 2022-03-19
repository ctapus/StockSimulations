
export class ArithmeticOperatorType {
    public code: string;
    public classDescription: string;
    constructor(code: string, classDescription: string) {
        this.code = code;
        this.classDescription = classDescription;
    }
}

export class ArithmeticOperatorTypes {
    public static readonly ADDITION                    = new ArithmeticOperatorType("ADDITION", "+");
    public static readonly SUBSTRACTION                = new ArithmeticOperatorType("SUBSTRACTION", "-");
    public static readonly MULTIPLICATION              = new ArithmeticOperatorType("MULTIPLICATION", "*");
    public static readonly DIVISION                    = new ArithmeticOperatorType("MULTIPLICATION", "/");
    public static readonly AllArithmeticOperatorTypes: ArithmeticOperatorType[] = [ this.ADDITION, this.SUBSTRACTION, this.MULTIPLICATION, this.DIVISION ];
    public static item(key: string): ArithmeticOperatorType {
        return this.AllArithmeticOperatorTypes.filter(x => x.code.toUpperCase() === key.toUpperCase())[0];
    }
}

export class ArithmeticOperator {
    public arithmeticOperatorType: ArithmeticOperatorType;
    public constructor(s: string) {
        this.arithmeticOperatorType = ArithmeticOperatorTypes.item(s);
    }
    public toString(): string {
        return this.arithmeticOperatorType.classDescription;
    }
    public toCode(): string {
        return this.arithmeticOperatorType.classDescription;
    }
}