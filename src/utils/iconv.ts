const decoder = new TextDecoder('GBK');

export const b64GbkToUtf8 = (b64String: string) => {
  return decoder.decode(
    Uint8Array.from(atob(b64String), (c) => c.charCodeAt(0)),
  );
};
