import React, { useCallback, useMemo } from 'react';

import styled from 'styled-components';
import { CellAction } from '../Domain/Cell';

import { GameContext } from '../GameContext';
import { Actions } from './Actions';
import { GameOver } from './GameOver';
import { Grid } from './Grid';

const GameWrapper = styled.div`
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: rgb(51, 51, 51);
`;

const GameGridWrapper = styled.div`
    position: relative;
`;

export const Game: React.FunctionComponent = () => {
    const { grid, updateGridCellStatus, undoGrid } =
        React.useContext(GameContext);

    const startTime = useMemo(() => {
        return grid.startTime;
    }, [grid.startTime]);

    const gameOver = useMemo(
        () =>
            (grid.isDefeated() && 'defeat') ||
            (grid.isVictorious() && 'victory') ||
            false,
        [grid]
    );

    const finalScore = useMemo(() => {
        return gameOver === 'victory' && grid.getCurrentScore();
    }, [gameOver]);

    const handleClick = useCallback(
        (index: number, action: CellAction) => {
            !gameOver && updateGridCellStatus(index, action);
        },
        [updateGridCellStatus]
    );

    const handleClickUndo = useCallback(() => {
        undoGrid();
    }, [undoGrid]);

    return (
        <GameWrapper>
            <Actions
                canUndo={grid.canUndo}
                onClickUndo={handleClickUndo}
                startTime={startTime}
                gameOver={!!gameOver}
            />
            <GameGridWrapper>
                <GameOver gameOver={gameOver} score={finalScore} />
                <Grid
                    grid={grid}
                    onClickCell={handleClick}
                    gameIsOver={!!gameOver}
                />
            </GameGridWrapper>
        </GameWrapper>
    );
};
