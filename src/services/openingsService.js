import fs from 'fs';
import path from 'path';
import { moveStringToMoveCoords, toFen } from '../../../chss-module-engine/src/engine/engine';
import chessTools from '../../chess-tools';

const binFile = path.resolve('./data/openings/codekiddy.bin');
let _finder;
const finderAwaiters = [];

const getFinder = () => new Promise(resolve => {
  if (_finder) return resolve(_finder);
  finderAwaiters.push(resolve);
});

const book = new chessTools.OpeningBooks.Polyglot;
const readStream = fs.createReadStream(binFile);
book.load_book(readStream);

book.on('loaded', () => {
  _finder = book.find.bind(book);
  finderAwaiters.forEach(resolve => resolve(_finder));
});

export const getMoveFromBooks = async(game) => {
  const finder = await getFinder();
  const fen = toFen(game);
  const entries = finder(fen);
  if (!entries) return null;

  return moveStringToMoveCoords(entries[0]._algebraic_move);
};
