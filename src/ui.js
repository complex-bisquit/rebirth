/** @import { ClientState } from "boardgame.io/src/client/client" */
/** @import { Game } from "./Game" */

export function draw(
  /** @type {ClientState<[ReturnType<Game["setup"]>]>} */
  state,
  /** @type{Record<string, (...args: any[]) => void>} */
  moves,
) {
  const canvas = document.getElementById("canvas")
  const ctx = canvas.getContext("2d")
  console.dir(state)
  hexagon(ctx, state.G, 1050, 25)
}

function hexagon(ctx, board, x, y) {
  const a = (y / 2) * Math.sqrt(3)
  const b = y / 2
  for (let countRow = 1; countRow < 20; countRow++) {
    if ((countRow & 1) === 0 && countRow !== 1) {
      y += 3 * b
      x -= 21 * a
    } else {
      y += 3 * b
      x -= 23 * a
    }
    for (let i = 1; i < 12; i++) {
      ctx.beginPath()
      const tile = board[i - 1 + (countRow - 1) * 11]
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

      ctx.moveTo(x, y)
      ctx.lineTo(x - a, y + b)
      ctx.lineTo(x - a, y + 3 * b)
      ctx.lineTo(x, y + 4 * b)
      ctx.lineTo(x + a, y + 3 * b)
      ctx.lineTo(x + a, y + b)
      ctx.closePath()
      ctx.fill()
      x += 2 * a
    }
  }
}
