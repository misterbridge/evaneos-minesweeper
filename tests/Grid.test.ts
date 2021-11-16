import { Direction, Grid } from '../src/Domain/Grid';
import { Cell } from '../src/Domain/Cell';

describe(Grid, () => {
    test('it needs to be filled', () => {
        expect(() => new Grid(2, [])).toThrowError(RangeError);
    });

    describe('getByCoordinate', () => {
        test('it get the first cell in grid when asking for x:0 y:0', () => {
            const expected = Cell.withBomb();
            const unexpected = Cell.withoutBomb();
            const grid = new Grid(5, [
                expected,
                unexpected,
                unexpected,
                unexpected,
                unexpected,
            ]);

            expect(grid.cellByCoodinates(0, 0)).toBe(expected);
        });

        test('it get the last cell in grid when asking for x:3 y:1', () => {
            const expected = Cell.withBomb();
            const unexpected = Cell.withoutBomb();
            const grid = new Grid(4, [
                unexpected,
                unexpected,
                unexpected,
                unexpected,
                unexpected,
                unexpected,
                unexpected,
                expected,
            ]);

            const cell = grid.cellByCoodinates(3, 1);
            expect(cell).toBe(expected);
        });
    });

    describe('generator', () => {
        const row = 10;
        const column = row;
        const iterator = Array.from(Array(row * column));

        test('it create a grid with cells', () => {
            const grid = Grid.generate(row, column, 0);
            iterator.forEach((_, index) => {
                expect(grid.cellByIndex(index)).toBeDefined();
            });
        });

        test('it create a grid without any mines', () => {
            const grid = Grid.generate(row, column, 0);
            iterator.forEach((_, index) => {
                const cell = grid.cellByIndex(index);
                if (cell) {
                    const dugCell = cell.dig();
                    expect(dugCell.detonated).toBe(false);
                }
            });
        });

        test('it create a grid full of mines', () => {
            const grid = Grid.generate(row, column, row * column);
            iterator.forEach((_, index) => {
                const cell = grid.cellByIndex(index);
                if (cell) {
                    const trappedDugCell = cell.dig();
                    expect(trappedDugCell.detonated).toBe(true);
                }
            });
        });

        test('it create a grid with 10 mines out of 100 cells', () => {
            const grid = Grid.generate(row, column, 10);
            const mineCount = iterator.reduce((count, _, index) => {
                const cell = grid.cellByIndex(index);
                if (cell === undefined) return count;

                const dugCell = cell.dig();
                return dugCell.detonated === true ? count + 1 : count;
            }, 0);

            expect(mineCount).toBe(10);
        });
    });

    describe('constructor', () => {
        test('it informs the cells about their trapped neighborhood', () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();
            const cellWithoutBomb4 = Cell.withoutBomb();
            const cellWithoutBomb5 = Cell.withoutBomb();
            const cellWithoutBomb6 = Cell.withoutBomb();

            // prettier-ignore
            new Grid(3, [
                cellWithoutBomb1, cellWithBomb,     cellWithoutBomb2,
                cellWithBomb,     cellWithoutBomb3, cellWithBomb,
                cellWithoutBomb4, cellWithoutBomb5, cellWithoutBomb6,
            ]);

            expect(cellWithoutBomb1.trappedNeighbors).toEqual(2);
            expect(cellWithoutBomb2.trappedNeighbors).toEqual(2);
            expect(cellWithoutBomb3.trappedNeighbors).toEqual(3);
            expect(cellWithoutBomb4.trappedNeighbors).toEqual(1);
            expect(cellWithoutBomb5.trappedNeighbors).toEqual(0);
            expect(cellWithoutBomb6.trappedNeighbors).toEqual(1);
        });
    });

    describe('getCellIndexInDirection', () => {
        test(`it returns undefined if there are no cell in the given direction`, () => {
            expect(
                Grid.getCellIndexInDirection(2, 2, 0, Direction.UP)
            ).toBeUndefined();
            expect(
                Grid.getCellIndexInDirection(2, 2, 1, Direction.RIGHT)
            ).toBeUndefined();
            expect(
                Grid.getCellIndexInDirection(2, 2, 2, Direction.LEFT)
            ).toBeUndefined();
            expect(
                Grid.getCellIndexInDirection(2, 2, 3, Direction.DOWN)
            ).toBeUndefined();
        });

        test(`it returns the cell index in the given direction`, () => {
            expect(
                Grid.getCellIndexInDirection(2, 2, 0, Direction.DOWN)
            ).toEqual(2);
            expect(
                Grid.getCellIndexInDirection(2, 2, 1, Direction.LEFT)
            ).toEqual(0);
            expect(
                Grid.getCellIndexInDirection(2, 2, 2, Direction.RIGHT)
            ).toEqual(3);
            expect(Grid.getCellIndexInDirection(2, 2, 3, Direction.UP)).toEqual(
                1
            );
        });
    });

    describe('sendActionToCell and digAndExploreCells', () => {
        test(`digging doesn't explore other cells if there are any trapped neighbor`, () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();

            // prettier-ignore
            const grid = new Grid(2, [
                cellWithBomb,     cellWithoutBomb1,
                cellWithoutBomb2, cellWithoutBomb3,
            ]);

            grid.sendActionToCell(1, 'dig');

            expect(cellWithoutBomb2.dug).toEqual(false);
            expect(cellWithoutBomb3.dug).toEqual(false);
        });

        test(`digging doesn't explore other cells if the cell detonated`, () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();

            // prettier-ignore
            const grid = new Grid(2, [
                cellWithBomb,     cellWithoutBomb1,
                cellWithoutBomb2, cellWithoutBomb3,
            ]);

            grid.sendActionToCell(0, 'dig');

            expect(cellWithoutBomb2.dug).toEqual(false);
            expect(cellWithoutBomb3.dug).toEqual(false);
        });

        test('digging explore other cells if there are no trapped neighbor', () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();

            // prettier-ignore
            const  grid = new Grid(2, [
                cellWithBomb,     cellWithoutBomb1,
                cellWithoutBomb2, cellWithoutBomb3,
            ]);

            const newGrid = grid.sendActionToCell(3, 'dig');

            expect(newGrid.cellByCoodinates(0, 1)?.dug).toEqual(true);
            expect(newGrid.cellByCoodinates(1, 0)?.dug).toEqual(true);
        });

        test('digging explore cells until facing trapped neighbors', () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();
            const cellWithoutBomb4 = Cell.withoutBomb();
            const cellWithoutBomb5 = Cell.withoutBomb();
            const cellWithoutBomb6 = Cell.withoutBomb();
            const cellWithoutBomb7 = Cell.withoutBomb();
            const cellWithoutBomb8 = Cell.withoutBomb();

            // prettier-ignore
            const  grid = new Grid(3, [
                cellWithoutBomb1, cellWithoutBomb2, cellWithoutBomb3,
                cellWithoutBomb4, cellWithBomb,     cellWithoutBomb5,
                cellWithoutBomb6, cellWithoutBomb7, cellWithoutBomb8,
            ]);

            const newGrid = grid.sendActionToCell(0, 'dig');

            expect(newGrid.cellByCoodinates(0, 1)?.dug).toEqual(true);
            expect(newGrid.cellByCoodinates(0, 2)?.dug).toEqual(false);
            expect(newGrid.cellByCoodinates(1, 0)?.dug).toEqual(true);
            expect(newGrid.cellByCoodinates(1, 2)?.dug).toEqual(false);
            expect(newGrid.cellByCoodinates(2, 0)?.dug).toEqual(false);
        });
    });
});
