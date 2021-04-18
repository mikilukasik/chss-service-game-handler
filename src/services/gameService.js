import fs from 'fs';
import path from 'path';

export const gameService = (() => {
  return {
    saveGame: (game) => new Promise((resolve, reject) => 
      fs.writeFile(path.resolve(`./games/${game.id}.json`), JSON.stringify(game), 'utf8', (err, res) => err ? reject(err) : resolve(res))),
  };
})();
