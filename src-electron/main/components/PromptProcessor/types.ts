class ListNode<T> {
  public prev: ListNode<T> | null = null;
  public next: ListNode<T> | null = null;

  constructor(public key: string, public value: T) {}
}

export class LRUCache<T> {
  private readonly capacity: number;
  private cache: Map<string, ListNode<T>> = new Map();
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  public get(key: string): T | undefined {
    const node = this.cache.get(key);
    if (!node) {
      return undefined;
    }
    this.removeNode(node);
    this.addToHead(node);
    return node.value;
  }

  public put(key: string, value: T) {
    const node = this.cache.get(key);
    if (node) {
      node.value = value;
      this.removeNode(node);
      this.addToHead(node);
    } else {
      const newNode = new ListNode(key, value);
      this.cache.set(key, newNode);
      this.addToHead(newNode);
      if (this.cache.size > this.capacity) {
        const tail = this.tail;
        if (!tail) {
          return;
        }
        this.cache.delete(tail.key);
        this.removeNode(tail);
      }
    }
  }

  private removeNode(node: ListNode<T>) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private addToHead(node: ListNode<T>) {
    if (this.head) {
      this.head.prev = node;
      node.next = this.head;
      this.head = node;
    } else {
      this.head = node;
      this.tail = node;
    }
  }
}
