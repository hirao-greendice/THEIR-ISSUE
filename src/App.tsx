import { useEffect, useMemo, useState } from 'react'
import floorImage from './assets/game/floor.png'
import redBackImage from './assets/game/redback.png'
import redFrontImage from './assets/game/redfront.png'
import redLeftImage from './assets/game/redleft.png'
import redRightImage from './assets/game/redright.png'
import whiteBackImage from './assets/game/whiteback.png'
import whiteFrontImage from './assets/game/whitefront.png'
import whiteLeftImage from './assets/game/whiteleft.png'
import whiteRightImage from './assets/game/whiteright.png'
import './App.css'
import {
  canMove,
  keyToDirection,
  moves,
  updateRedAfterPlayer,
} from './game/characterLogic'
import { initialStage } from './game/stage'
import type { Direction, Stage } from './game/types'

const whiteImages: Record<Direction, string> = {
  up: whiteBackImage,
  down: whiteFrontImage,
  left: whiteLeftImage,
  right: whiteRightImage,
}

const redImages: Record<Direction, string> = {
  up: redBackImage,
  down: redFrontImage,
  left: redLeftImage,
  right: redRightImage,
}

function App() {
  const [stage, setStage] = useState<Stage>(initialStage)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const nextDir = keyToDirection[event.key]

      if (!nextDir) {
        return
      }

      event.preventDefault()

      setStage((currentStage) => {
        const move = moves[nextDir]
        const nextX = currentStage.player.x + move.dx
        const nextY = currentStage.player.y + move.dy
        const playerMoved = canMove(currentStage, nextX, nextY, currentStage.red)

        const nextStage: Stage = {
          ...currentStage,
          player: {
            x: playerMoved ? nextX : currentStage.player.x,
            y: playerMoved ? nextY : currentStage.player.y,
            dir: nextDir,
          },
        }

        return updateRedAfterPlayer(
          nextStage,
          currentStage.redWillMoveNextTurn,
          playerMoved,
        )
      })
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const camera = stage.camera
  const cameraPadding = camera.padding ?? 0
  const visibleArea = useMemo(() => {
    const startX = Math.max(0, camera.x - cameraPadding)
    const startY = Math.max(0, camera.y - cameraPadding)
    const endX = Math.min(stage.width, camera.x + camera.w + cameraPadding)
    const endY = Math.min(stage.height, camera.y + camera.h + cameraPadding)

    return {
      startX,
      startY,
      width: endX - startX,
      height: endY - startY,
    }
  }, [camera.h, camera.w, camera.x, camera.y, cameraPadding, stage.height, stage.width])

  return (
    <main className="game-shell">
      <div
        className="game-area"
        style={{
          gridTemplateColumns: `repeat(${visibleArea.width}, 1fr)`,
          gridTemplateRows: `repeat(${visibleArea.height}, 1fr)`,
        }}
      >
        {Array.from({ length: visibleArea.height }).map((_, rowIndex) =>
          Array.from({ length: visibleArea.width }).map((__, colIndex) => {
            const x = visibleArea.startX + colIndex
            const y = visibleArea.startY + rowIndex
            const tile = stage.tiles[y][x]
            const hasPlayer = stage.player.x === x && stage.player.y === y
            const hasRed = stage.red.x === x && stage.red.y === y

            return (
              <div
                className={`cell ${tile}${hasPlayer || hasRed ? ' has-character' : ''}`}
                key={`${x}-${y}`}
                style={
                  tile === 'floor'
                    ? { backgroundImage: `url(${floorImage})` }
                    : undefined
                }
              >
                {hasPlayer && (
                  <img
                    className="character"
                    src={whiteImages[stage.player.dir]}
                    alt="white character"
                    draggable={false}
                  />
                )}
                {hasRed && (
                  <img
                    className="character"
                    src={redImages[stage.red.dir]}
                    alt="red character"
                    draggable={false}
                  />
                )}
              </div>
            )
          }),
        )}
      </div>
    </main>
  )
}

export default App
