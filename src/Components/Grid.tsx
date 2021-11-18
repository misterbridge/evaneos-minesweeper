import React, { useCallback, useMemo } from 'react';

import styled from 'styled-components';
import { CellAction } from '../Domain/Cell';

import { GameContext } from '../GameContext';
import { Cell, CELL_WIDTH } from './Cell';
import { Game } from './Game';

const GameWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: rgb(51, 51, 51);
`;

interface GridWrapperProps {
    readonly column: number;
}
const GridWrapper = styled.div<GridWrapperProps>`
    display: flex;
    flex-wrap: wrap;
    width: ${({ column }) => `calc(${CELL_WIDTH}px * ${column})`};
    background-color: rgb(230, 230, 230);
    padding: 10px;
    border-radius: 7px;
`;

export const Grid: React.FunctionComponent = () => {
    const { grid, updateGridCellStatus } = React.useContext(GameContext);

    const gameOver = useMemo(
        () =>
            (grid.isDefeated() && 'defeat') ||
            (grid.isVictorious() && 'victory') ||
            false,
        [grid]
    );

    const handleClick = useCallback(
        (index: number, action: CellAction) => {
            !gameOver && updateGridCellStatus(index, action);
        },
        [updateGridCellStatus]
    );

    return (
        <GameWrapper>
            <Game gameOver={gameOver} />
            <GridWrapper column={grid.column}>
                {grid.map((cell, index) => (
                    <Cell
                        key={index}
                        status={cell.status}
                        trappedNeighbors={cell.trappedNeighbors}
                        onClick={handleClick}
                        index={index}
                        disabled={!!gameOver}
                    />
                ))}
            </GridWrapper>
        </GameWrapper>
    );
};
