# Vue 3 Virtual-list-vue3

Vue3 虚拟列表实现

## 安装

```
npm i am-virtual-list-vue3

```

## 用法

在需要的地方引入组件和样式即可使用,组件名为 `vertual-list`,组件内部使用 `slot` 插槽渲染子组件,在您的子组件中可以使用 `props`中加入`item` 接收当前渲染的内容

```vue
<script setup>
import virtualList from 'am-virtual-list-vue3'
import 'am-virtual-list-vue3/dist/style.css'
</script>

<template>
  <div>
    <vertual-list
      ref="vertualListRef"
      :resouce="_arrs"
      :resouce-key="(item:any) => item.id + item.name"
      :render-component="Item"
      :visible-count="60"
      :estimate-size="150"
      @to-bottom="onBottom"
      @to-top="onTop"
      @scroll="onScroll"
    />
  </div>
</template>
```

## 参数

| 参数             | 类型            | 描述                                 | 默认值 |
| ---------------- | --------------- | ------------------------------------ | ------ |
| resouce          | Array           | 数据源                               | 必填   |
| resouce-key      | Function/String | 数据源的唯一 key                     | 必填   |
| render-component | Component       | 渲染的子组件                         | 必填   |
| visible-count    | number          | 可见数量                             | 10     |
| estimate-size    | number          | 预估高度，越接近真实高度滚动条越真实 | 30     |

## 事件

| 事件名称  | 说明     | 回调参数    |
| --------- | -------- | ----------- |
| to-bottom | 触底事件 | -           |
| to-top    | 触顶事件 | -           |
| scroll    | 滚动事件 | event:Event |

## 类型

`Event` 滚动事件参数 event

```ts
interface Event {
  offset: number
  clientHeight: number
  scrollHeight: number
}
```
