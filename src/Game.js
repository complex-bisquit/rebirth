/** @import { Game, Move } from "boardgame.io" */
import { TurnOrder } from "boardgame.io/core"
import { INVALID_MOVE } from "boardgame.io/core"
function searchScore(state, curID) {
  if (
    state.G.board[curID].type === "F" ||
    state.G.board[curID].type === "E" ||
    state.G.board[curID].type === "P"
  ) {
    let curCurID = state.G.board[curID]
    let unvisited = [curCurID]
    let visited = []
    while (unvisited.length !== 0) {
      for (let tileID of curCurID.neighbours) {
        const tile = state.G.board[tileID - 1]
        if (visited.includes(tile) || unvisited.includes(tile)) {
          continue
        }
        const tileType = tile.type === "P" ? tile.usedItem : tile.type
        const curCurType =
          curCurID.type === "P" ? curCurID.usedItem : curCurID.type

        if (tileType === curCurType && tile.occ === curCurID.occ) {
          unvisited.push(tile)
        }
        //console.log("arrays", unvisited, visited)
      }
      console.log("arrays", unvisited, visited)
      console.log(visited.push(curCurID))
      curCurID = unvisited[1]
      console.log(curCurID)
      console.log("", unvisited.shift())
    }
    state.G.player[state.ctx.currentPlayer].score += visited.length
    console.log(
      "idk how to name it",
      state.G.player[state.ctx.currentPlayer].score,
      unvisited,
      visited,
    )
  } else {
  }
}
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
      colour: "red",
      itemSave: [],
    }

    const player2 = {
      score: 0,
      bag: [],
      handTile: null,
      colour: "blue",
      itemSave: [],
    }

    const player3 = {
      score: 0,
      bag: [],
      handTile: null,
      colour: "orange",
      itemSave: [],
    }

    const player4 = {
      score: 0,
      bag: [],
      handTile: null,
      colour: "white",
      itemSave: [],
    }
    const colours = ["red", "blue", "orange", "white"]
    let playerRelated = []

    for (let i = 0; i < state.ctx.numPlayers; i++) {
      const player = {
        score: 0,
        bag: [],
        handTile: null,
        ID: i,
        colour: colours[i],
        itemSave: [],
      }
      player.bag.length = 36
      player.bag
        .fill("F", 0, 12)
        .fill("E", 12, 24)
        .fill("D1", 24, 27)
        .fill("D2", 27, 30)
        .fill("D3", 30, 33)
        .fill("D4", 33, 36)
      playerRelated[i].bag = random.Shuffle(player1.bag)
      playerRelated[i].itemSave.push(playerRelated[i].bag.pop())
      playerRelated[i].itemSave.push(playerRelated[i].bag.pop())
      playerRelated[i].handTile = playerRelated[i].bag.pop()
    }

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
      if (kategorie === "P") {
        Tile.usedItem = null
      }
      id++
      board.push(Tile)
    }

    let gameState = {
      board: board,
      player: playerRelated,
    }

    getNeighbours(board)

    return gameState
  },

  moves: {
    /** @type {Move} */
    //playCard: ({ G, ctx, playerID, events, random }, cardIndex) => {},
    //drawCard(ctx) {},
    //clicktile fertig schreiben!!!!!!!
    clickTile: function clickTile(state, id) {
      // HELL 2nd edition
      if (
        state.G.board[id].occ != null ||
        state.G.board[id].type === "W" ||
        state.G.board[id].type === "C" ||
        state.G.board[id].type === "M"
      ) {
        return INVALID_MOVE
      } else if (
        state.G.board[id].type === "D" &&
        (state.G.player[state.ctx.currentPlayer].handTile === "D1" ||
          state.G.player[state.ctx.currentPlayer].handTile === "D2" ||
          state.G.player[state.ctx.currentPlayer].handTile === "D3" ||
          state.G.player[state.ctx.currentPlayer].handTile === "D4")
      ) {
      } else if (
        state.G.board[id].type === "P" &&
        (state.G.player[state.ctx.currentPlayer].handTile === "E" ||
          state.G.player[state.ctx.currentPlayer].handTile === "F")
      ) {
        state.G.board[id].usedItem =
          state.G.player[state.ctx.currentPlayer].handTile
      } else if (
        state.G.player[state.ctx.currentPlayer].handTile !==
        state.G.board[id].type
      ) {
        return INVALID_MOVE
      }

      state.G.board[id].occ = state.ctx.currentPlayer

      state.G.player[state.ctx.currentPlayer].handTile =
        state.G.player[state.ctx.currentPlayer].bag.shift()
      console.log("MOIN")
      searchScore(state, id)
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

  endIf: ({ G, ctx, random }) => {
    const player = G.player
    if (
      player[0].bag.length === 0 &&
      player[1].bag.length === 0 &&
      player[2].bag.length === 0 &&
      player[3].bag.length === 0
    ) {
      let bestPlayer = {
        bigScore: 0,
        id: 0,
      }
      for (let i = 0; i < 4; i++) {
        if (player[i].score > bestPlayer.bigScore) {
          bestPlayer.bigScore = player[i].score
          bestPlayer.id = i
        }
      }
      console.log("BEST ONE: ", bestPlayer)
      return bestPlayer
    }
    return null
  },
}
