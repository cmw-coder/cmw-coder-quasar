export const historyToHash = (historyRoute: URL) => {
  return new URL(
    `${historyRoute.protocol}//${historyRoute.host}/#${historyRoute.pathname}${historyRoute.search}`
  );
};
