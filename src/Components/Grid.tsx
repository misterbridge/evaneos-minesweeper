import React, { useCallback, useMemo } from 'react';

import styled from 'styled-components';
import { CellAction } from '../Domain/Cell';

import { GameContext } from '../GameContext';
import { Cell } from './Cell';
import { Game } from './Game';

interface WrapperProps {
    readonly column: number;
}
const Wrapper = styled.div<WrapperProps>`
    display: flex;
    border: 1px solid black;
    box-sizing: content-box;
    flex-wrap: wrap;
    width: ${({ column }) => `calc(40px * ${column})`};
`;

export const Grid: React.FunctionComponent = () => {
    const { grid, updateGridCellStatus } = React.useContext(GameContext);

    const handleClick = useCallback(
        (index: number, action: CellAction) => {
            updateGridCellStatus(index, action);
        },
        [updateGridCellStatus]
    );

    const gameOver = useMemo(
        () =>
            (grid.isDefeated() && 'defeat') ||
            (grid.isVictorious() && 'victory') ||
            false,
        [grid]
    );

    return (
        <React.Fragment>
            <Game gameOver={gameOver} />
            <Wrapper column={grid.column}>
                {grid.map((cell, index) => (
                    <Cell
                        key={index}
                        status={cell.status}
                        onClick={handleClick}
                        index={index}
                    />
                ))}
            </Wrapper>
        </React.Fragment>
    );
};
