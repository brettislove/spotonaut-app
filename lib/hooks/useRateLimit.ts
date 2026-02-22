import { useCallback, useRef } from "react";
import { MAX_REQUESTS_PER_MINUTE } from "../constants/chat";

/**
 * Custom hook to manage rate limiting for API requests.
 * Ensures that the number of requests does not exceed the maximum allowed per minute.
 * @returns An object with a `checkRateLimit` function to verify if a request can be made.
 */
export function useRateLimit() {
  const requestTimestamps = useRef<number[]>([]);

  /**
   * Checks if a new request can be made based on the timestamps of previous requests.
   * If the number of requests in the last minute exceeds the limit, it returns false.
   * Otherwise, it records the current timestamp and returns true.
   * @returns {boolean} True if the request can be made, false if rate limit is exceeded.
   */
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    requestTimestamps.current = requestTimestamps.current.filter(
      (timestamp) => timestamp > oneMinuteAgo,
    );
    if (requestTimestamps.current.length >= MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    requestTimestamps.current.push(now);
    return true;
  }, []);

  return { checkRateLimit };
}
