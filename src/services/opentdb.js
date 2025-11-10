// base endpoint for questions
const BASE_QUESTIONS = 'https://opentdb.com/api.php';
// categories endpoint
const BASE_CATEGORIES = 'https://opentdb.com/api_category.php';

// delay helper (used by the rate limiter)
const delay = ms => new Promise(res => setTimeout(res, ms));

// keys for localStorage
const LAST_REQ_KEY = 'quizblitz:opentdb:lastReqAt'; // persist timestamp for last request
const CATS_CACHE_KEY = 'quizblitz:opentdb:categories';

/**
 * ensure ≥ minMs since last OpenTDB request (default 5s)
 * - Uses localStorage to coordinate across tabs.
 */
export async function ensureCooldown(minMs = 5000) {
    try {
        const now = Date.now();
        const lastReqTime = Number(localStorage.getItem(LAST_REQ_KEY) || 0);
        const elapsed = now - lastReqTime;
        const waitMs = minMs - elapsed;
        if (waitMs > 0) {
            await delay(waitMs); // IMPORTANT reminder: this line will always be executed in React Dev mode
        }
        // set immediately so parallel calls don't all pass at once
        localStorage.setItem(LAST_REQ_KEY, String(Date.now()));
    } catch {
        // if storage not available, just proceed without crashing
    }
}

/**
 * fetch questions now respects centralized cooldown.
 * RAW response: { response_code, results: [...] }
 */
export async function fetchOpenTdbRaw({
    amount = 10,
    category = '',
    difficulty = '',
    signal,
} = {}) {
    await ensureCooldown(5000); // rate-limit for Open Trivia DB API is 1 request per 5 seconds

    const qs = new URLSearchParams();
    qs.set('amount', String(amount));
    // qs.set('type', 'multiple');     // we want all kind all questions: true/false and/or multiple choices

    if (category) qs.set('category', String(category));
    if (difficulty) qs.set('difficulty', String(difficulty));

    const res = await fetch(`${BASE_QUESTIONS}?${qs.toString()}`, {
        signal,
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`OpenTDB request failed: ${res.status}`);
    return res.json(); // RAW response: { response_code, results: [...] }
}

/**
 * fetch and cache categories with TTL (default 24h)
 * - Returns normalized array: [{ id, name }]
 * - Uses centralized cooldown
 */
export async function fetchCategories({
    ttlMs = 24 * 60 * 60 * 1000,
    signal,
} = {}) {
    // 1) Try local cache first
    try {
        const raw = localStorage.getItem(CATS_CACHE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            const fresh =
                parsed &&
                typeof parsed.fetchedAt === 'number' &&
                Array.isArray(parsed.data) &&
                Date.now() - parsed.fetchedAt < ttlMs;

            if (fresh) {
                return parsed.data; // { id, name }[]
            }
        }
    } catch {
        // ignore cache errors
    }

    // 2) Not fresh/missing -> respect cooldown and fetch
    await ensureCooldown(5000);

    const res = await fetch(BASE_CATEGORIES, { signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`OpenTDB categories failed: ${res.status}`);
    const json = await res.json();

    // Normalize
    const data = Array.isArray(json?.trivia_categories)
        ? json.trivia_categories.map(c => ({ id: c.id, name: c.name }))
        : [];

    // 3) Save cache
    try {
        localStorage.setItem(
            CATS_CACHE_KEY,
            JSON.stringify({ fetchedAt: Date.now(), data })
        );
    } catch {
        // ignore storage errors
    }

    return data;
}
