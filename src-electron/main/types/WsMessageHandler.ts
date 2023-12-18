import { WsMessageMapping } from 'shared/types/WsMessage';

export class WsMessageHandler {
  private _handlers = new Map<
    keyof WsMessageMapping,
    (message: unknown) => void
  >();

  handleAction<T extends keyof WsMessageMapping>(message: WsMessageMapping[T]) {
    this._handlers.get(message.action)?.(message);
  }

  registerMessage<T extends keyof WsMessageMapping>(
    action: T,
    callback: (message: WsMessageMapping[T]) => void
  ) {
    this._handlers.set(action, <(message: unknown) => void>callback);
  }
}
