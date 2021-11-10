import React, { useCallback } from 'react';
import styled from 'styled-components';
import { CellAction, CellStatus } from '../Domain/Cell';

type CellProps = {
    status: CellStatus;
    onClick: (index: number, action: CellAction) => void;
    index: number;
};

const emojis = {
    untouched: '',
    dug: '',
    flagged: '🚩',
    detonated: '💥',
};

interface WrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    status: CellStatus;
}
const Wrapper = styled.div<WrapperProps>`
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    border: 1px solid black;
    box-sizing: border-box;
    cursor: pointer;
    background-color: ${({ status }) =>
        status === 'untouched' || status === 'flagged' ? '#ccc' : undefined};
`;

export const Cell: React.FunctionComponent<CellProps> = ({
    onClick,
    status,
    index,
}) => {
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            onClick(index, e.button === 0 ? 'dig' : 'flag');
        },
        [onClick, index]
    );

    return (
        <Wrapper
            onClick={handleClick}
            onContextMenu={handleClick}
            status={status}
        >
            {emojis[status]}
        </Wrapper>
    );
};
