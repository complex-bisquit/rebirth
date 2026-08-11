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

function searchScoreEF(state, curID) {
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
}

function villNeighbours(state, curID) {
  const board = state.G.board
  const players = state.G.player

  if (board[curID].type !== "D") {
    return []
  }
  let curCurID = board[curID]
  let unvisited = [curCurID]
  let visited = []

  while (unvisited.length !== 0) {
    for (let tileID of curCurID.neighbours) {
      const tile = board[tileID - 1]

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
  return visited
}

function setVillOcc(state, id) {
  const board = state.G.board
  const visited = villNeighbours(state, id)
  let currPlayer = state.ctx.currentPlayer
  let players = state.G.player

  let wasOcc = 0

  for (let someTile of visited) {
    if (someTile.occ !== null) {
      wasOcc += 1
      break
    }
  }

  if (wasOcc === 0) {
    const occPlayer = players[currPlayer].id
    for (let vill of visited) {
      vill.firstPlayerID = occPlayer
    }
  }
}

function searchScoreV(state, curID) {
  //village scoring
  const board = state.G.board
  const players = state.G.player
  const visited = villNeighbours(state, curID)

  if (board[curID].type !== "D") {
    return
  }

  //influence tracking
  let mstInfl = {
    score: 0,
    id: 0,
  }
  let secMstInfl = {
    score: 0,
    id: 0,
  }

  let inflPlayer = Array(state.ctx.numPlayers).fill(0)
  let wasUnOcc = 0

  for (let someTile of visited) {
    if (someTile.occ === null) {
      wasUnOcc += 1
      break
    }
  }

  if (wasUnOcc === 0) {
    // counting all influence per player
    for (let i = 0; i < visited.length; i++) {
      const occPlayer = visited[i].occ
      inflPlayer[occPlayer] += visited[i].influence
    }

    // getting player with most influence
    for (let i = 0; i < inflPlayer.length; i++) {
      //HELL 3rd edition

      // if player has more infl than mstInfl.score
      if (inflPlayer[i] > mstInfl.score) {
        mstInfl.score = inflPlayer[i]
        mstInfl.id = i
      }
    }

    for (let j = 0; j < inflPlayer.length; j++) {
      // if player has secMstInfl (<=)
      if (
        inflPlayer[j] <= mstInfl.score &&
        inflPlayer[j] > secMstInfl.score &&
        mstInfl.id !== j
      ) {
        secMstInfl.score = inflPlayer[j]
        secMstInfl.id = j
      }
    }

    let vScore = 0
    let vScore2 = 0
    let vPlayer = null
    let vPlayer2 = null
    const villID = visited[0].id - 1

    if (visited.length === 1) {
      // player gets points based on influence
      vPlayer = board[villID].occ
      vScore = board[villID].influence
      players[vPlayer].score += vScore
      //
    } else if (visited.length === 2) {
      if (mstInfl.score === secMstInfl.score) {
        // player who first occ village gets points
        vScore = 5
        vPlayer = board[villID].firstPlayerID
        players[vPlayer].score += vScore
        //
      } else if (secMstInfl.score === 0) {
        // if only one player occs everything
        vScore = 5
        vPlayer = board[villID].firstPlayerID
        vScore2 = 3
        vPlayer2 = vPlayer
        players[vPlayer].score += vScore
        players[vPlayer2].score += vScore2
        //
      } else {
        vScore = 5
        vScore2 = 3
        vPlayer = mstInfl.id
        vPlayer2 = secMstInfl.id
        players[vPlayer].score += vScore
        players[vPlayer2].score += vScore2
      }
      //
    } else if (visited.length === 3) {
      if (secMstInfl.score === 0) {
        // if only one player occs everything
        vScore = 8
        vPlayer = board[villID].firstPlayerID
        vScore2 = 5
        vPlayer2 = vPlayer
        players[vPlayer].score += vScore
        players[vPlayer2].score += vScore2
        //
      } else if (mstInfl.score === secMstInfl.score) {
        // player who first occ village gets points
        vScore = 5
        vPlayer = board[villID].firstPlayerID
        vScore2 = 3
        for (let tile of visited) {
          if (tile.occ !== board[villID].firstPlayerID) {
            vPlayer2 = tile.occ
            break
          }
        }
        players[vPlayer].score += vScore
        players[vPlayer2].score += vScore2
        // and i am deliberately choosing to ignore any three way ties
        // maybe ill fix this one day
      } else {
        vScore = 8
        vScore2 = 5
        vPlayer = mstInfl.id
        vPlayer2 = secMstInfl.id
        console.log("play1, play2", vPlayer, vPlayer2)
        players[vPlayer].score += vScore
        players[vPlayer2].score += vScore2
      }
    }
  }
}

// somethings broken
// TODO fix
function endSearchScoreV(state) {
  const board = state.G.board
  const players = state.G.player

  for (let tile of board) {
    if (tile.type !== "D") {
      continue
    }
    const visited = villNeighbours(state, tile.id)

    let occCount = 0
    for (let checkOcc of visited) {
      if (checkOcc.occ === null) occCount += 1
    }
    if (occCount > 0) {
      let inflPlayer = Array(state.ctx.numPlayers).fill(0)
      for (let i = 0; i < visited.length; i++) {
        const occPlayer = visited[i].occ
        console.log("occPlayer", occPlayer)
        inflPlayer[occPlayer] += visited[i].influence
      }

      for (let i = 0; i < inflPlayer.length; i++) {
        console.log("inflPlayer", inflPlayer[i])
        players[i].score += inflPlayer[i]
      }
    }
  }
}

function setNeighbours(board) {
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
  const board = state.G.board

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
  const board = G.board
  const player = G.player

  for (let tile of board) {
    if (tile.type == "C" && tile.occ !== null) {
      player[tile.occ].score += 5
    }
  }
}

function portScoring(G, ctx, id) {
  const board = G.board
  const player = G.player

  if (board[id].port === true) {
    player[board[id].occ].score++
  }
}

/** @type {Game} */
export const Game = {
  setup: ({ random, ctx }) => {
    ctx.numPlayers = 2
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

      if (ctx.numPlayers === 4) {
        player.bag.length = 27
        player.bag
          .fill("F", 0, 9)
          .fill("E", 9, 18)
          .fill(1, 18, 21) // Influence Points village
          .fill(2, 21, 23)
          .fill(3, 23, 25)
          .fill(4, 25, 27)
      } else {
        player.bag.length = 36
        player.bag
          .fill("F", 0, 12)
          .fill("E", 12, 24)
          .fill(1, 24, 27) // Influence Points village
          .fill(2, 27, 30)
          .fill(3, 30, 33)
          .fill(4, 33, 36)
      }

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
      if (portIds.includes(id)) {
        Tile.port = true
      }

      id++
      board.push(Tile)
    }

    let gameState = {
      board: board,
      player: playerRelated,
    }

    setNeighbours(board)

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
        setVillOcc(state, id)
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

      portScoring(state.G, state.ctx, id)

      // new handTile
      players[currPlayer].handTile = players[currPlayer].bag.shift()
      searchScoreEF(state, id)
      searchScoreV(state, id)

      // castle scoring at the end
      if (isGameOver(state.G, state.ctx)) {
        //castleScoring(state.G, state.ctx)
        endSearchScoreV(state)
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
