import { bestMove } from '../engine/minimax';
import { kalahGameSpec } from '../games/kalah';
import type { GameSpec, GameState } from '../engine/types';

const DEPTH = 8;

type SnapshotOf<T> = T extends GameSpec<infer Snap, any> ? Snap : never;

export function botTurn(
    gameState: GameState<SnapshotOf<typeof kalahGameSpec>>
) {
    return bestMove(kalahGameSpec, gameState, gameState.currentPlayer, DEPTH);
}
