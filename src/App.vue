<script setup lang="ts">
import VertualList from './components/VertualList/index.tsx'
import Item from './components/item.vue'
const _arrs = new Array(10000).fill(0).map((_, i) => {
  return {
    id: i,
    name: `name${i}`,
    age: i,
    address: `address${i}`,
    desc: `desc${i}`,
  }
})
</script>

<template>
  <div style="background-color: aqua; padding: 20px; width: 400px; height: 500px; overflow: hidden; overflow-y: scroll">
    <vertual-list style=":scroll " :resouce="_arrs" :render-component="Item" :visible-count="30" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
