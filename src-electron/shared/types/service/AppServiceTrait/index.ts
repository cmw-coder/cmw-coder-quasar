import { Query, Tree } from 'web-tree-sitter';

export interface AppServiceTrait {
  init(): void;

  createQuery(queryString: string): Promise<Query>;

  parseTree(content: string): Promise<Tree>;
}
