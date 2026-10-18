import { expect, test } from 'vitest'
import { Statistics } from '../entities/Statistics';

test("Can calculate correlation identity", () => {
    const result = Statistics.calculateCorrelation([1, 2, 3], [1, 2, 3]);
    expect(result).to.equal(1);
})

test("Can calculate correlation", () => {
    const result = Statistics.calculateCorrelation([41, 19, 23, 40, 55, 57, 33], [94, 60, 74, 71, 82, 76, 61]);
    expect(+result.toFixed(4)).to.equal(0.5398);
})