import React from 'react';
import { render } from 'react-dom/index';
import { GameContextProvider } from './GameContext';
import { Game } from './Components/Game';

import './App.css';

const App = () => {
    return (
        <GameContextProvider>
            <Game />
        </GameContextProvider>
    );
};

const node = document.getElementById('root');
render(React.createElement(App), node);
