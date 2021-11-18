import React, { useCallback, useMemo } from 'react';

import styled from 'styled-components';
import { CellAction } from '../Domain/Cell';
import { Grid as GridDomain } from '../Domain/Grid';

import { Cell, CELL_WIDTH } from './Cell';

type GridProps = {
    grid: GridDomain;
    onClickCell: (index: number, action: CellAction) => void;
    gameIsOver: boolean;
};

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

export const Grid: React.FunctionComponent<GridProps> = ({
    grid,
    onClickCell,
    gameIsOver,
}: GridProps) => {
    return (
        <GridWrapper column={grid.column}>
            {grid.map((cell, index) => (
                <Cell
                    key={index}
                    status={cell.status}
                    trappedNeighbors={cell.trappedNeighbors}
                    onClick={onClickCell}
                    index={index}
                    disabled={gameIsOver}
                />
            ))}
        </GridWrapper>
    );
};
