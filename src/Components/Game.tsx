import React from 'react';
import styled from 'styled-components';

type GameProps = {
    gameOver: false | 'victory' | 'defeat';
};

const gameOverMapping: {
    [k in Exclude<GameProps['gameOver'], false>]: string;
} = {
    victory: 'Victory',
    defeat: 'Defeat',
};

const GameWrapper = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgb(230, 230, 230);
    padding: 20px 40px;
    border-radius: 7px;
    box-shadow: 0px 0px 100px -20px black;
`;

export const Game: React.FunctionComponent<GameProps> = (props) => {
    if (!props.gameOver) return null;
    return <GameWrapper>{gameOverMapping[props.gameOver]}</GameWrapper>;
};
