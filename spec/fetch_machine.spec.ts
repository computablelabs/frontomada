import { interpret } from 'xstate'
import { factory } from '../src/machines/fetch'

describe('fetch finite state machine', () => {
  it('begins as idle', () => {
    let m = factory()
    expect(m.initialState.value).toBe('idle')
  })

  it('progesses to fetched with updated payload on success', done => {
    // stub the global fetch to simulate
    // @ts-ignore
    global.fetch = function(resource, opts) {
      return new Promise((resolve, reject) => {
        resolve({
          ok: true,
          id: '1',
          json: () => { return {foo: 'bar'}; }
        });
      });
    };

    let started = interpret(factory()).onTransition(state => {
      // console.log(state.value) // what state the machine is in
      // console.log(state.context) // what is in the context obv...

      // when we get to 'loaded' the payload will have been set
      if (state.matches({ activated: 'fetched'})) {
        expect(state.context.payload.foo).toBe('bar')
        done()
      }
    }).start()

    // machine should progress thru to fetched with our stubbed return
    started.send('ACTIVATE', { resource: 'https://foo.bar' })
  })
})
