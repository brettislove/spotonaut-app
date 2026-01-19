import { useCallback, useRef } from "react";
import { MAX_REQUESTS_PER_MINUTE } from "../constants/chat";

export function useRateLimit() {
  const requestTimestamps = useRef<number[]>([]);
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
