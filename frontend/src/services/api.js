const API_BASE = "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API ${response.status}: ${text}`);
    }

    return response.json();
}

export function startGame(situation, mode) {
    return request("/game/start", {
        method: "POST",
        body: JSON.stringify({ situation, mode }),
    });
}

export function advanceGame(state, branch) {
    return request("/game/advance", {
        method: "POST",
        body: JSON.stringify({ state, branch }),
    });
}

export function makeWorse(state) {
    return request("/game/worse", {
        method: "POST",
        body: JSON.stringify({ state }),
    });
}

export function addEvidence(state, evidence) {
    return request("/game/evidence", {
        method: "POST",
        body: JSON.stringify({ state, evidence }),
    });
}

export function getRandomScenario() {
    return request("/scenarios/random");
}