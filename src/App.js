import { Client } from "boardgame.io/client"
import { Local, SocketIO } from "boardgame.io/multiplayer"
import { resetOnClicks } from "./canvas"
import { Debug } from "boardgame.io/debug"
import { Game } from "./Game"

const isMultiplayer = import.meta.env.VITE_REMOTE === "true"

const multiplayer = isMultiplayer
  ? SocketIO({ server: "localhost:8000" })
  : Local()

class GameClient {
  constructor(rootElement) {
    this.rootElement = rootElement
    ;((this.client = Client({
      game: Game,
      debug: {
        collapseOnLoad: false,
        hideToggleButton: false,
        impl: Debug,
      },
    })),
      this.client.subscribe((state) => this.update(state)))
    this.client.start()
    this.attachListeners()
  }

  update(state) {
    resetOnClicks()
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // draw here
  }
}

const appElement = document.getElementById("app")
const app = new GameClient(appElement)
