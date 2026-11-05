export type Which = { rating: string; count: string } | null;
export declare function checkTarget(c?: { CHECK_MODE: string; CHECK_TARGETS: Record<string, { href: string; newTab: boolean }> }): { href: string; attrs: string };
export declare function parseWhich(html: string): Which;
export declare function fetchWhich(url?: string, fetchFn?: typeof fetch): Promise<Which>;
export declare function renderHome(html: string, o: { daleOn: boolean; headline: string; check: { href: string; attrs: string }; which: Which; town: string }): string;
export declare function buildHome(publicDir: string, c?: unknown): Promise<void>;
