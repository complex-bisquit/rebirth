/** @import { Game, Move } from "boardgame.io" */
import { TurnOrder } from "boardgame.io/core"

function getNeighbours(board) {
  let offset = 0 // HELL
  for (const tile of board) {
    offset = 0
    if (tile.type === "W") {
      continue
    }
    if ((tile.row & 1) === 1) {
      offset = 1
    }
    if (tile.id < 12) {
      // don't touch (for now)
      tile.neighbours = [tile.id - 1, tile.id + 1, tile.id + 10, tile.id + 11] //oben
    } else if (tile.id > 198) {
      tile.neighbours = [tile.id - 1, tile.id + 1, tile.id - 12, tile.id - 11] //unten
    } else if (tile.id % 11 === 0) {
      tile.neighbours = [tile.id - 1, tile.id - 11, tile.id + 11] //rechts
      if ((tile.row & 1) === 1) {
        tile.neighbours.push(tile.id + 10, tile.id - 12)
      }
    } else if (tile.id % 11 === 1) {
      tile.neighbours = [tile.id + 1, tile.id + 11, tile.id - 11] //links
      if ((tile.row & 1) === 0) {
        tile.neighbours.push(tile.id + 12, tile.id - 10)
      }
    } else {
      tile.neighbours = [
        tile.id - 1,
        tile.id + 1,
        tile.id + 12 - offset,
        tile.id + 11 - offset,
        tile.id - 10 - offset,
        tile.id - 11 - offset,
      ]
    }
  }
}

/** @type {Game} */
export const Game = {
  setup: ({ random, ctx }) => {
    const player1 = {
      score: 0
      bag: []
    }
    let score1 = 0,
      score2 = 0,
      score3 = 0,
      score4 = 0
    let bag1
      bag2,
      bag3,
      bag4 = []
    player1.bag.length = 36
    player1.bag
      .fill("F", 0, 12)
      .fill("E", 12, 24)
      .fill("D1", 24, 27)
      .fill("D2", 27, 30)
      .fill("D3", 30, 33)
      .fill("D4", 33, 36)
    player1.bag = random.Shuffle(player1.bag)
    bag2 = random.Shuffle(player1.bag
    )
    bag3 = random.Shuffle(bag4)
    bag4 = random.Shuffle(bag4)
    bag1.pop()//delete 2 elements
    bag1.pop()
    bag2.pop()
    bag2.pop()
    bag3.pop()
    bag3.pop()
    bag4.pop()
    bag4.pop()
    let handTile1 = bag1.pop()
    let handTile2 = bag2.pop()
    let handTile3 = bag3.pop()
    let handTile4 = bag4.pop()
    console.log(bag1, bag2, bag3, bag4)
    for (let i = 0; i < 36; i++) {}
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
    let rowNum = 0
    for (const kategorie of kategorien) {
      if (kategorie == "\n") {
        rowNum++
        continue
      }
      const Tile = {
        id: id,
        type: kategorie,
        occ: null, //occ - occupied
        row: rowNum,
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
