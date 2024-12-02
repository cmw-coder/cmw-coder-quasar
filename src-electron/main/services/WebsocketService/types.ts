import { IncomingMessage, ServerResponse } from 'http';
import type { WebSocket } from 'ws';

export interface ClientInfo {
  client: WebSocket;
  currentFile?: string;
  currentProject: string;
  version: string;
}

export enum HttpContentType {
  FORM = 'application/x-www-form-urlencoded',
  JSON = 'application/json',
  UNKNOWN = 'UNKNOWN',
}

// noinspection JSUnusedGlobalSymbols
export enum HttpMethod {
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
  UNKNOWN = 'UNKNOWN',
}

export class HttpRequest {
  constructor(private _request: IncomingMessage) {}

  body<T = string>() {
    return new Promise<T>((resolve, reject) => {
      let body = '';
      this._request.on('data', (chunk) => (body += chunk.toString()));
      this._request.on('end', () => {
        const contentType = this.contentType;
        switch (contentType) {
          case HttpContentType.FORM: {
            const parsedBody = new URLSearchParams(body);
            const bodyObject: Record<string, string> = {};
            for (const [key, value] of parsedBody) {
              bodyObject[key] = value;
            }
            resolve(<never>bodyObject);
            break;
          }
          case HttpContentType.JSON: {
            try {
              resolve(JSON.parse(body));
            } catch (error) {
              reject(error);
            }
            break;
          }
          default: {
            resolve(<never>body);
          }
        }
      });
      this._request.on('error', (error) => reject(error));
    });
  }

  get contentType() {
    console.log('contentType', this._request.headers['content-type']);
    if (this._request.headers['content-type'] ?? '' in HttpContentType) {
      return this._request.headers['content-type'] as HttpContentType;
    } else {
      return HttpContentType.UNKNOWN;
    }
  }

  get method() {
    if (this._request.method ?? '' in HttpMethod) {
      return this._request.method as HttpMethod;
    } else {
      return HttpMethod.UNKNOWN;
    }
  }

  get url() {
    return this._request.url;
  }
}

export class HttpResponse {
  constructor(private _response: ServerResponse) {}

  setStatusCode(statusCode: number) {
    this._response.statusCode = statusCode;
  }

  setHeader(name: string, value: string) {
    this._response.setHeader(name, value);
  }

  sendJson(body: unknown) {
    this.setHeader('Content-Type', 'application/json');
    this._response.end(JSON.stringify(body, undefined, 2));
  }
}

export class HttpRouter {
  private _routes = new Map<
    string,
    Map<
      HttpMethod,
      (req: HttpRequest, res: HttpResponse) => void | Promise<void>
    >
  >();

  addRoute(
    path: string,
    method: HttpMethod,
    handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>,
  ) {
    const methodMap = this._routes.get(path);
    if (!methodMap) {
      this._routes.set(
        path,
        new Map<
          HttpMethod,
          (req: HttpRequest, res: HttpResponse) => void | Promise<void>
        >([[method, handler]]),
      );
    } else {
      methodMap.set(method, handler);
    }
  }

  async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const request = new HttpRequest(req);
    const response = new HttpResponse(res);
    const methodMap = this._routes.get(request.url ?? '');
    if (!methodMap) {
      response.setStatusCode(404);
      response.sendJson({ message: 'Path not found' });
      return;
    }

    const route = methodMap.get(request.method);
    if (!route) {
      response.setStatusCode(405);
      response.sendJson({ message: 'Method not allowed' });
      return;
    }

    try {
      await route(request, response);
    } catch (error) {
      response.setStatusCode(500);
      response.sendJson({
        message: 'Internal server error',
        reason: (<Error>error).message,
      });
    }
  }
}
