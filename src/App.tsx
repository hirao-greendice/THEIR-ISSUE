import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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

const INPUT_LOCK_MS = 120

function isInVisibleArea(
  x: number,
  y: number,
  visibleArea: { startX: number; startY: number; width: number; height: number },
) {
  return (
    x >= visibleArea.startX &&
    y >= visibleArea.startY &&
    x < visibleArea.startX + visibleArea.width &&
    y < visibleArea.startY + visibleArea.height
  )
}

function App() {
  const [stage, setStage] = useState<Stage>(initialStage)
  const inputLockedRef = useRef(false)
  const inputUnlockTimerRef = useRef<number | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const movePlayer = useCallback((nextDir: Direction) => {
    if (inputLockedRef.current) {
      return
    }

    inputLockedRef.current = true
    inputUnlockTimerRef.current = window.setTimeout(() => {
      inputLockedRef.current = false
      inputUnlockTimerRef.current = null
    }, INPUT_LOCK_MS)

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
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const nextDir = keyToDirection[event.key]

      if (!nextDir) {
        return
      }

      event.preventDefault()

      if (event.repeat) {
        return
      }

      movePlayer(nextDir)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (inputUnlockTimerRef.current !== null) {
        window.clearTimeout(inputUnlockTimerRef.current)
      }
    }
  }, [movePlayer])

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
        onTouchStart={(event) => {
          const touch = event.touches[0]

          touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
          }
        }}
        onTouchMove={(event) => {
          event.preventDefault()
        }}
        onTouchEnd={(event) => {
          const touchStart = touchStartRef.current
          const touch = event.changedTouches[0]

          touchStartRef.current = null

          if (!touchStart) {
            return
          }

          const dx = touch.clientX - touchStart.x
          const dy = touch.clientY - touchStart.y
          const absDx = Math.abs(dx)
          const absDy = Math.abs(dy)
          const minSwipeDistance = 24

          if (Math.max(absDx, absDy) < minSwipeDistance) {
            return
          }

          const nextDir =
            absDx > absDy ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'

          movePlayer(nextDir)
        }}
        style={{
          '--visible-cols': visibleArea.width,
          '--visible-rows': visibleArea.height,
          gridTemplateColumns: `repeat(${visibleArea.width}, 1fr)`,
          gridTemplateRows: `repeat(${visibleArea.height}, 1fr)`,
        } as CSSProperties}
      >
        {Array.from({ length: visibleArea.height }).map((_, rowIndex) =>
          Array.from({ length: visibleArea.width }).map((__, colIndex) => {
            const x = visibleArea.startX + colIndex
            const y = visibleArea.startY + rowIndex
            const tile = stage.tiles[y][x]

            return (
              <div
                className={`cell ${tile}`}
                key={`${x}-${y}`}
                style={
                  tile === 'floor'
                    ? { backgroundImage: `url(${floorImage})` }
                    : undefined
                }
              />
            )
          }),
        )}
        {isInVisibleArea(stage.player.x, stage.player.y, visibleArea) && (
          <div
            className="character-token white-character"
            style={{
              '--x': stage.player.x - visibleArea.startX,
              '--y': stage.player.y - visibleArea.startY,
              zIndex: stage.player.y + 2,
            } as CSSProperties}
          >
            <img
              className="character"
              src={whiteImages[stage.player.dir]}
              alt="white character"
              draggable={false}
            />
          </div>
        )}
        {isInVisibleArea(stage.red.x, stage.red.y, visibleArea) && (
          <div
            className="character-token red-character"
            style={{
              '--x': stage.red.x - visibleArea.startX,
              '--y': stage.red.y - visibleArea.startY,
              zIndex: stage.red.y + 2,
            } as CSSProperties}
          >
            <img
              className="character"
              src={redImages[stage.red.dir]}
              alt="red character"
              draggable={false}
            />
          </div>
        )}
      </div>
      <div className="mobile-controls" aria-label="mobile controls">
        <button
          type="button"
          className="control-button control-up"
          aria-label="up"
          onClick={() => movePlayer('up')}
        >
          ▲
        </button>
        <button
          type="button"
          className="control-button control-left"
          aria-label="left"
          onClick={() => movePlayer('left')}
        >
          ◀
        </button>
        <button
          type="button"
          className="control-button control-right"
          aria-label="right"
          onClick={() => movePlayer('right')}
        >
          ▶
        </button>
        <button
          type="button"
          className="control-button control-down"
          aria-label="down"
          onClick={() => movePlayer('down')}
        >
          ▼
        </button>
      </div>
    </main>
  )
}

export default App
