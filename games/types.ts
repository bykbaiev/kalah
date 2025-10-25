import { Action, GameState, PlayerID } from '../engine/types';

export type PitIdx = 0 | 1 | 2 | 3 | 4 | 5;

export type KalahSnapshot = {
    stores: Record<PlayerID, number>;
    pits: Record<PlayerID, Record<PitIdx, number>>;
};

export type KalahGameState = GameState<KalahSnapshot>;

export type KalahAction = Action<'play', { pit: PitIdx }>;
