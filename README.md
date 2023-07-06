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

你可以通过 `to-bottom` `to-top`来获取触底触顶事件,但请注意，在设置阈值的情况下会频繁触发，所以请在事件中做好节流处理或使用以下方法进行处理

```ts
const bottom = ref(false)
const top = ref(false)
const onScroll = (event: ScrollEvent) => {
  bottom.value = event.bottom
  top.value = event.top
}
watch(
  () => bottom.value,
  (val) => {
    if (val) {
      console.log('触底')
    }
  }
)
watch(
  () => top.value,
  (val) => {
    if (val) {
      console.log('触顶')
    }
  }
)
```

## 参数

| 参数             | 类型            | 描述                                                                  | 默认值 | 版本  |
| ---------------- | --------------- | --------------------------------------------------------------------- | ------ | ----- |
| resouce          | Array           | 数据源                                                                | 必填   | -     |
| resouce-key      | Function/String | 数据源的唯一 key                                                      | 必填   | -     |
| render-component | Component       | 渲染的子组件                                                          | 必填   | -     |
| visible-count    | number          | 可见数量                                                              | 10     | -     |
| estimate-size    | number          | 预估高度，越接近真实高度滚动条越真实                                  | 30     | -     |
| gap              | number          | 间隔,请使用间隔设置每个 item 的间距，避免在 item 中是使用 margin 属性 | 0      | 0.0.3 |
| bottomthreshold  | number          | 触底阈值                                                              | 0      | 0.0.4 |
| topthreshold     | number          | 触顶阈值                                                              | 0      | 0.0.4 |

## 方法

通过 Ref 进行调用
| 方法名称 | 说明 | 参数 |
| -------- | -------- | ---- |
| scrollToIndex | 滚动到指定索引 | index:number |
| getSizes | 获取大小 | - |

## 事件

| 事件名称  | 说明     | 回调参数          |
| --------- | -------- | ----------------- |
| to-bottom | 触底事件 | -                 |
| to-top    | 触顶事件 | -                 |
| scroll    | 滚动事件 | event:ScrollEvent |

## 类型

`Event` 滚动事件参数 event

```ts
interface ScrollEvent {
  offset: number
  clientHeight: number
  scrollHeight: number
  /**是否在底部 */
  bottom: boolean
  /**是否在顶部 */
  top: boolean
}
```

## 参考项目

[ChatMall](https://github.com/Evansy/MallChatWeb)：抹茶聊天是一个 IM 项目，通过 netty 实现和前端的 websocket 连接。
