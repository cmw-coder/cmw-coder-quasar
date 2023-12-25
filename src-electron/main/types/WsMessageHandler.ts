import {
  WsClientMessageMapping,
  WsServerMessageMapping,
} from 'shared/types/WsMessage';

export class WsMessageHandler {
  private _handlers = new Map<
    keyof WsClientMessageMapping,
    (message: unknown) => unknown
  >();

  handleAction<T extends keyof WsClientMessageMapping>(
    message: WsClientMessageMapping[T]
  ) {
    return <WsServerMessageMapping[T]>(
      this._handlers.get(message.action)?.(message)
    );
  }

  registerMessage<T extends keyof WsClientMessageMapping>(
    action: T,
    callback: (message: WsClientMessageMapping[T]) => WsServerMessageMapping[T]
  ) {
    this._handlers.set(action, <(message: unknown) => unknown>callback);
  }
}
