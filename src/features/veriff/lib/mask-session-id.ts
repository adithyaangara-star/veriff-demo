export const maskSessionId = (sessionId: string): string => {
  if (sessionId.length <= 10) {
    return sessionId;
  }
  return `${sessionId.slice(0, 5)}…${sessionId.slice(-5)}`;
};
