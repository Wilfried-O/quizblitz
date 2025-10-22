// smallest possible helper that returns RAW JSON (no decoding/shuffling)
const BASE = 'https://opentdb.com/api.php';

export async function fetchOpenTdbRaw({
    amount = 10,
    category = '',
    difficulty = '',
    signal,
} = {}) {
    // UPDATED
    const qs = new URLSearchParams();
    qs.set('amount', String(amount));
    qs.set('type', 'boolean'); // // keep it to True/False choice for now
    if (category) qs.set('category', String(category));
    if (difficulty) qs.set('difficulty', String(difficulty));

    const res = await fetch(`${BASE}?${qs.toString()}`, {
        signal,
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`OpenTDB request failed: ${res.status}`);
    return res.json(); // RAW response: { response_code, results: [...] }
}
