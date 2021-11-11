import { Cell, CellAction } from './Cell';

export type Cells = Array<Cell>;

export class Grid {
    [key: number]: number;
    private _column: number;
    private _cells: Cells;

    static generate(row: number, column: number, minesCount: number): Grid {
        // Create all cells
        const length = row * column;
        let cells: Cells = [];
        for (let i = 0; i < length; i++) {
            const cell = minesCount > i ? Cell.withBomb() : Cell.withoutBomb();
            cells.push(cell);
        }

        // Shuffle the cells so bombs are randomly positionned
        let index = -1;
        while (++index < length) {
            const rand = index + Math.floor(Math.random() * (length - index));
            const cell = cells[rand];

            cells[rand] = cells[index];
            cells[index] = cell;
        }

        return new Grid(column, cells);
    }

    constructor(column: number, cells: Cells) {
        if (!Number.isInteger(column)) {
            throw new TypeError('column count must be an integer');
        }

        if (cells.length % column !== 0 || cells.length === 0) {
            throw new RangeError(
                'cell count must be dividable by column count'
            );
        }

        const row = Math.floor(cells.length / column);
        // Inform cells about their neighborhood
        cells.forEach((cell, index) => {
            if (!cell.trapped) {
                let trappedNeighbors = 0;
                const x = index % column;
                const y = Math.floor(index / column);
                // Left
                if (x > 0 && cells[column * y + x - 1].trapped) {
                    trappedNeighbors += 1;
                }
                // Up
                if (y > 0 && cells[column * (y - 1) + x].trapped) {
                    trappedNeighbors += 1;
                }
                // Right
                if (x < column - 1 && cells[column * y + x + 1].trapped) {
                    trappedNeighbors += 1;
                }
                // Down
                if (y < row - 1 && cells[column * (y + 1) + x].trapped) {
                    trappedNeighbors += 1;
                }
                cell.setTrappedNeighbors(trappedNeighbors);
            }
        });

        this._column = column;
        this._cells = cells;
    }

    [Symbol.iterator]() {
        return this._cells[Symbol.iterator]();
    }

    map(
        callbackfn: (value: Cell, index: number, array: Cell[]) => {},
        thisArg?: any
    ) {
        return this._cells.map(callbackfn);
    }

    cellByIndex(index: number): Cell | undefined {
        return this._cells[index];
    }

    cellByCoodinates(x: number, y: number): Cell | undefined {
        return this._cells[this._column * y + x];
    }

    sendActionToCell(cellIndex: number, action: CellAction): Grid {
        const cells = [...this._cells];
        const cell = cells[cellIndex];

        cells[cellIndex] = cell[action]();
        return new Grid(this._column, cells);
    }

    isDefeated = () => {
        for (let cell of this) {
            if (cell.detonated === true) return true;
        }
        return false;
    };

    isVictorious = () => {
        for (let cell of this) {
            if (
                (cell.trapped === false && cell.dug === false) ||
                cell.detonated === true
            ) {
                return false;
            }
        }
        return true;
    };

    get column() {
        return this._column;
    }
}
