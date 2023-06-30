import { Ref, defineComponent, onBeforeMount, onMounted, ref, render, watch } from 'vue'
import Vertual, { Range } from './vertual'
import props from './props'
import ComItem from './item'
export default defineComponent({
  name: 'VertualList',
  props,
  setup(props, context) {
    const range = ref({}) as Ref<Range>
    let vertual: Vertual
    const initVertual = () => {
      vertual = new Vertual(
        {
          resouce: props.resouce,
          fixedSizeHeight: props.itemHeight,
          visibleCount: props.visibleCount,
        },
        (value: Range) => {
          range.value = { ...value }
        }
      )
      range.value = vertual.getRange()
    }

    onBeforeMount(() => {
      initVertual()
    })
    onMounted(() => {
      context.emit('ok')
    })

    /**
     * 获取渲染的slots
     * @returns
     */
    const renderSlots = () => {
      const slots = []
      const { start, end } = range.value
      for (let i = start; i <= end; i++) {
        // 需要渲染的item
        const _item = props.resouce[i]
        if (_item) {
          slots.push(<ComItem source={_item} comp={props.renderComponent}></ComItem>)
        }
      }
      return slots
    }
    const rootRef = ref<HTMLElement>()
    /**获取滚动条偏移 */
    const getOffset = () => {
      const root = rootRef.value as HTMLElement
      return Math.ceil(root?.scrollTop || 0)
    }
    /**
     *  获取可视区域高度
     * @returns
     */
    const getClientHeight = () => {
      const root = rootRef.value as HTMLElement
      return Math.ceil(root?.clientHeight || 0)
    }
    const getScrollHeight = () => {
      const root = rootRef.value as HTMLElement
      return Math.ceil(root?.scrollHeight || 0)
    }
    const onScroll = () => {
      const offset = getOffset()
      const clientHeight = getClientHeight()
      const scrollHeight = getScrollHeight()
      if (offset < 0) return
      if (offset + clientHeight > scrollHeight + 1) return
      if (!scrollHeight) return
      vertual.handScroll(offset)
    }
    return () => {
      const { startFront, endFront } = range.value
      return (
        <div
          ref={rootRef}
          onScroll={onScroll}
          style={{
            position: 'relative',
            overflowY: 'scroll',
            overflowX: 'hidden',
            height: '100%',
            width: '100%',
          }}>
          <div
            style={{
              padding: `${startFront}px 0px ${endFront}px 0px`,
            }}>
            {renderSlots()}
          </div>
          <div style={{ width: '100%', height: '0px' }}></div>
        </div>
      )
    }
  },
})
