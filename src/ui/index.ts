import { kalahGameSpec } from '@/games/kalah';
import { botTurn } from '@/bots/play';
import { GameState } from '@/engine/types';
import { KalahSnapshot } from '@/games/types';

import './styles.css';

let gameState = kalahGameSpec.setup();

let botPlaying = false;

const updateGameState = (state: GameState<KalahSnapshot>) => {
    gameState = state;
    renderGame();

    if (!state.ended && state.currentPlayer === 1 && !botPlaying) {
        handleBotTurn();
    }
};

const resetGame = () => {
    botPlaying = false;
    gameState = kalahGameSpec.setup();
    renderGame();
};

const renderGame = () => {
    const app = document.getElementById('app');
    if (!app) return;

    const winner = kalahGameSpec.winner(gameState);

    const player0Pits = Object.entries(gameState.snapshot.pits[0]).map(
        ([idx, stones]) => ({
            idx: Number(idx),
            stones,
        })
    );

    const player1Pits = Object.entries(gameState.snapshot.pits[1])
        .map(([idx, stones]) => ({
            idx: Number(idx),
            stones,
        }))
        .reverse();

    const store0 = gameState.snapshot.stores[0];
    const store1 = gameState.snapshot.stores[1];

    app.innerHTML = `
        <div class="kalah-container">
            <div class="controls">
                <button class="new-game-btn" onclick="resetGame()">New Game</button>
            </div>

            <div class="player-info">
                <h2>Player 2 (Bot) ${
                    gameState.currentPlayer === 1 && !gameState.ended
                        ? '(Bot thinking...)'
                        : ''
                }</h2>
            </div>

            <div class="board">
                <!-- Left store (Bot) -->
                <div class="store store-1">
                    <div class="store-value">${store1}</div>
                </div>

                <!-- Middle section with both rows of pits -->
                <div class="pits-container">
                    <!-- Bot's pits (top row) -->
                    <div class="player-1-pits">
                        ${player1Pits
                            .map(
                                (pit) => `
                            <button 
                                class="pit" 
                                onclick="makeMove(1, ${pit.idx})"
                                disabled
                            >
                                <div class="marble-count">${pit.stones}</div>
                                ${Array.from({
                                    length: Math.min(pit.stones, 6),
                                })
                                    .map(() => `<div class="marble"></div>`)
                                    .join('')}
                            </button>
                        `
                            )
                            .join('')}
                    </div>

                    <!-- Player 1's pits (bottom row) -->
                    <div class="player-0-pits">
                        ${player0Pits
                            .map(
                                (pit) => `
                            <button 
                                class="pit" 
                                onclick="makeMove(0, ${pit.idx})"
                                ${
                                    gameState.currentPlayer !== 0 ||
                                    pit.stones === 0
                                        ? 'disabled'
                                        : ''
                                }
                            >
                                <div class="marble-count">${pit.stones}</div>
                                ${Array.from({
                                    length: Math.min(pit.stones, 6),
                                })
                                    .map(() => `<div class="marble"></div>`)
                                    .join('')}
                            </button>
                        `
                            )
                            .join('')}
                    </div>
                </div>

                <!-- Right store (Player 1's store) -->
                <div class="store store-0">
                    <div class="store-value">${store0}</div>
                </div>
            </div>

            <div class="player-info">
                <h2>Player 1 ${
                    gameState.currentPlayer === 0 ? '(Your turn)' : ''
                }</h2>
            </div>

            ${
                gameState.ended && winner !== null
                    ? `<div class="game-over">Game Over! Winner: Player ${
                          winner + 1
                      }</div>`
                    : ''
            }
        </div>
    `;
};

(window as any).makeMove = (player: number, pitIdx: number) => {
    if (gameState.ended || gameState.currentPlayer !== player) return;

    const actions = kalahGameSpec.legalActions(gameState);
    const action = actions.find((a) => a.payload?.pit === pitIdx);

    if (action) {
        updateGameState(kalahGameSpec.reducer(gameState, action));
    }
};

(window as any).resetGame = resetGame;

const handleBotTurn = async () => {
    if (gameState.ended) return;

    botPlaying = true;

    while (!gameState.ended && gameState.currentPlayer === 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (gameState.ended || gameState.currentPlayer !== 1) break;

        const botAction = botTurn(gameState);
        updateGameState(kalahGameSpec.reducer(gameState, botAction));
    }

    botPlaying = false;
};

renderGame();
