/** @import { ClientState } from "boardgame.io/src/client/client" */
/** @import { Game } from "./Game" */

import { onClick } from "./canvas"

export function draw(
  /** @type {ClientState<[ReturnType<Game["setup"]>]>} */
  state,
  /** @type{Record<string, (...args: any[]) => void>} */
  moves,
) {
  const canvas = document.getElementById("canvas")
  const ctx = canvas.getContext("2d")
  console.dir(state)

  let x = 525
  let y = 25
  const a = (y / 2) * Math.sqrt(3)
  const b = y / 2

  hexagon(ctx, state, x, y, a, b)
  drawUI(state, ctx)

  onClick(x - a, y, 498, 9 * 2 * b + 10 * 4 * b, (mouseX, mouseY) => {
    mouseHandler(ctx, mouseX, mouseY, x, y, a, b, state, moves)
  })

  if (state.ctx.gameover) {
    const bestPlayer = state.ctx.gameover.id

    ctx.fillStyle = state.G.player[bestPlayer].colour
    ctx.font = "25px Times New Roman"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("WINNER: player " + (bestPlayer + 1), 1150, 340)
  }
}
function drawUI(state, ctx) {
  let currPlayer = state.ctx.currentPlayer

  ctx.fillStyle = state.G.player[currPlayer].colour
  ctx.strokeStyle = "black"
  ctx.font = "30px Times New Roman"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // right side of ui
  ctx.strokeRect(1050, 0, 200, 75)
  ctx.strokeRect(1050, 125, 200, 375)
  ctx.strokeRect(1050, 550, 200, 75)
  ctx.strokeRect(1050, 725, 200, 75)

  // current player
  ctx.fillText("player: " + (Number.parseInt(currPlayer) + 1), 1150, 40)

  // score per player
  ctx.fillText("scores: ", 1150, 170)

  for (let i = 0; i < state.ctx.numPlayers; i++) {
    ctx.fillStyle = state.G.player[i].colour
    ctx.fillText(
      "player" + (i + 1) + ": " + state.G.player[i].score,
      1150,
      230 + 60 * i,
    )
  }

  // current handTile
  ctx.fillStyle = state.G.player[currPlayer].colour

  const dorfCheck =
    typeof state.G.player[currPlayer].handTile === "number"
      ? "D" + state.G.player[currPlayer].handTile
      : state.G.player[currPlayer].handTile
  ctx.fillText("hand: " + dorfCheck, 1150, 590)

  // two saved items
  ctx.fillText(state.G.player[currPlayer].itemSave, 1150, 760)
}

function mouseHandler(ctx, mouseX, mouseY, x, y, a, b, state, moves) {
  let curSmallestLine = Number.MAX_SAFE_INTEGER
  let smallID = 0
  const middle = []

  for (let countRow = 1; countRow < 20; countRow++) {
    for (let i = 1; i < 12; i++) {
      middle.push({
        x: x - 1,
        y: y + 2 * b - 1,
        id: state.G.board[i - 1 + (countRow - 1) * 11].id,
      })
      x += 2 * a
    }

    if ((countRow & 1) === 0 && countRow !== 1) {
      y += 3 * b
      x -= 23 * a
    } else {
      y += 3 * b
      x -= 21 * a
    }
  }

  for (let curPoint of middle) {
    const line = Math.sqrt(
      Math.pow(curPoint.x - mouseX, 2) + Math.pow(curPoint.y - mouseY, 2),
    )

    if (curSmallestLine > line) {
      curSmallestLine = line
      smallID = curPoint.id - 1
    }
  }

  moves.clickTile(smallID)

  //for (let neighbour of state.G.board[smallID].neighbours) {
  // ctx.fillStyle = "white"
  //  ctx.fillRect(middle[neighbour - 1].x, middle[neighbour - 1].y, 5, 5)
  //  }
}

function hexagon(ctx, state, x, y, a, b) {
  // background
  ctx.fillStyle = "rgb(10, 160, 180)"
  ctx.fillRect(500, 0, 525, 800)

  for (let countRow = 1; countRow < 20; countRow++) {
    for (let i = 1; i < 12; i++) {
      ctx.beginPath()
      const tile = state.G.board[i - 1 + (countRow - 1) * 11]

      // colour per hexagon
      if (tile.type === "W") {
        ctx.fillStyle = "rgb(3, 174, 197)"
      } else if (tile.type === "D") {
        ctx.fillStyle = "rgb(204, 136, 10)"
      } else if (tile.type === "E") {
        ctx.fillStyle = "rgb(92, 142, 146)"
      } else if (tile.type === "P") {
        ctx.fillStyle = "rgb(11, 182, 19)"
      } else if (tile.type === "F") {
        ctx.fillStyle = "rgb(13, 138, 13)"
      } else if (tile.type === "C") {
        ctx.fillStyle = "rgb(167, 95, 149)"
      } else {
        ctx.fillStyle = "rgb(193, 196, 60)"
      }

      // this is how we draw one hexagon
      ctx.strokeStyle = "rgb(22, 19, 19)"
      ctx.moveTo(x, y)
      ctx.lineTo(x - a, y + b)
      ctx.lineTo(x - a, y + 3 * b)
      ctx.lineTo(x, y + 4 * b)
      ctx.lineTo(x + a, y + 3 * b)
      ctx.lineTo(x + a, y + b)
      ctx.closePath()
      if (tile.type !== "W") {
        ctx.fill()
      }
      if (tile.type !== "W") {
        ctx.stroke()
      }

      let plainsCheck = tile.type === "P" ? tile.usedItem : tile.type

      if (tile.occ !== null) {
        if (plainsCheck === "D") {
          plainsCheck = "D" + tile.influence
        }

        ctx.fillStyle = state.G.player[tile.occ].colour
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"
        ctx.font = "20px Times New Roman"
        ctx.fillText(plainsCheck, x - 1, y + 2 * b - 1)
      }

      x += 2 * a
    }

    if ((countRow & 1) === 0 && countRow !== 1) {
      y += 3 * b
      x -= 23 * a
    } else {
      y += 3 * b
      x -= 21 * a
    }
  }
}
