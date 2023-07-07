import { Ref, defineComponent, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'
import Vertual from './vertual'
import props from './props'
import ComItem from './item'
import './style.css'
export interface ScrollEvent {
  offset: number
  clientHeight: number
  scrollHeight: number
  bottom: boolean
  top: boolean
}
export interface Range {
  start: number
  end: number
  startFront: number
  endFront: number
}

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
          estimateSize: props.estimateSize,
          visibleCount: props.visibleCount,
          uniqueIds: getUniqueIdFromDataSources(),
          buffer: Math.round(props.visibleCount / 2),
        },
        (value: Range) => {
          range.value = { ...value }
        }
      )
      range.value = vertual.getRange()
    }
    const getUniqueId = (item: any) => {
      if (!item) return ''
      const { resouceKey } = props
      return typeof resouceKey === 'function' ? resouceKey(item) : item[resouceKey]
    }
    const getUniqueIdFromDataSources = () => {
      const { resouce, resouceKey } = props
      return resouce.map((item: any) => {
        return typeof resouceKey === 'function' ? resouceKey(item) : item[resouceKey]
      }) as string[]
    }
    watch(
      () => props.resouce.length,
      () => {
        vertual.updateParams('uniqueIds', getUniqueIdFromDataSources())
        vertual.handleSourceDataChange()
      }
    )
    onBeforeMount(() => {
      initVertual()
    })
    onMounted(() => {
      context.emit('ok')
    })
    onUnmounted(() => {
      vertual.destroy()
    })

    const hanleItemChange = (key: string, height: number) => {
      const _height = height + props.gap
      vertual.setSize(key, _height)
    }

    /**
     * 获取渲染的slots
     * @returns
     */
    const renderSlots = () => {
      const slots = []
      const { start, end } = range.value
      for (let i = start; i <= end; i++) {
        const _item = props.resouce[i]
        const _key = getUniqueId(_item)
        if (_item && ['string', 'number'].includes(typeof _key)) {
          slots.push(
            <ComItem
              uniqueKey={_key}
              index={i}
              source={_item}
              comp={props.renderComponent}
              onHeightChange={hanleItemChange}></ComItem>
          )
        }
      }
      return slots
    }

    /**获取滚动条偏移 */
    const getOffset = () => {
      const root = rootRef.value
      return Math.ceil(root?.scrollTop || 0)
    }
    /**
     *  获取可视区域高度
     * @returns
     */
    const getClientHeight = () => {
      const root = rootRef.value
      return Math.ceil(root?.clientHeight || 0)
    }
    const getScrollHeight = () => {
      const root = rootRef.value
      return Math.ceil(root?.scrollHeight || 0)
    }

    const onScroll = (event: UIEvent) => {
      event.stopImmediatePropagation()
      const offset = getOffset()
      const clientHeight = getClientHeight()
      const scrollHeight = getScrollHeight()

      const bottom = offset + props.bottomthreshold + clientHeight >= scrollHeight
      const top = offset - props.topthreshold <= 0 && !!props.resouce.length

      vertual.handScroll(offset)
      context.emit('scroll', { offset, clientHeight, scrollHeight, bottom, top })
      // 触底事件
      if (vertual.isBehind() && offset + props.bottomthreshold + clientHeight >= scrollHeight) {
        context.emit('toBottom')
      }
      // 触顶事件
      if (vertual.isFront() && offset - props.topthreshold <= 0 && !!props.resouce.length) {
        context.emit('toTop')
      }
    }
    const scrollToOffset = (offset: number, smooth?: boolean) => {
      const root = rootRef.value
      root?.scroll({
        left: 0,
        top: offset,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }

    /**滚动到底部 */
    const scrollToBottom = (smooth?: boolean) => {
      if (shepherd.value) {
        const offset = shepherd.value.offsetTop
        scrollToOffset(offset, smooth)
        setTimeout(() => {
          if (getOffset() + getClientHeight() < getScrollHeight()) {
            scrollToBottom(smooth)
          }
        }, 3)
      }
    }
    /**
     * 滚动到指定索引
     * @param index 索引
     * @param smooth 是否平滑滚动
     * @returns
     */
    const scrollToIndex = (index: number, smooth?: boolean) => {
      if (index >= props.resouce.length - 1) {
        scrollToBottom(smooth)
      } else {
        const offset = vertual.getIndexOffset(index)
        scrollToOffset(offset, smooth)
      }
    }

    const getSizes = () => {
      return vertual.sizes.size || 0
    }
    const rootRef = ref<HTMLElement>()
    const shepherd = ref<HTMLElement>()
    return {
      rootRef,
      range,
      shepherd,
      onScroll,
      renderSlots,
      getSizes,
      scrollToIndex,
      scrollToBottom,
    }
  },
  render() {
    const { startFront, endFront } = this.range
    return (
      <div ref="rootRef" onScroll={this.onScroll} class={'am-vertual-list'}>
        <div
          class={'am-vertual-list__content'}
          style={{
            padding: `${startFront}px 0px ${endFront}px 0px`,
            gap: `${this.gap}px`,
          }}>
          {this.renderSlots()}
        </div>
        <div ref="shepherd" style={{ width: '100%', height: '0px' }}></div>
      </div>
    )
  },
})
