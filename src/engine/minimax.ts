import { Action, GameSpec, GameState, PlayerID } from './types';

export const bestMove = <Snapshot, A extends Action>(
    spec: GameSpec<Snapshot, A>,
    gameState: GameState<Snapshot>,
    me: PlayerID,
    depth: number
): A => {
    let best: { score: number; move: A | null } = {
        score: -Infinity,
        move: null,
    };

    const moves = spec.legalActions(gameState);

    for (const move of moves) {
        const next = spec.reducer(gameState, move);
        const score = minValue(spec, next, me, depth - 1, -Infinity, Infinity);

        if (score > best.score) {
            best = { score, move };
        }
    }

    if (!best.move) {
        if (moves.length > 0) {
            return moves[0];
        }

        throw new Error('No legal moves');
    }

    return best.move;
};

const getTerminalScore = <Snapshot, A extends Action>(
    spec: GameSpec<Snapshot, A>,
    gameState: GameState<Snapshot>,
    me: PlayerID,
    depth: number
): number | null => {
    const w = spec.winner(gameState);

    if (w !== null) {
        return w === me ? 1_000_000 : -1_000_000;
    }

    if (depth === 0) {
        return spec.evaluate(gameState, me);
    }

    return null;
};

const maxValue = <Snapshot, A extends Action>(
    spec: GameSpec<Snapshot, A>,
    gameState: GameState<Snapshot>,
    me: PlayerID,
    depth: number,
    alpha: number, // best score the maximizer can guarantee
    beta: number // best score the minimizer can guarantee
): number => {
    const terminalScore = getTerminalScore(spec, gameState, me, depth);

    if (terminalScore !== null) {
        return terminalScore;
    }

    let score = -Infinity;
    let alphaValue = alpha;

    for (const a of spec.legalActions(gameState)) {
        score = Math.max(
            score,
            minValue(
                spec,
                spec.reducer(gameState, a),
                me,
                depth - 1,
                alphaValue,
                beta
            )
        );

        if (score >= beta) {
            return score;
        }

        alphaValue = Math.max(alphaValue, score);
    }

    return score;
};

const minValue = <Snapshot, A extends Action>(
    spec: GameSpec<Snapshot, A>,
    gameState: GameState<Snapshot>,
    me: PlayerID,
    depth: number,
    alpha: number, // best score the maximizer can guarantee
    beta: number // best score the minimizer can guarantee
): number => {
    const terminalScore = getTerminalScore(spec, gameState, me, depth);

    if (terminalScore !== null) {
        return terminalScore;
    }

    let score = Infinity;
    let betaValue = beta;

    for (const a of spec.legalActions(gameState)) {
        score = Math.min(
            score,
            maxValue(
                spec,
                spec.reducer(gameState, a),
                me,
                depth - 1,
                alpha,
                betaValue
            )
        );

        if (score <= alpha) {
            return score;
        }

        betaValue = Math.min(betaValue, score);
    }

    return score;
};
