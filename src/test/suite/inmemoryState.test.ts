import assert from 'assert';
import { InmemoryState } from '../../inmemoryState';

describe('inmemoryState', () => {
  it('should get a value', async () => {
    const state = new InmemoryState();
    await state.update('alma', false);
    assert.equal(state.get('alma'), false);
  });

  it('should get a value with a default', async () => {
    const state = new InmemoryState();
    assert.equal(state.get('alma'), undefined);
    assert.equal(state.get('alma', false), false);
  });

  it('should not modify the state when getting with default and the cache hits a miss', async () => {
    const state = new InmemoryState();
    assert.equal(state.get('alma', false), false);
    const actual = state.keys();
    assert.equal(actual.length, 0);
  });

  it('should retrieve the keys', async () => {
    const state = new InmemoryState();
    await state.update('alma', false);
    await state.update('korte', 36);
    const actual = state.keys();
    assert.equal(actual.length, 2);
    assert.equal(actual.includes('alma'), true);
    assert.equal(actual.includes('korte'), true);
  });

  it('should update with new value', async () => {
    const state = new InmemoryState();
    await state.update('alma', false);
    assert.equal(state.get('alma'), false);
    await state.update('alma', 36);
    assert.equal(state.get('alma'), 36);
    const actual = state.keys();
    assert.equal(actual.length, 1);
    assert.equal(actual.includes('alma'), true);
  });

  it('should remove when the update value is undefined', async () => {
    const state = new InmemoryState();
    await state.update('alma', false);
    assert.equal(state.get('alma'), false);
    await state.update('alma', undefined);
    assert.equal(state.get('alma'), undefined);
    const actual = state.keys();
    assert.equal(actual.length, 0);
  });
});
