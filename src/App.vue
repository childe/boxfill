<template>
  <div
    id="gamebox"
    style="height: {{constraints.y.max}}px; width: {{constraints.x.max}}px; border: solid black 1px"
  ></div>
</template>

<script>
import { SVG } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.draggable.js'

const width = 100
const height = 100

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  hashCode() {
    return `${this.x},${this.y}`
  }
}

class Dice {
  constructor(points) {
    this.points = points
    this.idx = 0
  }
  point() {
    return this.points[this.idx]
  }
  roll() {
    this.idx = Math.floor(Math.random() * this.points.length)
  }
  hashCode() {
    return this.points[this.idx].hashCode()
  }
}

export default {
  methods: {
    isBlocked(x, y) {
      return this.blocked.includes(`${x},${y}`)
    },
    width(piece) {
      let x1 = 0,
        x2 = 0
      for (let i = 0; i < piece['rects'].length; i++) {
        const rect = piece['rects'][i]
        x1 = Math.min(x1, rect['x'])
        x2 = Math.max(x2, rect['x'])
      }
      return x2 - x1 + 1
    },
    height(piece) {
      let y1 = 0,
        y2 = 0
      for (let i = 0; i < piece['rects'].length; i++) {
        const rect = piece['rects'][i]
        y1 = Math.min(y1, rect['y'])
        y2 = Math.max(y2, rect['y'])
      }
      return y2 - y1 + 1
    },

    rotatePiece(draw, piece) {
      let height = this.height(piece)
      for (let i = 0; i < piece['rects'].length; i++) {
        const rect = piece['rects'][i]
        let x = rect['x']
        let y = rect['y']

        rect['x'] = -y + height - 1
        rect['y'] = x
        console.log('rotate', x, y, 'to', rect['x'], rect['y'])
      }
      console.log('rotatePiece', piece['rects'])
      this.drawPiece(draw, piece)
    },

    moveGroupToPieceBox(group, piece) {
      let center = piece['center']
      group.move(
        (center['x'] - this.width(piece) / 2) * width + this.piecesBox['x1'],
        (center['y'] - this.height(piece) / 2) * height + this.piecesBox['y1'],
      )
      piece['currentPos'] = null
    },

    inBoard(x, y, piece) {
      let width = this.width(piece)
      let height = this.height(piece)
      return x >= 0 && y >= 0 && x + width <= 6 && y + height <= 6
    },

    ifDone() {
      for (let i = 0; i < this.pieces.length; i++) {
        let piece = this.pieces[i]
        if (piece['currentPos'] === null) {
          return false
        }
      }
      return true
    },

    drawPiece(draw, piece) {
      console.log('drawPiece', piece)

      let vc = this

      const color = piece['color']

      const group = draw.group()
      for (let i = 0; i < piece['rects'].length; i++) {
        const rect = piece['rects'][i]
        let e = draw
          .rect(width, height)
          .move(rect['x'] * width, rect['y'] * height)
          .fill(color)
        group.add(e)
      }

      const center = piece['center']
      console.log(
        'width',
        this.width(piece),
        'height',
        this.height(piece),
        'move to',
        (center['x'] - this.width(piece) / 2) * width + this.piecesBox['x1'],
        (center['y'] - this.height(piece) / 2) * height + this.piecesBox['y1'],
      )
      vc.moveGroupToPieceBox(group, piece)

      group.draggable()

      group.on('dragmove.namespace', (e) => {
        console.log('dragmove')

        const { handler, box } = e.detail
        e.preventDefault()

        let { x, y } = box

        if (x <= this.constraints.x.min) {
          x = this.constraints.x.min
        }

        if (y <= this.constraints.y.min) {
          y = this.constraints.y.min
        }

        if (box.x2 >= this.constraints.x.max) {
          x = this.constraints.x.max - box.w
        }

        if (box.y2 > this.constraints.y.max) {
          y = this.constraints.y.max - box.h
        }

        // let t = x % width
        // if (t < width / 2) {
        //   x = x - t
        // } else {
        //   x = x + width - t
        // }

        // t = y % height
        // if (t < height / 2) {
        //   y = y - t
        // } else {
        //   y = y + height - t
        // }

        handler.move(x - (x % 100), y - (y % 100))
      })

      group.on('dragstart.namespace', function (e) {
        const { box } = e.detail

        let { x, y } = box
        console.log('drag start', x, y)
        this.data({ startX: x, startY: y })

        group.front()

        // remove blocked cell
        let currentPos = piece['currentPos']
        if (currentPos) {
          for (let i = 0; i < piece['rects'].length; i++) {
            let rect = piece['rects'][i]
            vc.blocked.splice(
              vc.blocked.indexOf(`${rect['x'] + currentPos['x']},${rect['y'] + currentPos['y']}`),
              1,
            )
          }
        }
      })

      group.on('dragend.namespace', function (e) {
        const { box } = e.detail
        e.preventDefault()

        let { x, y } = box

        let x1 = parseInt(x / width)
        let y1 = parseInt(y / height)
        console.log('drag end', x, y, x1, y1, piece)

        // the piece is NOT in the board
        if (!vc.inBoard(x1, y1, piece)) {
          // if distance is less than 1, consider it as a click
          let startX = this.data('startX')
          let startY = this.data('startY')

          var distance = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))
          console.log('distance', distance)
          if (distance < 1) {
            group.remove()
            vc.rotatePiece(draw, piece)
            return
          }
          vc.moveGroupToPieceBox(group, piece)
          return
        }

        // check if the piece is blocked
        console.log('block cells', vc.blocked)
        for (let i = 0; i < piece['rects'].length; i++) {
          let rect = piece['rects'][i]

          console.log('check block', rect['x'], rect['y'], rect['x'] + x1, rect['y'] + y1)

          if (vc.isBlocked(rect['x'] + x1, rect['y'] + y1)) {
            console.log('block at', rect['x'] + x1, rect['y'] + y1)
            vc.moveGroupToPieceBox(group, piece)
            return
          }
        }

        // update blocked cell

        piece['currentPos'] = { x: x1, y: y1 }
        for (let i = 0; i < piece['rects'].length; i++) {
          let rect = piece['rects'][i]
          vc.blocked.push(`${rect['x'] + x1},${rect['y'] + y1}`)
        }

        if (vc.ifDone()) {
          alert('Congratulations!')
        }
      })
    },

    drawDice(draw, x, y, number) {
      const diceSize = ((width + height) / 2) * 0.8
      const diceX = width * 0.1 + x * width
      const diceY = height * 0.1 + y * height

      // 画色子的背景
      draw.rect(diceSize, diceSize).move(diceX, diceY).fill('#f80')

      // 画色子上的数字
      const fontSize = diceSize * 0.5
      draw
        .text(number)
        .font({
          size: fontSize,
          family: 'Arial',
          fill: '#ffffff',
        })
        .move(diceX + diceSize / 2 - fontSize / 2, diceY + diceSize / 2 - fontSize / 2)
    },
    rollDices() {
      const used = new Set()

      for (let i = 0; i < this.dices.length; i++) {
        while (true) {
          this.dices[i].roll()
          const key = this.dices[i].hashCode()

          if (!used.has(key)) {
            used.add(key)
            break
          }
        }
      }

      // update blocked cells
      for (let i = 0; i < this.dices.length; i++) {
        let point = this.dices[i].point()
        this.blocked.push(`${point.x},${point.y}`)
      }
    },
  },
  mounted() {
    var draw = SVG().addTo('#gamebox').size(this.constraints.x.max, this.constraints.y.max)
    this.rollDices()

    // 画棋盘
    draw.line(0, 0, 600, 0)
    draw.line(0, 600, 600, 0)
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const color = (i + j) % 2 === 0 ? '#ffffff' : '#cccccc'
        draw
          .rect(100, 100)
          .move(j * 100, i * 100)
          .fill(color)
      }
    }

    // 画棋子
    for (let i = 0; i < this.pieces.length; i++) {
      this.drawPiece(draw, this.pieces[i])
    }

    // 画色子
    this.dices.forEach((dice) => {
      let point = dice.points[dice.idx]
      const number = String.fromCharCode(97 + point.x) + (point.y + 1)
      this.drawDice(draw, point.x, point.y, number.toString())
    })
  },
  computed: {
    constraints() {
      return {
        x: { min: 0, max: this.piecesBox['x2'] },
        y: { min: 0, max: this.piecesBox['y2'] },
      }
    },
  },
  data() {
    return {
      blocked: [],
      board: { x1: 0, y1: 0, x2: 600, y2: 600 },
      piecesBox: { x1: 700, y1: 0, x2: 1300, y2: 600 },
      // piece 里面的 rects 是相对于矩形 group 左上角的坐标. center 是相对于 pieceBox 的坐标, 旋转的圆心
      pieces: [
        { rects: [{ x: 0, y: 0 }], color: '#ffa500', center: { x: 1.5, y: 0.5 }, currentPos: null },
        {
          rects: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
          ],
          color: 'lightblue',
          center: { x: 2, y: 1.5 },
          currentPos: null,
        },
        {
          rects: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
          ],
          color: '#3a3f3b',
          center: { x: 3.5, y: 2 },
          currentPos: null,
        },
        {
          rects: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
          ],
          color: '#ffa500',
          center: { x: 4.5, y: 1.5 },
          currentPos: null,
        },
        {
          rects: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
          ],
          color: 'darkblue',
          center: { x: 1, y: 2.5 },
          currentPos: null,
        },
        {
          rects: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
          ],
          color: '#ffa500',
          center: { x: 2.5, y: 3 },
          currentPos: null,
        },
        {
          rects: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: 1, y: 2 },
          ],
          color: 'darkblue',
          center: { x: 4, y: 4.5 },
          currentPos: null,
        },
        {
          rects: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
          ],
          color: '#3a3f3b',
          center: { x: 1, y: 5 },
          currentPos: null,
        },
        {
          rects: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
          ],
          color: 'lightblue',
          center: { x: 3, y: 5 },
          currentPos: null,
        },
      ],
      dices: [
        new Dice([
          new Point(0, 0),
          new Point(1, 0),
          new Point(2, 0),
          new Point(3, 0),
          new Point(4, 0),
          new Point(5, 0),
        ]),
        new Dice([
          new Point(0, 1),
          new Point(1, 1),
          new Point(2, 1),
          new Point(3, 1),
          new Point(4, 1),
          new Point(5, 1),
        ]),
        new Dice([
          new Point(0, 2),
          new Point(1, 2),
          new Point(2, 2),
          new Point(3, 2),
          new Point(4, 2),
          new Point(5, 2),
        ]),
        new Dice([
          new Point(0, 3),
          new Point(1, 3),
          new Point(2, 3),
          new Point(3, 3),
          new Point(4, 3),
          new Point(5, 3),
        ]),
        new Dice([
          new Point(0, 4),
          new Point(1, 4),
          new Point(2, 4),
          new Point(3, 4),
          new Point(4, 4),
          new Point(5, 4),
        ]),
        new Dice([
          new Point(0, 5),
          new Point(1, 5),
          new Point(2, 5),
          new Point(3, 5),
          new Point(4, 5),
          new Point(5, 5),
        ]),
        new Dice([
          new Point(0, 0),
          new Point(1, 1),
          new Point(2, 2),
          new Point(3, 3),
          new Point(4, 4),
          new Point(5, 5),
        ]),
      ],
    }
  },
}
</script>
