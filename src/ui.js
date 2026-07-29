export function draw(state) {
  const canvas = document.getElementById("canvas")
  const ctx = canvas.getContext("2d")
	console.dir(state)
  hexagon(ctx, state.G, 100, 50)
}

function hexagon(ctx, board, x, y) {
  ctx.beginPath()
  let tile = board[0]
	if (board[0].type === "W") {
		ctx.fillStyle = "blue"
	}

  let a = (y / 2) * Math.sqrt(3)
  let b = y / 2

  ctx.moveTo(x, y)
  ctx.lineTo(x - a, y + b)
  ctx.lineTo(x - a, y + 3 * b)
  ctx.lineTo(x, y + 4 * b)
  ctx.lineTo(x + a, y + 3 * b)
  ctx.lineTo(x + a, y + b)
  ctx.closePath()
  ctx.fill()
}
