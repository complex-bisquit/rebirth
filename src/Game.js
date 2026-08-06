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
      }
      visited.push(curCurID)
      curCurID = unvisited[1]
      unvisited.shift()
    }
    state.G.player[state.ctx.currentPlayer].score += visited.length
  }
  if (state.G.board[curID].type === "D") {
    let curCurID = state.G.board[curID]
    let unvisited = [curCurID]
    let visited = []
    while (unvisited.length !== 0) {
      for (let tileID of curCurID.neighbours) {
        const tile = state.G.board[tileID - 1]
        if (visited.includes(tile) || unvisited.includes(tile)) {
          continue
        }
        if (tile.type === curCurID.type) {
          unvisited.push(tile)
        }
      }
      visited.push(curCurID)
      curCurID = unvisited[1]
      unvisited.shift()
    }
    let mostInfluence = {
      score: 0,
      id: 0,
    }
    let secondMostInfluence = {
      score: 0,
      id: 0,
    }
    let checkInfluence = Array(state.ctx.numPlayers).fill(0)
    let wasEmpty = 0
    for (let goodTile of visited) {
      if (goodTile.occ === null) {
        wasEmpty += 1
        break
      }
    }
    if (wasEmpty === 0) {
      for (let i = 0; i < visited.length; i++) {
        const goodPlayer = visited[i].occ
        checkInfluence[goodPlayer] += visited[i].influence
      }
      console.log("checking checkInfl", checkInfluence)
      for (let i = 0; i < checkInfluence.length; i++) {
        //HELL 3rd edition
        if (checkInfluence[i] > mostInfluence.score) {
          mostInfluence.score = checkInfluence[i]
          mostInfluence.id = i
          console.dir("Check most Influence", mostInfluence)
        }
        if (
          checkInfluence[i] <= mostInfluence.score &&
          checkInfluence[i] > secondMostInfluence.score &&
          mostInfluence.id !== i
        ) {
          secondMostInfluence.score = checkInfluence[i]
          secondMostInfluence.id = i
          console.log("Check secmost Influence", secondMostInfluence)
        }
      }
      if (visited.length === 2) {
        mostInfluence.score = 5
        secondMostInfluence.score = 3
      } else if (visited.length === 3) {
        mostInfluence.score = 8
        secondMostInfluence.score = 5
      }
      console.log(
        "Check most and secmost Influence",
        mostInfluence,
        secondMostInfluence,
      )
      state.G.player[mostInfluence.id].score += mostInfluence.score
      state.G.player[secondMostInfluence.id].score += secondMostInfluence.score
    }
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

// wtf we broke everything
function castleScoring(G, ctx) {
  console.log("start c score")
  let allCastles = []
  let occNearCastle = Array(ctx.numPlayers).fill(0)

  console.log("starting search c")
  for (let possCastle of G.board) {
    if (possCastle.type === "C") {
      allCastles.push({ ...possCastle })
    }
  }

  console.log("starting neighbours check", allCastles)
  for (let castle of allCastles) {
    console.log("castles")
    for (let neighbourC of castle.neighbours) {
      console.log("vor if")
      if (neighbourC.occ !== null) {
        console.log("found one")
        occNearCastle[neighbourC.occ]++
      }
    }

    let mostOcc = {
      score: 0,
      id: null,
    }
    console.log("scoring")
    for (let i = 0; i < occNearCastle.length; i++) {
      if (mostOcc.score < occNearCastle[i]) {
        mostOcc.score = occNearCastle[i]
        mostOcc.id = i
        console.log(mostOcc)
      } else if (mostOcc.score === occNearCastle[i]) {
        mostOcc.id = castle.firstPlayerID
        console.log(castle.firstPlayerID)
      }
    }
    castle.occ = mostOcc.id
    console.log(castle.occ)
    G.player[castle.occ].score += 5
    console.log(G.player[castle.occ].score)
  }
}

/** @type {Game} */
export const Game = {
  setup: ({ random, ctx }) => {
    const colours = ["red", "rgb(0, 71, 112)", "orange", "black"]
    let playerRelated = []

    for (let i = 0; i < ctx.numPlayers; i++) {
      const player = {
        score: 0,
        bag: [],
        handTile: null,
        id: i,
        colour: colours[i],
        itemSave: [],
      }
      player.bag.length = 36
      player.bag
        .fill("F", 0, 12)
        .fill("E", 12, 24)
        .fill(1, 24, 27)
        .fill(2, 27, 30) // Influence Points
        .fill(3, 30, 33)
        .fill(4, 33, 36)

      player.bag = random.Shuffle(player.bag)
      player.itemSave.push(player.bag.pop())
      player.itemSave.push(player.bag.pop())
      player.handTile = player.bag.pop()
      playerRelated.push(player)
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
        (state.G.player[state.ctx.currentPlayer].handTile === 1 ||
          state.G.player[state.ctx.currentPlayer].handTile === 2 ||
          state.G.player[state.ctx.currentPlayer].handTile === 3 ||
          state.G.player[state.ctx.currentPlayer].handTile === 4)
      ) {
        state.G.board[id].influence =
          state.G.player[state.ctx.currentPlayer].handTile
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

      for (let checkCastle of state.G.board[id].neighbours) {
        if (checkCastle.type === "C" && checkCastle.occ === null) {
          checkCastle.occ = state.ctx.currentPlayer
          checkCastle.firstPlayerID = state.ctx.currentPlayer
          console.log("first ", checkCastle.firstPlayerID)
        }
      }

      state.G.player[state.ctx.currentPlayer].handTile =
        state.G.player[state.ctx.currentPlayer].bag.shift()
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
    for (let i = 0; i < ctx.numPlayers; i++) {
      if (player[i].handTile !== undefined) {
        return null
      }
    }
    console.log("ende")
    // castleScoring(G, ctx)
    let bestPlayer = {
      bigScore: 0,
      id: 0,
    }
    for (let i = 0; i < ctx.numPlayers; i++) {
      if (player[i].score > bestPlayer.bigScore) {
        bestPlayer.bigScore = player[i].score
        bestPlayer.id = player[i].id
      }
    }
    console.log("BEST ONE: ", bestPlayer)
    return bestPlayer
  },
}
