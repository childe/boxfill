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
    ></div>
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
  },
}
</script>
