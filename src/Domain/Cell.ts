export type CellStatus = 'untouched' | 'flagged' | 'dug' | 'detonated';
export type CellAction = 'dig' | 'flag';

export class Cell {
    private _bomb: boolean;
    private _flagged: boolean;
    private _dug: boolean;
    private _trappedNeighbors?: number;

    static withBomb(): Cell {
        return new Cell(true, false, false);
    }

    static withoutBomb(): Cell {
        return new Cell(false, false, false);
    }

    constructor(
        withBomb: boolean,
        flagged: boolean,
        dug: boolean,
        trappedNeighbors?: number
    ) {
        this._bomb = withBomb;
        this._flagged = flagged;
        this._dug = dug;
        this._trappedNeighbors = trappedNeighbors;
    }

    get trapped(): boolean {
        return this._bomb;
    }

    get detonated(): boolean {
        return this._bomb && this.dug;
    }

    get flagged(): boolean {
        return this._flagged;
    }

    get dug(): boolean {
        return this._dug;
    }

    get status(): CellStatus {
        if (this.detonated) {
            return 'detonated';
        }
        if (this.dug) {
            return 'dug';
        }
        if (this.flagged) {
            return 'flagged';
        }
        return 'untouched';
    }

    get trappedNeighbors(): number {
        return this._trappedNeighbors || 0;
    }

    setTrappedNeighbors(n: number) {
        this._trappedNeighbors = n;
    }

    flag(): Cell {
        if (this._dug === true) {
            throw new Error('This cell has already been dug');
        }
        return new Cell(
            this._bomb,
            !this._flagged,
            this._dug,
            this._trappedNeighbors
        );
    }

    dig(): Cell {
        return new Cell(this._bomb, false, true, this._trappedNeighbors);
    }
}
