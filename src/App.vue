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

export default {
  methods: {
    drawPiece(draw, piece) {
      console.log(piece)

      const color = piece['color']

      const group = draw.group()
      for (let i = 0; i < piece['rects'].length; i++) {
        const rect = piece['rects'][i]
        let e = draw
          .rect(100, 100)
          .move(rect['x'] * 100, rect['y'] * 100)
          .fill(color)
        group.add(e)
      }

      const originX = 600
      const originY = 0
      group.move(originX, originY)

      // 使组可拖拽
      group.draggable()
      group.on('dragmove.namespace', (e) => {
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

        handler.move(x - (x % 50), y - (y % 50))
      })
      group.on('dragend.namespace', function (e) {
        const { box } = e.detail
        e.preventDefault()

        let { x, y } = box

        console.log(parseInt(x / width), parseInt(y / height))
        group.move(originX, originY)
      })
    },
    drawDice(draw, x, y, number) {
      const diceSize = 100 * 0.8
      const diceX = 100 * 0.1 + x * 100
      const diceY = 100 * 0.1 + y * 100

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
    generateDices() {
      const coordinates = []
      const used = new Set()

      while (coordinates.length < 6) {
        const x = Math.floor(Math.random() * 6)
        const y = Math.floor(Math.random() * 6)
        const key = `${x},${y}`

        if (!used.has(key)) {
          coordinates.push({ x, y })
          used.add(key)
        }
      }

      return coordinates
    },
  },
  mounted() {
    var draw = SVG().addTo('#gamebox').size(this.constraints.x.max, this.constraints.y.max)

    // 画棋盘
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const color = (i + j) % 2 === 0 ? '#ffffff' : '#cccccc'
        draw
          .rect(100, 100)
          .move(j * 100, i * 100)
          .fill(color)
      }
    }

    for (let i = 0; i < this.pieces.length; i++) {
      this.drawPiece(draw, this.pieces[i])
    }

    // 画色子
    this.dices.forEach((dice) => {
      const number = String.fromCharCode(97 + dice.x) + (dice.y + 1)
      this.drawDice(draw, dice.x, dice.y, number.toString())
    })

    // var rect = draw.rect(100, 100).move(700, 0).attr({ fill: '#bbb' })
    // rect.draggable()
  },
  data() {
    return {
      pieces: [
        { rects: [{ x: 0, y: 0 }], color: '#ffa500' },
        {
          rects: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
          ],
          color: '#ff5a00',
        },
      ],
      dices: this.generateDices(),
      constraints: {
        x: { min: 0, max: 800 },
        y: { min: 0, max: 800 },
      },
    }
  },
}
</script>
