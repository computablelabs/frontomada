import { Machine } from 'xstate'

interface PromiseSchema {
  states: {
    pending: {};
    resolved: {};
    rejected: {};
  };
}

type PromiseEvent = { type: 'RESOLVE' } | { type: 'REJECT' }

interface PromiseContext {}

export const promiseMachine = Machine<PromiseContext, PromiseSchema, PromiseEvent>({
  key: 'promise',
  initial: 'pending',
  context: { data: null },
  states: {
    pending: {
      on: {
        RESOLVE: 'resolved',
        REJECT: 'rejected',
      }
    },
    resolved: {
      type: 'final',
    },
    rejected: {
      type: 'final',
    },
  },
})
