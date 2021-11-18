import React from 'react';
import styled from 'styled-components';

type ActionsProps = {
    onClickUndo: () => void;
    canUndo: boolean;
};

const ActionsWrapper = styled.div`
    margin-bottom: 8px;
    background-color: rgba(230, 230, 230, 0.5);
    padding: 10px;
    border-radius: 50%;
`;

const Button = styled.button`
    font-size: 1.7rem;
    padding-top: 0.2em;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
`;

export const Actions: React.FunctionComponent<ActionsProps> = ({
    onClickUndo,
    canUndo,
}) => {
    return (
        <ActionsWrapper>
            <Button type="button" onClick={onClickUndo} disabled={!canUndo}>
                &#8630;
            </Button>
        </ActionsWrapper>
    );
};
