export type Tile = 'floor' | 'wall'

export type Direction = 'up' | 'down' | 'left' | 'right'

export type Character = {
  x: number
  y: number
  dir: Direction
}

export type Stage = {
  width: number
  height: number
  tiles: Tile[][]
  player: Character
  red: Character
  redWillMoveNextTurn: boolean
  redFrozen: boolean
  camera: {
    x: number
    y: number
    w: number
    h: number
    padding?: number
  }
}
