import { GameSpec, GameState, PlayerID } from '../engine/types';
import { KalahAction, KalahSnapshot, PitIdx } from './types';

const isPitIdx = (idx: number): idx is PitIdx => idx >= 0 && idx <= 5;

const getAction = (idx: number): KalahAction | null => {
    if (!isPitIdx(idx)) {
        return null;
    }

    return { type: 'play', payload: { pit: idx } };
};

const fillPits = (value: number): Record<PitIdx, number> => {
    return {
        0: value,
        1: value,
        2: value,
        3: value,
        4: value,
        5: value,
    };
};

const getRestStones = (pits: Record<PitIdx, number>): number => {
    return Object.values(pits).reduce((s, x) => s + x, 0);
};

const endIfNeeded = (
    snapshot: KalahSnapshot
): {
    ended: boolean;
    snapshot: KalahSnapshot;
} => {
    const next = structuredClone(snapshot);
    const side0Empty = Object.values(next.pits[0]).every((x) => x === 0);
    const side1Empty = Object.values(next.pits[1]).every((x) => x === 0);

    if (!side0Empty && !side1Empty) {
        return { ended: false, snapshot: next };
    }

    if (!side0Empty) {
        next.stores[0] += getRestStones(next.pits[0]);
        next.pits[0] = fillPits(0);
    }

    if (!side1Empty) {
        next.stores[1] += getRestStones(next.pits[1]);
        next.pits[1] = fillPits(0);
    }

    return { ended: true, snapshot: next };
};

class KalahGameSpec implements GameSpec<KalahSnapshot, KalahAction> {
    setup(): GameState<KalahSnapshot> {
        return {
            currentPlayer: 0,
            ended: false,
            snapshot: {
                stores: { 0: 0, 1: 0 },
                pits: {
                    0: { 0: 4, 1: 4, 2: 4, 3: 4, 4: 4, 5: 4 },
                    1: { 0: 4, 1: 4, 2: 4, 3: 4, 4: 4, 5: 4 },
                },
            },
        };
    }

    legalActions(G: GameState<KalahSnapshot>): KalahAction[] {
        const currentPlayer = G.currentPlayer;
        const pits = G.snapshot.pits[currentPlayer];

        return Array.from({ length: 6 }, (_, i) => {
            if (!isPitIdx(i)) {
                return null;
            }

            return pits[i] !== 0 ? getAction(i) : null;
        }).filter((action): action is KalahAction => action !== null);
    }

    reducer(
        G: GameState<KalahSnapshot>,
        a: KalahAction
    ): GameState<KalahSnapshot> {
        if (G.ended) {
            return G;
        }

        const payload = a.payload;

        if (!payload) {
            return G;
        }

        const me = G.currentPlayer;
        const otherPlayer: PlayerID = me === 0 ? 1 : 0;

        const snapshot = structuredClone(G.snapshot);
        const pit = payload.pit;
        let stones = snapshot.pits[me][pit];

        if (stones <= 0) {
            return G;
        }

        snapshot.pits[me][pit] = 0;

        let side = me;
        let idx = pit + 1;

        while (stones > 0) {
            if (side === me && idx === 6) {
                // my store
                snapshot.stores[me]++;
                stones--;

                if (stones === 0) {
                    const { ended, snapshot: nextSnapshot } =
                        endIfNeeded(snapshot);
                    return { currentPlayer: me, ended, snapshot: nextSnapshot };
                }

                side = otherPlayer;
                idx = 0;
                continue;
            }

            if (side === otherPlayer && idx === 6) {
                // skip opponent store
                side = me;
                idx = 0;
                continue;
            }

            if (!isPitIdx(idx)) {
                return G;
            }

            snapshot.pits[side][idx]++;
            stones--;

            if (stones === 0 && side === me && snapshot.pits[side][idx] === 1) {
                const opposite = (5 - idx) as PitIdx;
                const captured = snapshot.pits[otherPlayer][opposite];

                if (captured > 0) {
                    snapshot.pits[otherPlayer][opposite] = 0;
                    snapshot.pits[me][idx] = 0;
                    snapshot.stores[me] += captured + 1;
                }
            }

            idx++;

            if (idx > 6) {
                // change the side
                side = side === 0 ? 1 : 0;
                idx = 0;
            }
        }

        const { ended, snapshot: nextSnapshot } = endIfNeeded(snapshot);
        const nextPlayer = (1 - me) as PlayerID;

        return { currentPlayer: nextPlayer, ended, snapshot: nextSnapshot };
    }

    winner(G: GameState<KalahSnapshot>): PlayerID | null {
        if (!G.ended) {
            return null;
        }

        const [fst, snd] = Object.values(G.snapshot.stores);

        if (fst === snd) {
            return null;
        }

        return fst > snd ? 0 : 1;
    }

    evaluate(G: GameState<KalahSnapshot>, me: PlayerID): number {
        const [fst, snd] = Object.values(G.snapshot.stores);
        const diff = (fst - snd) * (me === 0 ? 1 : -1);

        // small bonus for pit stones on my side to encourage captures
        const myPits = Object.values(G.snapshot.pits[me] || {}).reduce(
            (s, x) => s + x,
            0
        );
        return diff * 20 + myPits;
    }
}

export const kalahGameSpec = new KalahGameSpec();
