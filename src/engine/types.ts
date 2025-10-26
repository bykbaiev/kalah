export type PlayerID = 0 | 1;

export type GameState<Snapshot = unknown> = {
    currentPlayer: PlayerID;
    ended: boolean;
    snapshot: Snapshot;
};

export type Action<AType extends string = string, APayload = any> = {
    type: AType;
    payload?: APayload;
};

export interface GameSpec<Snapshot, A extends Action> {
    setup: () => GameState<Snapshot>;
    legalActions: (G: GameState<Snapshot>) => A[];
    reducer: (G: GameState<Snapshot>, a: A) => GameState<Snapshot>;
    winner: (G: GameState<Snapshot>) => PlayerID | null;
    evaluate: (G: GameState<Snapshot>, me: PlayerID) => number;
}
