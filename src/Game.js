/** @import { Game, Move } from "boardgame.io" */
import { TurnOrder } from "boardgame.io/core"
import { INVALID_MOVE } from "boardgame.io/core"

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
      score: 0,
      bag: [],
      handTile: null,
    }
    const player2 = player1,
      player3 = player1,
      player4 = player1
    player1.bag.length = 36
    player1.bag
      .fill("F", 0, 12)
      .fill("E", 12, 24)
      .fill("D1", 24, 27)
      .fill("D2", 27, 30)
      .fill("D3", 30, 33)
      .fill("D4", 33, 36)

    player1.bag = random.Shuffle(player1.bag)
    player2.bag = random.Shuffle(player1.bag)
    player3.bag = random.Shuffle(player1.bag)
    player4.bag = random.Shuffle(player1.bag)

    player1.bag.pop() //delete 2 elements
    player1.bag.pop()
    player2.bag.pop()
    player2.bag.pop()
    player3.bag.pop()
    player3.bag.pop()
    player4.bag.pop()
    player4.bag.pop()

    player1.handTile = player1.bag.pop()
    player2.handTile = player2.bag.pop()
    player3.handTile = player3.bag.pop()
    player1.handTile = player4.bag.pop()
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
        //null - not occupied. 0 - occupied by player 1. 1 - occupied by player 2
        //2 - occupied by player 3. 3 - occupied by player 4
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
    //clicktile fertig schreiben!!!!!!!
    clickTile: function clickTile(state, id, player1, player2) {
      //player 1 player 2 ... etc. machen
      if (state.G[id].occ != null || state.G[id].type === "W") {
        return INVALID_MOVE
      }
      state.G[id].occ = state.ctx.currentPlayer
    },
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
