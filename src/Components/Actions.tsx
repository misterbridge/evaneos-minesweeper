import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

type ActionsProps = {
    onClickUndo: () => void;
    canUndo: boolean;
    startTime: number | undefined;
    gameOver: boolean;
};

const ActionsWrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-bottom: 8px;
    margin: -8px -8px 0px -8px;

    & > div {
        margin: 8px;
    }
`;

const ScoreWrapper = styled.div`
    padding: 10px;
    background-color: rgb(230, 230, 230);
    border-radius: 7px;
`;

const ButtonWrapper = styled.div`
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
    startTime,
    gameOver,
}) => {
    const [seconds, setSeconds] = useState(0);

    // This useEffect is only there for the component to refresh every seconds from game start to game end
    useEffect(() => {
        let interval: number | undefined = undefined;
        if (!gameOver && startTime) {
            interval = window.setInterval(() => {
                setSeconds((seconds) => seconds + 1);
            }, 1000);
        } else if (gameOver) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [gameOver, startTime, seconds]);

    // 00:00 since startTime
    const timer = new Date(Date.now() - (startTime ?? Date.now()))
        .toISOString()
        .substr(14, 5);

    return (
        <ActionsWrapper>
            <ButtonWrapper>
                <Button type="button" onClick={onClickUndo} disabled={!canUndo}>
                    &#8630;
                </Button>
            </ButtonWrapper>
            <ScoreWrapper>{timer}</ScoreWrapper>
        </ActionsWrapper>
    );
};
