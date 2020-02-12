import { promiseMachine } from '../src/machines/promise'

describe('promise finite state machine', () => {
  it('begins pending', () => {
    expect(promiseMachine.initialState.value).toBe('pending')
  })

  it('transitions to resolved', () => {
    const { initialState } = promiseMachine
    let nextState = promiseMachine.transition(initialState, 'RESOLVE')
    expect(nextState.value).toBe('resolved')
  })

  it('transitions to rejected', () => {
    const { initialState } = promiseMachine
    let nextState = promiseMachine.transition(initialState, 'REJECT')
    expect(nextState.value).toBe('rejected')
  })
})
