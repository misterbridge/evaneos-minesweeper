import React from 'react';

type GameProps = {
    gameOver: false | 'victory' | 'defeat';
};

export const Game: React.FunctionComponent<GameProps> = props => {
    return <div>{props.gameOver}</div>;
};
