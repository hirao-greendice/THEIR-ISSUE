import type { Stage } from './types'

export const initialStage: Stage = {
  width: 7,
  height: 7,
  tiles: [
    ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],
    ['floor', 'wall', 'wall', 'floor', 'wall', 'wall', 'floor'],
    ['floor', 'floor', 'floor', 'floor', 'floor', 'wall', 'floor'],
    ['wall', 'floor', 'wall', 'wall', 'floor', 'floor', 'floor'],
    ['floor', 'floor', 'floor', 'wall', 'floor', 'wall', 'floor'],
    ['floor', 'wall', 'floor', 'floor', 'floor', 'floor', 'floor'],
    ['floor', 'floor', 'floor', 'wall', 'floor', 'floor', 'floor'],
  ],
  player: {
    x: 0,
    y: 0,
    dir: 'down',
  },
  red: {
    x: 0,
    y: 2,
    dir: 'right',
  },
  redWillMoveNextTurn: false,
  redFrozen: false,
  camera: {
    x: 0,
    y: 0,
    w: 7,
    h: 7,
  },
}
