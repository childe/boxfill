<template>
  <div style="margin-top: 10px">
    <div id="gamebox"></div>
    <div id="actions">
      <button @click="roll">Roll</button>
    </div>
  </div>
</template>

<script>
import { SVG } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.draggable.js'

var width
var height

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  hashCode() {
    return `${this.x},${this.y}`
  }
}

class Piece {
  constructor(name, points, color, center) {
    this.name = name
    this.origin = JSON.parse(JSON.stringify(points))
    this.points = JSON.parse(JSON.stringify(points))
    this.color = color
    this.center = center
    this.currentPos = null
  }

  width() {
    let x1 = 0,
      x2 = 0
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i]
      x1 = Math.min(x1, p.x)
      x2 = Math.max(x2, p.x)
    }
    return x2 - x1 + 1
  }

  height() {
    let y1 = 0,
      y2 = 0
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i]
      y1 = Math.min(y1, p.y)
      y2 = Math.max(y2, p.y)
    }
    return y2 - y1 + 1
  }

  rotate() {
    const height = this.height()
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i]
      let x = p.x
      let y = p.y

      p.x = -y + height - 1
      p.y = x
      console.debug('rotate', x, y, 'to', p.x, p.y)
    }
    console.debug('rotate', this.origin, this.points)
  }
  reset() {
    this.points = JSON.parse(JSON.stringify(this.origin))
    this.currentPos = null
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

    moveGroupToPieceBox(group, piece) {
      let center = piece.center
      console.debug('center', center, piece.width() / 2, piece.height() / 2)
      // group.move(
      //   (center.x - piece.width() / 2) * width + this.piecesBox['x1'],
      //   (center.y - piece.height() / 2) * height + this.piecesBox['y1'],
      // )
      group.center(
        center.x * width + this.piecesBox['x1'],
        center.y * height + this.piecesBox['y1'],
      )
      console.debug(
        'move to',
        center.x,
        center.y,
        center.x * width + this.piecesBox['x1'],
        center.y * height + this.piecesBox['y1'],
      )
      piece.currentPos = null
    },

    inBoard(x, y, piece) {
      let width = piece.width()
      let height = piece.height()
      return x >= 0 && y >= 0 && x + width <= 6 && y + height <= 6
    },

    ifDone() {
      for (let i = 0; i < this.pieces.length; i++) {
        let piece = this.pieces[i]
        if (piece.currentPos === null) {
          return false
        }
      }
      return true
    },

    drawPiece(draw, piece) {
      console.log('drawPiece', piece)

      let vc = this

      const color = piece.color

      const group = draw.group()
      for (let i = 0; i < piece.points.length; i++) {
        const p = piece.points[i]
        let e = draw
          .rect(width, height)
          .move(p.x * width, p.y * height)
          .fill(color)
        group.add(e)
      }

      const center = piece.center
      console.log(
        'width',
        piece.width(),
        'height',
        piece.height(),
        'move to',
        (center.x - piece.width / 2) * width + this.piecesBox['x1'],
        (center.y - piece.height() / 2) * height + this.piecesBox['y1'],
      )
      vc.moveGroupToPieceBox(group, piece)

      group.draggable()

      group.on('dragmove.namespace', (e) => {
        console.log('dragmove')

        const { handler, box } = e.detail
        e.preventDefault()

        let { x, y } = box

        if (x <= vc.constraints.x.min) {
          x = vc.constraints.x.min
        }

        if (y <= vc.constraints.y.min) {
          y = vc.constraints.y.min
        }

        if (box.x2 >= vc.constraints.x.max) {
          x = vc.constraints.x.max - box.w
        }

        if (box.y2 > vc.constraints.y.max) {
          y = vc.constraints.y.max - box.h
        }
        console.log(x, y)

        handler.move(x - (x % width), y - (y % height))
      })

      group.on('dragstart.namespace', function (e) {
        const { box } = e.detail

        let { x, y } = box
        console.log('drag start', x, y)
        this.data({ startX: x, startY: y })

        group.front()
        group.opacity(0.8)

        // remove blocked cell
        let currentPos = piece['currentPos']
        if (currentPos) {
          for (let i = 0; i < piece.points.length; i++) {
            let p = piece.points[i]
            vc.blocked.splice(vc.blocked.indexOf(`${p.x + currentPos.x},${p.y + currentPos.y}`), 1)
          }
        }
      })

      group.on('dragend.namespace', function (e) {
        const { box } = e.detail
        e.preventDefault()

        group.opacity(1)

        let { x, y, x2, y2 } = box

        // if (x <= vc.constraints.x.min) {
        //   x = vc.constraints.x.min
        // }

        // if (y <= vc.constraints.y.min) {
        //   y = vc.constraints.y.min
        // }

        // if (x2 >= vc.constraints.x.max) {
        //   x = vc.constraints.x.max - box.w
        // }

        // if (y2 > vc.constraints.y.max) {
        //   y = vc.constraints.y.max - box.h
        // }

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
            piece.rotate()
            group.remove()
            vc.pieceGroup.add(vc.drawPiece(draw, piece))
            return
          }
          vc.moveGroupToPieceBox(group, piece)
          return
        }

        // check if the piece is blocked
        console.log('block cells', vc.blocked)
        for (let i = 0; i < piece.points.length; i++) {
          let p = piece.points[i]

          // console.log('check block', p['x'], p['y'], p['x'] + x1, p['y'] + y1)

          if (vc.isBlocked(p.x + x1, p.y + y1)) {
            console.log('block at', p.x + x1, p.y + y1)
            vc.moveGroupToPieceBox(group, piece)
            return
          }
        }

        // update blocked cell

        piece['currentPos'] = new Point(x1, y1)
        for (let i = 0; i < piece.points.length; i++) {
          let p = piece.points[i]
          vc.blocked.push(`${p.x + x1},${p.y + y1}`)
        }

        if (vc.ifDone()) {
          alert('Congratulations!')
        }
      })

      return group
    },

    drawDice(draw, x, y, number) {
      const diceSize = ((width + height) / 2) * 0.8
      const diceX = width * 0.1 + x * width
      const diceY = height * 0.1 + y * height

      // 画色子的背景
      let group = draw.group()
      group.add(draw.rect(diceSize, diceSize).move(diceX, diceY).fill('#f80'))

      // 画色子上的数字
      const fontSize = diceSize * 0.5
      group.add(
        draw
          .text(number)
          .font({
            size: fontSize,
            family: 'Arial',
            fill: '#ffffff',
          })
          .move(diceX + diceSize / 2 - fontSize / 2, diceY + diceSize / 2 - fontSize / 2),
      )
      return group
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
    },
    drawDices() {
      if (this.diceGroup) {
        this.diceGroup.remove()
      }

      this.diceGroup = this.draw.group()
      this.dices.forEach((dice) => {
        let point = dice.points[dice.idx]
        const number = String.fromCharCode(97 + point.x) + (point.y + 1)
        this.diceGroup.add(this.drawDice(this.draw, point.x, point.y, number.toString()))
      })

      // update blocked cells
      this.blocked = []
      for (let i = 0; i < this.dices.length; i++) {
        let point = this.dices[i].point()
        this.blocked.push(`${point.x},${point.y}`)
      }
    },

    drawPieces() {
      if (this.pieceGroup) {
        this.pieceGroup.remove()
      }

      this.pieceGroup = this.draw.group()
      for (let i = 0; i < this.pieces.length; i++) {
        this.pieces[i].reset()
        this.pieceGroup.add(this.drawPiece(this.draw, this.pieces[i]))
      }
    },

    generateRoll() {
      let roll = ''
      for (let i = 0; i < this.dices.length; i++) {
        let point = this.dices[i].point()
        roll += String.fromCharCode(97 + point.x) + (point.y + 1)
      }
      return roll
    },

    roll() {
      this.rollDices()
      this.$router.push({ name: 'roll', params: { roll: this.generateRoll() } })
      return false
    },

    createAll() {
      const roll = this.$route.params.roll
      console.log(roll)
      if (roll !== undefined && roll !== null && roll.length === 14) {
        for (let i = 0; i < roll.length; i += 2) {
          let dice = roll.slice(i, i + 2)
          let x = dice.toUpperCase().charCodeAt(0) - 65
          let y = parseInt(dice[1]) - 1
          let d = this.dices[i / 2]
          d.idx = d.points.findIndex((p) => p.x === x && p.y === y)

          // update blocked cells
          this.blocked = []
          for (let i = 0; i < this.dices.length; i++) {
            let point = this.dices[i].point()
            this.blocked.push(`${point.x},${point.y}`)
          }
        }
      } else {
        this.roll()
      }

      if (this.draw) {
        this.draw.remove()
      }
      var draw = SVG().addTo('#gamebox').size(this.constraints.x.max, this.constraints.y.max)
      this.draw = draw

      // 画棋盘
      let boardPath = `0,0 ${6 * width},0 ${6 * width},${6 * height} 0,${6 * height} 0,0`
      draw.polygon(boardPath).fill('none').stroke({ width: 1, color: 'black' })

      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          const color = (i + j) % 2 === 0 ? '#fefefe' : '#efefef'
          draw
            .rect(width - 2, height - 2)
            .move(j * width + 1, i * height + 1)
            .fill(color)
        }
      }

      // 画色子
      this.drawDices(draw)

      // 画棋子
      let p = this.piecesBox
      let pieceBoxPath = `${p.x1},${p.y1} ${p.x2},${p.y1} ${p.x2},${p.y2} ${p.x1},${p.y2} ${p.x1},${p.y1}`
      draw.polygon(pieceBoxPath).fill('none').stroke({ width: 1, color: 'black' })
      this.drawPieces()
    },

    handleResize() {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        this.windowWidth = window.innerWidth
        console.log('resize')
      }, 500) // 0.5 秒后触发
    },
  },
  watch: {
    $route() {
      this.createAll()
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)

    if (window.innerWidth > window.innerHeight) {
      let w = Math.max(20, parseInt(window.innerWidth / 13))
      let h = Math.max(20, parseInt((window.innerHeight - 30) / 6))
      width = Math.min(w, h)
      height = width
      this.piecesBox = { x1: 1 + 6.6 * width, y1: 0, x2: 12.6 * width, y2: 6 * width }
      this.pieces.forEach((piece) => {
        piece.center = new Point(piece.center.x + 0.5, piece.center.y)
      })
    } else {
      let w = Math.max(20, parseInt(window.innerWidth / 6))
      let h = Math.max(20, parseInt((window.innerHeight - 30) / 13))
      width = Math.min(w, h)
      height = width
      this.piecesBox = { x1: 0, y1: 6.6 * height, x2: width * 6, y2: 12.5 * height }
      this.pieces.forEach((piece) => {
        piece.center = new Point(piece.center.x + 0.5, piece.center.y)
      })
    }
    this.createAll()
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
      resizeTimer: null,

      draw: null,
      diceGroup: null,
      pieceGroup: null,

      blocked: [],
      board: { x1: 0, y1: 0, x2: 6 * width, y2: 6 * width },
      // piecesBox: { x1: 1 + 6.6 * width, y1: 0, x2: 12.2 * width, y2: 6 * width },
      // piecesBox: { x1: 0, y1: 6.6 * height, x2: height * 6, y2: 12.6 * height },
      piecesBox: null,
      // piece 里面的 rects 是相对于矩形 group 左上角的坐标. center 是相对于 pieceBox 的坐标, 旋转的圆心
      pieces: [
        new Piece('', [new Point(0, 0)], '#ffa500', new Point(1.5, 0.5)),
        new Piece(
          '',
          [new Point(1, 0), new Point(1, 1), new Point(0, 1), new Point(0, 2)],
          'lightblue',
          new Point(2, 1.5),
        ),
        new Piece(
          '',
          [new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(0, 3)],
          '#3a3f3b',
          new Point(3.5, 2),
        ),
        new Piece(
          '',
          [new Point(0, 0), new Point(0, 1), new Point(0, 2)],
          '#ffa500',
          new Point(4.5, 1.5),
        ),
        new Piece(
          '',
          [new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(1, 2)],
          'darkblue',
          new Point(1, 2.5),
        ),
        new Piece('', [new Point(0, 0), new Point(0, 1)], '#ffa500', new Point(2.5, 3)),
        new Piece(
          '',
          [new Point(1, 0), new Point(1, 1), new Point(0, 1), new Point(1, 2)],
          'darkblue',
          new Point(4, 4.5),
        ),
        new Piece(
          '',
          [new Point(0, 0), new Point(1, 0), new Point(0, 1), new Point(1, 1)],
          '#3a3f3b',
          new Point(1, 5),
        ),
        new Piece(
          '',
          [new Point(0, 0), new Point(0, 1), new Point(1, 1)],
          'lightblue',
          new Point(3, 5),
        ),
      ],
      dices: [
        new Dice([
          new Point(0, 0),
          new Point(0, 1),
          new Point(0, 2),
          new Point(0, 3),
          new Point(0, 4),
          new Point(0, 5),
        ]),
        new Dice([
          new Point(1, 0),
          new Point(1, 1),
          new Point(1, 2),
          new Point(1, 3),
          new Point(1, 4),
          new Point(1, 5),
        ]),
        new Dice([
          new Point(2, 0),
          new Point(2, 1),
          new Point(2, 2),
          new Point(2, 3),
          new Point(2, 4),
          new Point(2, 5),
        ]),
        new Dice([
          new Point(3, 0),
          new Point(3, 1),
          new Point(3, 2),
          new Point(3, 3),
          new Point(3, 4),
          new Point(3, 5),
        ]),
        new Dice([
          new Point(4, 0),
          new Point(4, 1),
          new Point(4, 2),
          new Point(4, 3),
          new Point(4, 4),
          new Point(4, 5),
        ]),
        new Dice([
          new Point(5, 0),
          new Point(5, 1),
          new Point(5, 2),
          new Point(5, 3),
          new Point(5, 4),
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
