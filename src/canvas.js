const canvas = document.getElementById("canvas")

// { x,y, height, width, handler)
const handlers = []

/**
 * Register a click handler for the given bounds
 * Will be called when a click event is received on the canvas, that is within the given bounds
 * @param x position from the left side of the canvas
 * @param y position from the top side of the canvas
 * @param width width of the clickable area
 * @param height height of the clickable area
 * @param handler function to be called when the click event is received
 */
export function onClick(x, y, width, height, handler) {
  handlers.push({
    x,
    y,
    width,
    height,
    handler,
  })
}

/**
 * Remove all click handlers
 */
export function resetOnClicks() {
  handlers.splice(0, handlers.length)
}

export function clearFrame() {
  const canvas = document.getElementById("canvas")
  const ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

const debug = false

canvas.addEventListener(
  "click",
  function (event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (debug) {
      console.log(`received click on x: ${x}, y: ${y}`)
    }
    let called = false

    // Collision detection between clicked offset and element.
    // Go through all registered handlers and call all that matches the click
    handlers.forEach(function (element) {
      if (
        y > element.y &&
        y < element.y + element.height &&
        x > element.x &&
        x < element.x + element.width
      ) {
        called = true
        if (debug) {
          console.log(
            `calling handler for x: ${x}, y: ${y}, with bounds x: ${element.x}, y: ${element.y}, width: ${element.width}, height: ${element.height}`,
          )
        }
        element.handler(x, y)
      }
    })

    if (!called && debug) {
      console.log(`no handler for x: ${x}, y: ${y} found, ignoting click`)
    }
  },
  false,
)

export function drawPicture(ctx, path, ...args) {
  const img = new Image()
  img.onload = function () {
    ctx.drawImage(img, ...args)
  }
  img.src = "/img/" + path
}
