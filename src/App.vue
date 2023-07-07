<script setup lang="ts">
import { ref } from 'vue'
import VertualList from './components/VertualList/index.tsx'
import Item from './components/item.vue'
import Item2 from './components/item2.vue'
import { faker } from '@faker-js/faker'
const messageList = ref<any>([])
messageList.value = new Array(10).fill(0).map(() => {
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
  vertualListRef.value?.scrollToIndex(index, false)
}
const scrollToBottom = () => {
  console.log('scrollBottom')
  vertualListRef.value?.scrollToBottom(false)
}
const vertualListRef = ref<InstanceType<typeof VertualList>>()

const headerAddData = async () => {
  const oldSize = vertualListRef.value!.getSizes()
  await new Promise((resolve) => {
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
    const newMessage = [...data, ...messageList.value]
    messageList.value = newMessage
    resolve('')
  })
  const newSize = vertualListRef.value!.getSizes()
  scrollIndex(newSize - oldSize)
}
</script>

<template>
  <div class="content">
    <div class="content-item">
      <p>有图片的非固定高度</p>
      <div style="margin-bottom: 20px">
        <button @click="headerAddData">头部添加数据</button>
        <button @click="scrollToBottom">滚动到底部</button>
      </div>
      <vertual-list
        v-if="messageList.length"
        ref="vertualListRef"
        :resouce="messageList"
        :resouce-key="(item:any) => item.id + item.name"
        :render-component="Item"
        :visible-count="20"
        :estimate-size="150"
        :bottomthreshold="60"
        :gap="20"
      />
    </div>
    <div class="content-item">
      <p>没图片的固定高度</p>
      <vertual-list
        ref="vertualListRef2"
        :resouce="messageList"
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
  height: 600px;
  overflow: hidden;
}
.content-item {
  width: 400px;
  height: 450px;
  overscroll-behavior-y: contain;
}
.content-item p {
  padding: 10px;
  margin: 0;
}
</style>
