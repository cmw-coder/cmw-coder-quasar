const decoder = new TextDecoder('GBK');

export const b64GbkToUtf8 = (b64String: string) => {
  return decoder.decode(Buffer.from(b64String, 'base64'));
};

export const plainGbkToUtf8 = (rawString: string) => {
  return decoder.decode(Buffer.from(rawString));
}
