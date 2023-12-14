import { SymbolInfo } from 'main/types/SymbolInfo';

export const parseSymbolString = (symbolString: string): SymbolInfo[] => {
  return symbolString.length > 2
    ? symbolString
        .substring(1, symbolString.length - 1)
        .split('||')
        .map((substring) => {
          const [name, path, startLine, endLine] = substring.split('|');
          return {
            name,
            path: path.replace(/\\\\/g, '/'),
            startLine: parseInt(startLine),
            endLine: parseInt(endLine),
          };
        })
    : [];
};

export const parseTabString = (tabString: string): string[] => {
  return tabString.match(/.*?\.([ch])/g) ?? [];
};
