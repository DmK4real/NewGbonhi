import { describe, expect, it } from 'vitest';
import { restoreFacesBoards, swapFacesTiles } from './facesPuzzle.js';
describe('visitor puzzle progress', () => {
  const portraits=[{id:'leila',tiles:Array.from({length:9},(_,i)=>({id:`piece-${i}`}))}];
  it('retains a saved arrangement during the game but discards missing, duplicate or foreign pieces', () => {
    const good=portraits[0].tiles.map(t=>t.id).reverse();
    expect(restoreFacesBoards(portraits,{leila:good},true).leila).toEqual(good);
    for(const bad of [good.slice(1),Array(9).fill('piece-1'),['foreign',...good.slice(1)]]) expect(restoreFacesBoards(portraits,{leila:bad},true).leila).toEqual(portraits[0].tiles.map(t=>t.id));
    expect(restoreFacesBoards(portraits,{leila:good},false).leila).toEqual(portraits[0].tiles.map(t=>t.id));
  });
  it('swaps by tap or keyboard without mutating other positions or the saved source', () => {
    const board=portraits[0].tiles.map(t=>t.id); const swapped=swapFacesTiles(board,0,8);
    expect(swapped[0]).toBe('piece-8'); expect(swapped[8]).toBe('piece-0');
    expect(board[0]).toBe('piece-0'); expect(swapped.slice(1,8)).toEqual(board.slice(1,8));
  });
});
