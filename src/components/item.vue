<template>
  <div class="item">
    <div class="image">
      <img :src="item.avatar" />
    </div>
    <div class="info">
      <div class="index">{{ item.id }}</div>
      <div class="item__name">姓名：{{ item.name }}</div>
      <div class="item__age">年龄：{{ item.age }}</div>
      <div class="item__address">地址：{{ item.address }}</div>
      <div class="item__desc">描述：{{ item.desc }}</div>
    </div>
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
<style>
.item {
  display: flex;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 5px;
  overflow: hidden;
  background-color: #fff;
}
.item .image img {
  max-height: 160px;
  border-radius: 10px;
}
.item .info {
  flex: 1;
  font-size: 12px;
  position: relative;
  padding-left: 30px;
}
.item .info .index {
  position: absolute;
  text-align: center;
  right: -150px;
  top: -10px;
  background-color: yellowgreen;
  width: 300px;
  height: 40px;
  line-height: 40px;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  transform: rotateZ(45deg);
}
</style>
