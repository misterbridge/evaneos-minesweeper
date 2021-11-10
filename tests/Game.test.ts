import { Cell } from '../src/Domain/Cell';
import { Grid } from '../src/Domain/Grid';

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
});
