<template>
  <div id="gamebox" style="height: 800px; width: 800px; border: solid black 1px"></div>
</template>

<script>
import { SVG } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.draggable.js'

export default {
  methods: {
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
  },
  mounted() {
    const constraints = {
      x: { min: 0, max: 800 },
      y: { min: 0, max: 800 },
    }
    var draw = SVG().addTo('#gamebox').size(constraints.x.max, constraints.y.max)
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
    // 画红色色子
    this.drawDice(draw, 2, 3, 'c4')

    var rect = draw.rect(100, 100).move(700, 0).attr({ fill: '#bbb' })
    rect.draggable()

    rect.on('dragmove.namespace', (e) => {
      const { handler, box } = e.detail
      e.preventDefault()

      let { x, y } = box

      if (x <= constraints.x.min) {
        x = constraints.x.min
      }

      if (y <= constraints.y.min) {
        y = constraints.y.min
      }

      if (box.x2 >= 600) {
        x = 600 - box.w
      }

      if (box.y2 > 600) {
        y = 600 - box.h
      }

      handler.move(x - (x % 100), y - (y % 100))
    })
  },
  data() {
    return {
      dices: [],
    }
  },
}
</script>
