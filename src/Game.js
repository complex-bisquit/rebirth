/** @import { Game, Move } from "boardgame.io" */

import { TurnOrder } from "boardgame.io/core"

import { INVALID_MOVE } from "boardgame.io/core"

function isGameOver(G, ctx) {
  const player = G.player

  for (let i = 0; i < ctx.numPlayers; i++) {
    if (player[i].handTile !== undefined) {
      return null
    }
  }

  let bestPlayer = {
    score: 0,
    id: 0,
  }

  for (let i = 0; i < ctx.numPlayers; i++) {
    if (player[i].score > bestPlayer.score) {
      bestPlayer.score = player[i].score
      bestPlayer.id = player[i].id
    }
  }

  return bestPlayer
}

function searchScore(state, curID) {
  //elec & farm scoring
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

  //village scoring
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

    //influence tracking
    let mostInfluence = {
      score: 0,
      id: 0,
    }
    let secondMostInfluence = {
      score: 0,
      id: 0,
    }

    let checkInfluence = Array(state.ctx.numPlayers).fill(0)
    let wasUnOcc = 0

    for (let goodTile of visited) {
      if (goodTile.occ === null) {
        wasUnOcc += 1
        break
      }
    }

    if (wasUnOcc === 0) {
      for (let i = 0; i < visited.length; i++) {
        const goodPlayer = visited[i].occ
        checkInfluence[goodPlayer] += visited[i].influence
      }

      // console.log("checking checkInfl", checkInfluence)
      for (let i = 0; i < checkInfluence.length; i++) {
        //HELL 3rd edition
        if (checkInfluence[i] > mostInfluence.score) {
          mostInfluence.score = checkInfluence[i]
          mostInfluence.id = i
          //console.dir("Check most Influence", mostInfluence)
        }

        if (
          checkInfluence[i] <= mostInfluence.score &&
          checkInfluence[i] > secondMostInfluence.score &&
          mostInfluence.id !== i
        ) {
          secondMostInfluence.score = checkInfluence[i]
          secondMostInfluence.id = i
          //console.log("Check secmost Influence", secondMostInfluence)
        }
      }

      if (visited.length === 2) {
        mostInfluence.score = 5
        secondMostInfluence.score = 3
      } else if (visited.length === 3) {
        mostInfluence.score = 8
        secondMostInfluence.score = 5
      }

      //console.log(
      //  "Check most and secmost Influence",
      //  mostInfluence,
      //  secondMostInfluence,
      //)

      state.G.player[mostInfluence.id].score += mostInfluence.score
      state.G.player[secondMostInfluence.id].score += secondMostInfluence.score
    }
  }
}

function getNeighbours(board) {
  let offset = 0 // HELL

  for (const tile of board) {
    if (tile.type === "W") {
      tile.neighbours = [] // does this break things??
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
    offset = 0
  }
}

function updateCastleOcc(state, ctx, id) {
  let allNeighCastles = []
  let occNearCastle = Array(ctx.numPlayers).fill(0)
  let board = state.G.board

  // getting all neighbouring castles to the clicked tile
  for (let possCastle of board[id - 1].neighbours) {
    possCastle = board[possCastle]

    if (possCastle.type === "C" && possCastle.occ !== null) {
      allNeighCastles.push(possCastle)
      // console.log("all Neigh Castles: ", JSON.stringify(allNeighCastles))
    }
  }

  for (let castle of allNeighCastles) {
    for (let neighbourC of castle.neighbours) {
      if (board[neighbourC - 1].occ !== null) {
        occNearCastle[board[neighbourC - 1].occ]++
      }
    }

    //checking occupation around castle
    let mostOcc = {
      score: 0,
      id: null,
    }

    for (let i = 0; i < occNearCastle.length; i++) {
      if (mostOcc.score < occNearCastle[i]) {
        mostOcc.score = occNearCastle[i]
        mostOcc.id = i
      } else if (mostOcc.score === occNearCastle[i]) {
        mostOcc.id = castle.firstPlayerID
      }
    }

    castle.occ = mostOcc.id
  }
}

// wtf we broke everything
// I KNOW HOW TO FIX :D
// and it's actually fixed now

function castleScoring(G, ctx) {
  let board = G.board
  let player = G.player

  for (let tile of board) {
    if (tile.type == "C" && tile.occ !== null) {
      player[tile.occ].score += 5
    }
  }
}

// TODO FIX something's broken
function portScoring(G, ctx, id) {
  console.log("called port scoring")
  let board = G.board
  let player = G.player
  console.log(board[id - 1].port, board[id - 1].occ)

  if (board[id - 1].port === true) {
    console.log("port", player[board[id - 1].occ].score)
    player[board[id - 1].occ].score++ // undefined
  }
}

/** @type {Game} */
export const Game = {
  setup: ({ random, ctx }) => {
    // TODO player colours
    const colours = [
      "rgb(134, 7, 7)",
      "rgb(2, 0, 145)",
      "rgb(0, 0, 0)",
      "rgb(255, 255, 255)",
    ]

    let playerRelated = []

    for (let i = 0; i < ctx.numPlayers; i++) {
      const player = {
        id: i,
        colour: colours[i],
        score: 0,
        bag: [],
        handTile: null,
        itemSave: [],
      }

      player.bag.length = 36
      player.bag
        .fill("F", 0, 12)
        .fill("E", 12, 24)
        .fill(1, 24, 27) // Influence Points village
        .fill(2, 27, 30)
        .fill(3, 30, 33)
        .fill(4, 33, 36)

      // shuffle, get rid of 2 random items, get new handtile
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

    const portIds = [3, 19, 46, 79, 87, 141, 157, 204]

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
        port: false,
      }

      // plains extra
      if (kategorie === "P") {
        Tile.usedItem = null
      }

      // port extra
      if (portIds.includes(id + 1)) {
        Tile.port = true
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

    clickTile: function clickTile(state, id) {
      // HELL 2nd edition
      let board = state.G.board
      let currPlayer = state.ctx.currentPlayer
      let players = state.G.player

      if (
        board[id].occ != null ||
        board[id].type === "W" ||
        board[id].type === "C" ||
        board[id].type === "M"
      ) {
        return INVALID_MOVE
      } else if (
        // if village record influence
        board[id].type === "D" &&
        (players[currPlayer].handTile === 1 ||
          players[currPlayer].handTile === 2 ||
          players[currPlayer].handTile === 3 ||
          players[currPlayer].handTile === 4)
      ) {
        board[id].influence = players[currPlayer].handTile
      } else if (
        //if plains set used item to handTile
        board[id].type === "P" &&
        (players[currPlayer].handTile === "E" ||
          players[currPlayer].handTile === "F")
      ) {
        board[id].usedItem = players[currPlayer].handTile
      } else if (players[currPlayer].handTile !== board[id].type) {
        return INVALID_MOVE
      }

      board[id].occ = currPlayer

      // something something about castles
      // if not occ setting occ to currPlayer
      // or calling updateCastleOcc

      for (let checkCastle of board[id - 1].neighbours) {
        checkCastle = board[checkCastle]

        if (checkCastle.type === "C" && checkCastle.occ === null) {
          checkCastle.occ = currPlayer
          checkCastle.firstPlayerID = currPlayer
        } else if (checkCastle.type === "C") {
          updateCastleOcc(state, state.ctx, id)
        }
      }

      // port scoring TODO FIX
      // portScoring(state.G, state.ctx, id)

      // new handTile
      players[currPlayer].handTile = players[currPlayer].bag.shift()
      searchScore(state, id)

      // castle scoring at the end
      if (isGameOver(state.G, state.ctx)) {
        castleScoring(state.G, state.ctx)
      }
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
  numPlayers: 3,
  disableUndo: true,

  endIf: ({ G, ctx, random }) => {
    const player = G.player

    for (let i = 0; i < ctx.numPlayers; i++) {
      if (player[i].handTile !== undefined) {
        return null
      }
    }

    console.log("The End")

    let bestPlayer = {
      score: 0,
      id: 0,
    }

    for (let i = 0; i < ctx.numPlayers; i++) {
      if (player[i].score > bestPlayer.score) {
        bestPlayer.score = player[i].score
        bestPlayer.id = player[i].id
      }
    }

    return bestPlayer
  },
}
