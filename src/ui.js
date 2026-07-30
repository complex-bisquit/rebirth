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
  hexagon(ctx, state.G, 530, 25)
  const a = (25 / 2) * Math.sqrt(3)
  const b = 25 / 2
  ctx.fillStyle = "rgba(255,0,0,0.5)"
  ctx.fillRect(530 - a, 25, 498, 9 * 2 * b + 10 * 4 * b) //9 für even, 10 für uneven
}

function mouseHandler(mouseX, mouseY) {
	for (let i = 1; i < 12; i++) {
		if (i==11)
	}
}

function hexagon(ctx, board, x, y) {
  const a = (y / 2) * Math.sqrt(3)
  const b = y / 2
  for (let countRow = 1; countRow < 20; countRow++) {
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
      ctx.fillStyle = "black"
      ctx.fillRect(x - 1, y + 2 * b - 1, 2, 2)
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
