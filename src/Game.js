/** @import { Game, Move } from "boardgame.io" */
import { TurnOrder } from "boardgame.io/core"

function getNeighbours(board) {
  let countRow = 1
  for (const tile of board) {
    if (tile.type === "W") {
      continue
    }
    //if ((countRow & 1) === 1)
    if (tile.id < 12) {
      tile.neighbours = [tile.id - 1, tile.id + 1, tile.id + 10, tile.id + 11] //oben
    } else if (tile.id > 198) {
      tile.neighbours = [tile.id - 1, tile.id + 1, tile.id - 12, tile.id - 11] //unten
    } else if (tile.id % 11 === 0) {
      tile.neighbours = [tile.id - 1, tile.id - 11, tile.id + 11] //rechts
    } else if (tile.id % 11 === 1) {
      tile.neighbours = [tile.id + 1, tile.id + 11, tile.id - 11] //links
    } else {
      tile.neighbours = [
        tile.id - 1,
        tile.id + 1,
        tile.id + 12,
        tile.id + 11,
        tile.id - 11,
        tile.id - 10,
      ]
    }
    countRow++
  }
}

/** @type {Game} */
export const Game = {
  setup: ({ random, ctx }) => {
    // W = Wasser
    // D = Dorf
    // E = Electricity
    // P = Plain
    // F = Farmland
    // C = Castle
    // M = Cathedral
    const kategorien = `
WDDWEDCPWWW
ECWCEEPDWWW
WEWDDEDWWWW
WWEEECWWWWW
WDECFPWDMFF
DPEFMDCDFDM
WCEPFDDPFCD
WDECFPEDFDW
WWEEEFCEPFW
WCDMFPDECWW
WFFDFEMEDDW
WWFCEECEWWW
WFFFEDEEDDF
FCDPMDEMDCF
WWDWPDECPFF
WWWWCPEEFFW
WWWWFFPMPCW
WWWFDFCDDWW
WWWFCDPWWWW
`
    let id = 1
    const board = []
    for (const kategorie of kategorien) {
      if (kategorie == "\n") {
        continue
      }
      const Tile = {
        id: id,
        type: kategorie,
        occ: null, //occ - occupied
      }
      id++
      board.push(Tile)
    }

    getNeighbours(board)
    return board
  },

  moves: {
    /** @type {Move} */
    //playCard: ({ G, ctx, playerID, events, random }, cardIndex) => {},
    //drawCard(ctx) {},
    clickTile: function clickTile(move, tileID) {},
  },

  seed: "random-seed",

  turn: {
    order: TurnOrder.DEFAULT,

    onBegin: ({ G, ctx, events, random }) => {},
    onEnd: ({ G, ctx, events, random }) => {},

    minMoves: 1,
    maxMoves: 1,
  },

  minPlayers: 2,
  maxPlayers: 4,

  disableUndo: true,

  endIf: ({ G, ctx, random }) => {},
}
