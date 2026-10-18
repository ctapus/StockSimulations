export class Statistics {
    public static calculateCorrelation(vector1: number[], vector2: number[]): number {
        if(vector1.length !== vector2.length) {
            throw new Error("Vectors must be of the same length");
        }
        let sum1: number = 0;
        let sum2: number = 0;
        let sum1Squared: number = 0;
        let sum2Squared: number = 0;
        let sumBoth: number = 0;
        const n: number = vector1.length;
        for(let i = 0; i < n; i++) {
            sum1 += vector1[i];
            sum2 += vector2[i];
            sum1Squared += vector1[i] * vector1[i];
            sum2Squared += vector2[i] * vector2[i];
            sumBoth += vector1[i] * vector2[i];
        }
        const r: number = (n * sumBoth - sum1 * sum2) / Math.sqrt((n * sum1Squared - sum1 * sum1) * (n * sum2Squared - sum2 * sum2));
        return r;
    }
}