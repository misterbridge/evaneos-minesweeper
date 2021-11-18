import { Cell } from '../src/Domain/Cell';
import { COST_PER_FLAG, COST_PER_UNDO, Grid } from '../src/Domain/Grid';

describe('Rules', () => {
    test('a new game is neither lost or won', () => {
        const grid = Grid.generate(1, 1, 0);
        expect(grid.isDefeated()).toBe(false);
        expect(grid.isVictorious()).toBe(false);
    });

    test('a game is lost if a cell with a bomb has been dug', () => {
        const cellWithBomb = Cell.withBomb();
        const cellWithoutBomb = Cell.withoutBomb();
        const grid = new Grid(1, [cellWithBomb, cellWithoutBomb]);
        expect(grid.isDefeated()).toBe(false);
        expect(grid.isVictorious()).toBe(false);

        const gridDetonated = grid.sendActionToCell(0, 'dig');

        expect(gridDetonated.isDefeated()).toBe(true);
        expect(gridDetonated.isVictorious()).toBe(false);
    });

    test('a game is won if every cell without bomb has been dug', () => {
        const cellWithBomb = Cell.withBomb();
        const cellWithoutBomb = Cell.withoutBomb();
        const otherCellWithoutBomb = Cell.withoutBomb();
        const grid = new Grid(1, [
            cellWithoutBomb,
            cellWithBomb,
            otherCellWithoutBomb,
        ]);
        expect(grid.isDefeated()).toBe(false);
        expect(grid.isVictorious()).toBe(false);

        let gridDug = grid.sendActionToCell(0, 'dig');

        expect(gridDug.isDefeated()).toBe(false);
        expect(gridDug.isVictorious()).toBe(false);

        gridDug = gridDug.sendActionToCell(2, 'dig');

        expect(gridDug.isDefeated()).toBe(false);
        expect(gridDug.isVictorious()).toBe(true);
    });

    describe('Score', () => {
        const columns = 10;
        test('it is based on its number of cells', () => {
            const grid = Grid.generate(columns, columns, 0);
            expect(grid.getCurrentScore()).toBe(columns * columns);
        });

        test(`it is reduced by ${COST_PER_FLAG} for each flag usage`, () => {
            let grid = Grid.generate(columns, columns, 0);
            grid = grid.sendActionToCell(0, 'flag');
            grid = grid.sendActionToCell(1, 'flag');
            expect(grid.getCurrentScore()).toBe(
                columns * columns - COST_PER_FLAG * 2
            );
        });

        test(`it counts a flag usage once per cell, even if unflagged`, () => {
            let grid = Grid.generate(columns, columns, 0);

            // Flagged
            grid = grid.sendActionToCell(0, 'flag');
            expect(grid.getCurrentScore()).toBe(
                columns * columns - COST_PER_FLAG
            );

            // Unflagged
            grid = grid.sendActionToCell(0, 'flag');
            expect(grid.getCurrentScore()).toBe(
                columns * columns - COST_PER_FLAG
            );

            // Re-flagged
            grid = grid.sendActionToCell(0, 'flag');
            expect(grid.getCurrentScore()).toBe(
                columns * columns - COST_PER_FLAG
            );
        });

        test(`it is reduced by ${COST_PER_UNDO} for each undo usage`, () => {
            let grid = Grid.generate(columns, columns, 0);

            grid = grid.sendActionToCell(0, 'dig');
            grid = grid.undo();
            expect(grid.getCurrentScore()).toBe(
                columns * columns - COST_PER_UNDO
            );

            grid = grid.sendActionToCell(0, 'dig');
            grid = grid.undo();
            expect(grid.getCurrentScore()).toBe(
                columns * columns - COST_PER_UNDO * 2
            );
        });
    });
});
