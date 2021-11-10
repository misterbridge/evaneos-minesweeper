import React from 'react';
import { CellAction } from './Domain/Cell';
import { Grid } from './Domain/Grid';

type GameContextProps = {
    grid: Grid;
    updateGridCellStatus: (index: number, status: CellAction) => void;
};

type GridCustomHook = [Grid, (index: number, action: CellAction) => void];

const initialContext: GameContextProps = {
    grid: Grid.generate(10, 10, 10),
    updateGridCellStatus: () => {},
};

const useStateGridCells = (initialValue: Grid): GridCustomHook => {
    const [grid, setGrid] = React.useState(initialValue);

    return [
        grid,
        (index: number, action: CellAction) => {
            const newGrid = grid.sendActionToCell(index, action);
            setGrid(newGrid);
        },
    ];
};

export const GameContext = React.createContext<GameContextProps>(
    initialContext
);

export const GameContextProvider: React.FunctionComponent<
    React.ReactNode
> = props => {
    const [grid, updateGridCellStatus] = useStateGridCells(initialContext.grid);

    return (
        <GameContext.Provider value={{ grid, updateGridCellStatus }}>
            {props.children}
        </GameContext.Provider>
    );
};
