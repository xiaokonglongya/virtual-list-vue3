<script setup lang="ts">
import { ref } from 'vue'
import VertualList from './components/VertualList/index.tsx'
import Item from './components/item.vue'
import Item2 from './components/item2.vue'
import { faker } from '@faker-js/faker'
let _arrs = ref<any>([])
_arrs.value = new Array(10).fill(0).map(() => {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    age: faker.number.int({ min: 1, max: 100 }),
    address: faker.location.streetAddress(),
    desc: faker.person.jobDescriptor(),
    avatar: faker.image.avatar(),
  }
})
const scrollIndex = (index: number) => {
  console.log('scrillIndex', index)
  vertualListRef.value?.scrollToIndex(index)
}
const scrollToBottom = () => {
  console.log('scrollBottom')
  vertualListRef.value?.scrollToBottom(false)
}
const vertualListRef = ref()
const addData = () => {}
const headerAddData = () => {
  const last_size = vertualListRef.value?.getSizes()
  const data = new Array(6).fill(0).map(() => {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      age: faker.number.int({ min: 1, max: 100 }),
      address: faker.location.streetAddress(),
      desc: faker.person.jobDescriptor(),
      avatar: faker.image.avatar(),
    }
  })
  _arrs.value = [...data, ..._arrs.value]
  setTimeout(() => {
    scrollIndex(vertualListRef.value.getSizes() - last_size)
  }, 0)
}
</script>

<template>
  <button @click="addData">添加数据</button>
  <button @click="headerAddData">头部添加数据</button>
  <button @click="scrollToBottom">滚动到底部</button>
  <div class="content">
    <div class="content-item">
      <p>有图片的非固定高度</p>
      <vertual-list
        ref="vertualListRef"
        :resouce="_arrs"
        :resouce-key="(item:any) => item.id + item.name"
        :render-component="Item"
        :visible-count="30"
        :estimate-size="150"
        :gap="20"
        :bottomthreshold="60"
      />
    </div>
    <div class="content-item">
      <p>没图片的固定高度</p>
      <vertual-list
        ref="vertualListRef2"
        :resouce="_arrs"
        :resouce-key="(item:any) => item.id + item.name"
        :render-component="Item2"
        :visible-count="60"
        :estimate-size="150"
        :gap="20"
      />
    </div>
  </div>
</template>

<style scoped>
.content {
  display: flex;
  gap: 23px;
  border: 3px solid #ddd;
  padding: 20px 60px;
  border-radius: 12px;
  height: 500px;
  overflow: hidden;
}
.content-item {
  width: 400px;
  height: 450px;
}
.content-item p {
  padding: 10px;
  margin: 0;
}
</style>
