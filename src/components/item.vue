<template>
  <div
    class="item"
    style="
      display: flex;
      height: 50px;
      align-items: center;
      background-color: antiquewhite;
      border-bottom: 1px saddlebrown solid;
    "
  >
    <div class="item__id">{{ item.id }}</div>
    <div class="item__name">{{ item.name }}</div>
    <div class="item__age">{{ item.age }}</div>
    <div class="item__address">{{ item.address }}</div>
    <div class="item__desc">{{ item.desc }}</div>
  </div>
</template>
<script setup lang="ts">
defineProps({
  item: {
    type: Object,
    required: true,
  },
})
</script>
