import { StateMachine, Machine, assign } from 'xstate'

// fetch is still undefined by ts, so define it here
declare function fetch(resource: object | string, opts: object | undefined | null): Promise<any>

// TODO we may want to change this to an XHR2 if fetch support is lacking

// our fetch machine may only ever be in one of these states
export interface FetchSchema {
  states: {
    idle: {}; // think i like this better than 'unactivated'
    activated: { // once activated will never return to idle. will only be in the following set
      states: {
        fetching: {};
        fetched: {};
        failed: {};
      };
    };
  };
}

export interface FetchContext {
  resource?: object | string; // fetch api Resource object or url string
  opts?: object; // fetch api 'init' object
  payload?: any; // likely json or stringified json
}

export interface FetchEvent {
  type: string;
  resource?: object | string;
  opts?: object;
}

// the function invoked by the machine for the fetch then can be generic
async function invoked(ctx: FetchContext): Promise<any> {
  if (ctx.resource) {
    // NOTE: as stated above this could be refactored to an XHR2 if needed
    return fetch(ctx.resource, ctx.opts).then(response => response.json())
  }
}

export function factory(): StateMachine<FetchContext, FetchSchema, FetchEvent> {
  return Machine<FetchContext, FetchSchema, FetchEvent>({
    id: 'fetch',
    initial: 'idle',
    context: {
      resource: undefined,
      opts: undefined,
      payload: undefined,
    },
    states: {
      idle: {},
      activated: {
        initial: 'fetching',
        states: {
          fetching: {
            invoke: {
              id: 'fetcher',
              src: invoked,
              onDone: {
                target: 'fetched',
                actions: assign({
                  // NOTE: data is an automagic contstruct from xstate here
                  payload: (ctx, e) => e.data
                }),
              },
              onError: {
                target: 'failed',
                actions: assign({
                  // an error is an acceptable payload as well
                  payload: (ctx, e) => e.data
                }),
              },
            }
          },
          fetched: {},
          failed: {},
        }
      },
    },
    on: {
      ACTIVATE: {
        target: '.activated',
        actions: assign({
          resource: (ctx, e) => e.resource
        }),
      },
    },
  })
}
