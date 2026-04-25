import type { Character, Direction, Stage } from './types'

export const moves: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
}

export const keyToDirection: Record<string, Direction> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
}

function isSameCell(
  a: Pick<Character, 'x' | 'y'>,
  b: Pick<Character, 'x' | 'y'>,
) {
  return a.x === b.x && a.y === b.y
}

function isFloor(stage: Stage, x: number, y: number) {
  if (x < 0 || y < 0 || x >= stage.width || y >= stage.height) {
    return false
  }

  return stage.tiles[y][x] === 'floor'
}

export function canMove(stage: Stage, x: number, y: number, blocked: Character) {
  return isFloor(stage, x, y) && !isSameCell({ x, y }, blocked)
}

function isLookingAt(stage: Stage, observer: Character, target: Character) {
  const move = moves[observer.dir]
  let x = observer.x + move.dx
  let y = observer.y + move.dy

  while (isFloor(stage, x, y)) {
    if (target.x === x && target.y === y) {
      return true
    }

    x += move.dx
    y += move.dy
  }

  return false
}

function hasEyeContact(stage: Stage) {
  return (
    isLookingAt(stage, stage.red, stage.player) &&
    isLookingAt(stage, stage.player, stage.red)
  )
}

export function updateRedAfterPlayer(
  stage: Stage,
  redWasReadyToMove: boolean,
  playerMoved: boolean,
) {
  if (stage.redFrozen) {
    return stage
  }

  let nextStage = stage

  if (redWasReadyToMove && playerMoved) {
    const move = moves[stage.red.dir]
    const nextX = stage.red.x + move.dx
    const nextY = stage.red.y + move.dy

    if (canMove(stage, nextX, nextY, stage.player)) {
      nextStage = {
        ...stage,
        red: {
          ...stage.red,
          x: nextX,
          y: nextY,
        },
      }
    }
  }

  if (hasEyeContact(nextStage)) {
    return {
      ...nextStage,
      redWillMoveNextTurn: false,
      redFrozen: true,
    }
  }

  return {
    ...nextStage,
    redWillMoveNextTurn: isLookingAt(nextStage, nextStage.red, nextStage.player),
  }
}
