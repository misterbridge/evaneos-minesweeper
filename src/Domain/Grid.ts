import { Cell, CellAction } from './Cell';

export enum Direction {
    UP,
    RIGHT,
    DOWN,
    LEFT,
}

export type Cells = Array<Cell>;
type ScoreInfos = {
    startTime?: number | undefined;
    undosCount: number;
    flaggedIndexes: number[];
};

export const COST_PER_UNDO = 5;
export const COST_PER_FLAG = 1;
export const COST_PER_SECOND = 0.2;

export class Grid {
    private _column: number;
    private _cells: Cells;
    private _previousCells: Cells | undefined;
    private _scoreInfos: ScoreInfos;

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

    static getCellIndexInDirection(
        column: number,
        row: number,
        index: number,
        direction: Direction
    ): number | undefined {
        const x = index % column;
        const y = Math.floor(index / column);
        switch (direction) {
            case Direction.UP:
                return y > 0 ? column * (y - 1) + x : undefined;
            case Direction.RIGHT:
                return x < column - 1 ? column * y + x + 1 : undefined;
            case Direction.DOWN:
                return y < row - 1 ? column * (y + 1) + x : undefined;
            case Direction.LEFT:
                return x > 0 ? column * y + x - 1 : undefined;
            default:
                return undefined;
        }
    }

    static digAndExploreCells(
        column: number,
        cells: Cells,
        cellIndex: number
    ): Cells {
        const row = Math.floor(cells.length / column);
        const cellsToExplore: Array<[number, Cell]> = [
            [cellIndex, cells[cellIndex]],
        ];

        function checkAndAddInDirection(
            column: number,
            row: number,
            originCellIndex: number,
            direction: Direction
        ) {
            const checkedCellIndex = Grid.getCellIndexInDirection(
                column,
                row,
                originCellIndex,
                direction
            );
            if (typeof checkedCellIndex !== 'undefined') {
                const checkedCell = cells[checkedCellIndex];
                if (checkedCell && checkedCell.status === 'untouched') {
                    cellsToExplore.push([checkedCellIndex, checkedCell]);
                }
            }
        }

        let exploreIndex = 0;
        while (exploreIndex < cellsToExplore.length) {
            const [exploredCellIndex, exploredCell] =
                cellsToExplore[exploreIndex];
            cells[exploredCellIndex] = exploredCell.dig();

            if (
                !cells[exploredCellIndex].detonated &&
                cells[exploredCellIndex].trappedNeighbors === 0
            ) {
                checkAndAddInDirection(
                    column,
                    row,
                    exploredCellIndex,
                    Direction.UP
                );
                checkAndAddInDirection(
                    column,
                    row,
                    exploredCellIndex,
                    Direction.RIGHT
                );
                checkAndAddInDirection(
                    column,
                    row,
                    exploredCellIndex,
                    Direction.DOWN
                );
                checkAndAddInDirection(
                    column,
                    row,
                    exploredCellIndex,
                    Direction.LEFT
                );
            }

            exploreIndex += 1;
        }

        return cells;
    }

    constructor(
        column: number,
        cells: Cells,
        scoreInfos: ScoreInfos = {
            undosCount: 0,
            flaggedIndexes: [],
        },
        previousCells?: Cells
    ) {
        if (!Number.isInteger(column)) {
            throw new TypeError('column count must be an integer');
        }

        if (cells.length % column !== 0 || cells.length === 0) {
            throw new RangeError(
                'cell count must be dividable by column count'
            );
        }

        if (previousCells && previousCells.length !== cells.length) {
            throw new RangeError(
                'previousCells count must be equal to current cells count'
            );
        }

        const row = Math.floor(cells.length / column);
        // Inform cells about their neighborhood
        cells.forEach((cell, index) => {
            if (!cell.trapped) {
                let trappedNeighbors = 0;

                function checkTrappedInDirection(
                    column: number,
                    row: number,
                    originCellIndex: number,
                    direction: Direction
                ) {
                    const checkedCellIndex = Grid.getCellIndexInDirection(
                        column,
                        row,
                        originCellIndex,
                        direction
                    );
                    if (
                        typeof checkedCellIndex !== 'undefined' &&
                        cells[checkedCellIndex].trapped
                    ) {
                        trappedNeighbors += 1;
                    }
                }

                checkTrappedInDirection(column, row, index, Direction.UP);
                checkTrappedInDirection(column, row, index, Direction.RIGHT);
                checkTrappedInDirection(column, row, index, Direction.DOWN);
                checkTrappedInDirection(column, row, index, Direction.LEFT);

                cell.setTrappedNeighbors(trappedNeighbors);
            }
        });

        this._column = column;
        this._cells = cells;
        this._previousCells = previousCells;
        this._scoreInfos = scoreInfos;
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

    get canUndo() {
        return typeof this._previousCells !== 'undefined';
    }

    get startTime() {
        return this._scoreInfos.startTime;
    }

    getCurrentScore() {
        const maxScore = this._cells.length;
        if (!this._scoreInfos.startTime) {
            return maxScore;
        }
        const preciseScore = Math.max(
            maxScore -
                this._scoreInfos.undosCount * COST_PER_UNDO -
                this._scoreInfos.flaggedIndexes.length * COST_PER_FLAG -
                (process.env.NODE_ENV === 'test'
                    ? 0
                    : ((Date.now() - this._scoreInfos.startTime) / 1000) *
                      COST_PER_SECOND),
            0
        );
        return Math.round(preciseScore * 10) / 10;
    }

    startGame() {
        if (!this._scoreInfos.startTime) {
            this._scoreInfos.startTime = Date.now();
        }
    }

    scoreAddFlag(cellIndex: number) {
        if (this._scoreInfos.flaggedIndexes.indexOf(cellIndex) === -1) {
            this._scoreInfos.flaggedIndexes.push(cellIndex);
        }
    }

    scoreAddUndo() {
        this._scoreInfos.undosCount += 1;
    }

    cellByIndex(index: number): Cell | undefined {
        return this._cells[index];
    }

    cellByCoodinates(x: number, y: number): Cell | undefined {
        return this._cells[this._column * y + x];
    }

    sendActionToCell(cellIndex: number, action: CellAction): Grid {
        this.startGame();

        let cells = [...this._cells];
        const cell = cells[cellIndex];

        if (action === 'dig') {
            if (cell.dug) return this;
            cells = Grid.digAndExploreCells(this._column, cells, cellIndex);
        } else {
            if (action === 'flag') {
                this.scoreAddFlag(cellIndex);
            }
            cells[cellIndex] = cell[action]();
        }

        return new Grid(this._column, cells, this._scoreInfos, this._cells);
    }

    undo() {
        if (this._previousCells) {
            this.scoreAddUndo();

            return new Grid(
                this._column,
                this._previousCells,
                this._scoreInfos
            );
        }
        return this;
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
