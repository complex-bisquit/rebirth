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
  let x = 530
  let y = 25
  const a = (y / 2) * Math.sqrt(3)
  const b = y / 2
  hexagon(ctx, state, x, y, a, b)
  onClick(x - a, y, 498, 9 * 2 * b + 10 * 4 * b, (mouseX, mouseY) => {
    mouseHandler(ctx, mouseX, mouseY, x, y, a, b, state, moves)
  })
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
  ctx.fillStyle = state.G.player[state.ctx.currentPlayer].colour
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  ctx.font = "20px Times New Roman"
  ctx.fillText(
    state.G.board[smallID].type,
    middle[smallID].x,
    middle[smallID].y,
  )
  // ctx.fillRect(middle[smallID].x, middle[smallID].y, 5, 5)
  console.log(smallID)

  for (let neighbour of state.G.board[smallID].neighbours) {
    ctx.fillStyle = "white"
    ctx.fillRect(middle[neighbour - 1].x, middle[neighbour - 1].y, 5, 5)
  }
}

function hexagon(ctx, state, x, y, a, b) {
  for (let countRow = 1; countRow < 20; countRow++) {
    for (let i = 1; i < 12; i++) {
      ctx.beginPath()
      const tile = state.G.board[i - 1 + (countRow - 1) * 11]

      if (tile.type === "W") {
        ctx.fillStyle = "blue"
      } else if (tile.type === "D") {
        ctx.fillStyle = "brown"
      } else if (tile.type === "E") {
        ctx.fillStyle = "grey"
      } else if (tile.type === "P") {
        ctx.fillStyle = "rgb(0,255,0)"
      } else if (tile.type === "F") {
        ctx.fillStyle = "rgb(7, 143, 7)"
      } else if (tile.type === "C") {
        ctx.fillStyle = "purple"
      } else {
        ctx.fillStyle = "yellow"
      }
      ctx.strokeStyle = "rgb(22, 19, 19)"
      ctx.moveTo(x, y)
      ctx.lineTo(x - a, y + b)
      ctx.lineTo(x - a, y + 3 * b)
      ctx.lineTo(x, y + 4 * b)
      ctx.lineTo(x + a, y + 3 * b)
      ctx.lineTo(x + a, y + b)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      if (tile.occ !== null) {
        ctx.fillStyle = "black"
        ctx.fillRect(x - 1, y + 2 * b - 1, 2, 2)
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
