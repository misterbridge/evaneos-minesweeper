import React, { useCallback } from 'react';
import styled from 'styled-components';
import { CellAction, CellStatus } from '../Domain/Cell';

export const CELL_WIDTH = 40;

type CellProps = {
    status: CellStatus;
    onClick: (index: number, action: CellAction) => void;
    trappedNeighbors: number;
    index: number;
    disabled: boolean;
};

const emojis = {
    untouched: '',
    dug: '',
    flagged: '🚩',
    detonated: '💥',
};

interface WrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    status: CellStatus;
    disabled: boolean;
}
const Wrapper = styled.div<WrapperProps>`
    width: ${CELL_WIDTH}px;
    height: ${CELL_WIDTH}px;
    text-align: center;
    line-height: 40px;
    border: 2px solid rgb(230, 230, 230);
    border-radius: 7px;
    box-sizing: border-box;
    cursor: pointer;
    background-color: ${({ status }) =>
        status === 'untouched' || status === 'flagged'
            ? 'rgb(200, 200, 200)'
            : 'rgba(200, 200, 200, 0.3)'};
    pointer-events: ${({ disabled }) => (disabled ? 'none' : undefined)};
`;

export const Cell: React.FunctionComponent<CellProps> = ({
    status,
    onClick,
    trappedNeighbors,
    index,
    disabled,
}) => {
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            !disabled && onClick(index, e.button === 0 ? 'dig' : 'flag');
        },
        [onClick, index]
    );

    return (
        <Wrapper
            onClick={handleClick}
            onContextMenu={handleClick}
            status={status}
            disabled={disabled}
        >
            {status === 'dug' ? trappedNeighbors || '' : emojis[status]}
        </Wrapper>
    );
};
