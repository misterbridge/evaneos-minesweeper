import React from 'react';
import styled from 'styled-components';

type GameOverProps = {
    gameOver: false | 'victory' | 'defeat';
};

const gameOverMapping: {
    [k in Exclude<GameOverProps['gameOver'], false>]: string;
} = {
    victory: 'Victory',
    defeat: 'Defeat',
};

const GameOverWrapper = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgb(230, 230, 230);
    padding: 20px 40px;
    border-radius: 7px;
    box-shadow: 0px 0px 100px -20px black;
`;

export const GameOver: React.FunctionComponent<GameOverProps> = (props) => {
    if (!props.gameOver) return null;
    return <GameOverWrapper>{gameOverMapping[props.gameOver]}</GameOverWrapper>;
};
