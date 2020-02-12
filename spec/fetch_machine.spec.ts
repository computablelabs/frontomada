import { interpret } from 'xstate'
import { fetchFactory as factory } from '../src/machines'
import { FETCH_ERROR } from '../src/constants'

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
        })
      })
    }

    let started = interpret(factory()).onTransition(state => {
      // console.log(state.value) // what state the machine is in
      // console.log(state.context) // what is in the context obv...

      // when we get to 'loaded' the payload will have been set
      if (state.matches({ activated: 'fetched'})) {
        expect(state.context.payload.foo).toBe('bar')
        expect(state.context.error).toBeFalsy()
        done()
      }
    }).start()

    // machine should progress thru to fetched with our stubbed return
    started.send('ACTIVATE', { resource: 'https://foo.bar' })
  })

it('progesses to failed with updated error on non-ok', done => {
    // stub the global fetch to simulate
    // @ts-ignore
    global.fetch = function(resource, opts) {
      return new Promise((resolve, reject) => {
        resolve({
          ok: false,
          id: '2',
          json: () => {}
        })
      })
    }

    let started = interpret(factory()).onTransition(state => {
      if (state.matches({ activated: 'failed'})) {
        expect(state.context.payload).toBeFalsy()
        expect(state.context.error instanceof Error).toBe(true)
        done()
      }
    }).start()

    // machine should progress thru to fetched with our stubbed return
    started.send('ACTIVATE', { resource: 'https://b0r.kd' })
  })

  it('progesses to failed with updated payload on reject', done => {
    // @ts-ignore
    global.fetch = function(resource, opts) {
      return new Promise((resolve, reject) => {
        // we don't throw here cuz it bubbles out of the scope...
        reject(FETCH_ERROR)
      })
    }

    let started = interpret(factory()).onTransition(state => {
      if (state.matches({ activated: 'failed'})) {
        expect(state.context.payload).toBeFalsy()
        expect(state.context.error).toBe(FETCH_ERROR)
        done()
      }
    }).start()

    started.send('ACTIVATE', { resource: 'https://b0r.kd' })
  })
})
