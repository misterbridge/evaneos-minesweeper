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
        const grid = new Grid(1, [cellWithBomb]);
        expect(grid.isDefeated()).toBe(false);
        expect(grid.isVictorious()).toBe(false);

        const gridDetonated = grid.sendActionToCell(0, 'dig');

        expect(gridDetonated.isDefeated()).toBe(true);
        expect(gridDetonated.isVictorious()).toBe(false);
    });

    test('a game is won if every cell without bomb has been dug', () => {
        const cellWithoutBomb = Cell.withoutBomb();
        const grid = new Grid(1, [cellWithoutBomb]);
        expect(grid.isDefeated()).toBe(false);
        expect(grid.isVictorious()).toBe(false);

        const gridDug = grid.sendActionToCell(0, 'dig');

        expect(gridDug.isDefeated()).toBe(false);
        expect(gridDug.isVictorious()).toBe(true);
    });
});
