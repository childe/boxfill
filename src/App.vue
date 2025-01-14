<template>
  <div id="gamebox" style="height: 600px; width: 600; border: solid black 1px"></div>
</template>

<script>
import { SVG } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.draggable.js'

export default {
  methods: {},
  mounted() {
    const constraints = {
      x: { min: 0, max: 600 },
      y: { min: 0, max: 600 },
    }
    var draw = SVG().addTo('#gamebox').size(constraints.x.max, constraints.y.max)
    var rect = draw.rect(100, 100).move(100, 100).attr({ fill: '#eee' })
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
