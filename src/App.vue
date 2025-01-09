<template>
  <div
    style="
      background-color: #fff;
      border: 1px solid black;
      width: 1300px;
      height: 600px;
      display: flex;
    "
  >
    <div
      id="chessboard"
      class="grid-container"
      style="
        position: relative;
        background:
          linear-gradient(-90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px) 0% 0% / 100px 100px,
          linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px) 0% 0% / 100px 100px;
        height: 600px;
        width: 600px;
      "
    >
      <template v-for="(dice, index) in dices" :key="index">
        <canvas
          :id="'dice-' + index"
          width="100"
          height="100"
          :style="{
            left: dice.x * 100 + 'px',
            top: dice.y * 100 + 'px',
            position: 'absolute',
            backgroundColor: 'brown',
          }"
        ></canvas>
      </template>
    </div>
    <vue-draggable-resizable
      :grid="[100, 100]"
      @dragStop="onDragstop"
      :resizable="false"
      style="position: relative; left: 100px"
    >
      <svg width="200px" height="200px">
        <rect
          width="100px"
          height="100px"
          style="fill: gray; stroke: black; stroke-width: 1; fill-rule: evenodd"
        />
        <rect
          x="100"
          y="0"
          width="100px"
          height="100px"
          style="fill: gray; stroke: black; stroke-width: 1; fill-rule: evenodd"
        />
        <rect
          x="0"
          y="100"
          width="100px"
          height="100px"
          style="fill: gray; stroke: black; stroke-width: 1; fill-rule: evenodd"
        />
      </svg>
    </vue-draggable-resizable>

    <vue-draggable-resizable
      :grid="[100, 100]"
      @dragStop="onDragstop"
      :resizable="false"
      style="position: relative; left: 200px"
    >
      <svg width="200px" height="200px">
        <rect
          x="0"
          y="0"
          width="100px"
          height="100px"
          style="fill: gray; stroke: black; stroke-width: 1; fill-rule: evenodd"
        />
        <rect
          x="100"
          y="0"
          width="100px"
          height="100px"
          style="fill: gray; stroke: black; stroke-width: 1; fill-rule: evenodd"
        />
      </svg>
    </vue-draggable-resizable>
  </div>
</template>

<script>
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/style.css'

export default {
  components: {
    VueDraggableResizable,
  },
  methods: {
    onDragstop: (event) => {
      console.log('onDragstop', event)
    },
    generateDices() {
      const positions = new Set()
      while (positions.size < 6) {
        const x = Math.floor(Math.random() * 6)
        const y = Math.floor(Math.random() * 6)
        positions.add(`${x},${y}`)
        this.dices.push({ x, y })
      }
    },
  },
  created() {
    this.generateDices()
  },
  data() {
    return {
      dices: [],
    }
  },
}
</script>
