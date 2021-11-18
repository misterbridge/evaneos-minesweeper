import { Direction, Grid } from '../src/Domain/Grid';
import { Cell } from '../src/Domain/Cell';

describe(Grid, () => {
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
        test('it needs to be filled', () => {
            expect(() => new Grid(2, [])).toThrowError(RangeError);
        });

        test('it can have previousCells, but they must be the same length as the current ones', () => {
            const cell = Cell.withoutBomb();
            expect(
                () =>
                    new Grid(
                        2,
                        [cell, cell],
                        { flaggedIndexes: [], undosCount: 0 },
                        [cell]
                    )
            ).toThrowError(RangeError);
        });

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
        test(`it doesn't mutate the grid if digging an already dug cell`, () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();

            // prettier-ignore
            let grid = new Grid(2, [
                cellWithBomb,     cellWithoutBomb1,
            ]);

            grid = grid.sendActionToCell(1, 'dig');
            const nonMutatedGrid = grid.sendActionToCell(1, 'dig');

            expect(grid).toEqual(nonMutatedGrid);
        });

        test(`it doesn't explore other cells if there are any trapped neighbor`, () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();

            // prettier-ignore
            let grid = new Grid(2, [
                cellWithBomb,     cellWithoutBomb1,
                cellWithoutBomb2, cellWithoutBomb3,
            ]);

            grid = grid.sendActionToCell(1, 'dig');

            expect(grid.cellByCoodinates(1, 0)?.dug).toEqual(true);
            expect(grid.cellByCoodinates(0, 1)?.dug).toEqual(false);
            expect(grid.cellByCoodinates(1, 1)?.dug).toEqual(false);
        });

        test(`it doesn't explore other cells if the cell detonated`, () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();

            // prettier-ignore
            let grid = new Grid(2, [
                cellWithBomb,     cellWithoutBomb1,
                cellWithoutBomb2, cellWithoutBomb3,
            ]);

            grid = grid.sendActionToCell(0, 'dig');

            expect(grid.cellByCoodinates(0, 0)?.dug).toEqual(true);
            expect(grid.cellByCoodinates(1, 0)?.dug).toEqual(false);
            expect(grid.cellByCoodinates(0, 1)?.dug).toEqual(false);
            expect(grid.cellByCoodinates(1, 1)?.dug).toEqual(false);
        });

        test('it explores other cells if there are no trapped neighbor', () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();

            // prettier-ignore
            let grid = new Grid(2, [
                cellWithBomb,     cellWithoutBomb1,
                cellWithoutBomb2, cellWithoutBomb3,
            ]);

            grid = grid.sendActionToCell(3, 'dig');

            expect(grid.cellByCoodinates(1, 0)?.dug).toEqual(true);
            expect(grid.cellByCoodinates(0, 1)?.dug).toEqual(true);
        });

        test('it explore cells until facing trapped neighbors', () => {
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
            let grid = new Grid(3, [
                cellWithoutBomb1, cellWithoutBomb2, cellWithoutBomb3,
                cellWithoutBomb4, cellWithBomb,     cellWithoutBomb5,
                cellWithoutBomb6, cellWithoutBomb7, cellWithoutBomb8,
            ]);

            grid = grid.sendActionToCell(0, 'dig');

            expect(grid.cellByCoodinates(1, 0)?.dug).toEqual(true);
            expect(grid.cellByCoodinates(2, 0)?.dug).toEqual(false);
            expect(grid.cellByCoodinates(0, 1)?.dug).toEqual(true);
            expect(grid.cellByCoodinates(0, 2)?.dug).toEqual(false);
            expect(grid.cellByCoodinates(1, 2)?.dug).toEqual(false);
        });
    });

    describe('undo', () => {
        test('it resets cells to their previous state', () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();

            // prettier-ignore
            let grid = new Grid(2, [
                cellWithBomb,     cellWithoutBomb1,
                cellWithoutBomb2, cellWithoutBomb3,
            ]);

            grid = grid.sendActionToCell(1, 'dig');

            expect(grid.cellByCoodinates(1, 0)?.dug).toEqual(true);

            grid = grid.undo();

            expect(grid.cellByCoodinates(1, 0)?.dug).toEqual(false);
        });

        test('it cannot reset further than the previous state', () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();

            // prettier-ignore
            let grid = new Grid(2, [
                cellWithBomb,     cellWithoutBomb1,
                cellWithoutBomb2, cellWithoutBomb3,
            ]);

            grid = grid.sendActionToCell(1, 'dig');
            grid = grid.sendActionToCell(2, 'dig');

            expect(grid.cellByCoodinates(1, 0)?.dug).toEqual(true);
            expect(grid.cellByCoodinates(0, 1)?.dug).toEqual(true);

            grid = grid.undo();
            grid = grid.undo();

            expect(grid.cellByCoodinates(1, 0)?.dug).toEqual(true);
            expect(grid.cellByCoodinates(0, 1)?.dug).toEqual(false);
        });

        test('it still works if an already dug cell is dug again', () => {
            const cellWithBomb = Cell.withBomb();
            const cellWithoutBomb1 = Cell.withoutBomb();
            const cellWithoutBomb2 = Cell.withoutBomb();
            const cellWithoutBomb3 = Cell.withoutBomb();

            // prettier-ignore
            let grid = new Grid(2, [
                cellWithBomb,     cellWithoutBomb1,
                cellWithoutBomb2, cellWithoutBomb3,
            ]);

            grid = grid.sendActionToCell(1, 'dig');

            expect(grid.cellByCoodinates(1, 0)?.dug).toEqual(true);

            grid = grid.sendActionToCell(1, 'dig');
            grid = grid.undo();

            expect(grid.cellByCoodinates(1, 0)?.dug).toEqual(false);
        });
    });
});
