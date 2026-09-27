export const PERIOD_DAYS = 30;
export const PERIOD_MS = PERIOD_DAYS * 24 * 60 * 60 * 1000;
/** Enough history to compute the current period *and* the one before it. */
export const HISTORY_WINDOW_MS = PERIOD_MS * 2;
export const RECENT_TRANSACTIONS = 10;

export const PAGE_SIZE = 200;
/**
 * Hard stop on pagination. The metrics need every row in the 60-day window, but
 * the endpoint has no date filter, so we page until the window is covered — and
 * say so if this cap is ever hit rather than silently under-reporting.
 */
export const MAX_PAGES = 5;