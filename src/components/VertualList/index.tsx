import { Ref, defineComponent, onBeforeMount, onMounted, ref, watch } from 'vue'
import Vertual, { Range } from './vertual'
import props from './props'
import ComItem from './item'
import './style.css'
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
        vertual.updateUniqueIds(getUniqueIdFromDataSources())
      }
    )
    onBeforeMount(() => {
      initVertual()
    })
    onMounted(() => {
      context.emit('ok')
    })

    const hanleItemChange = (source: any, height: number) => {
      const index = props.resouce.findIndex((item: any) => {
        return getUniqueId(item) === getUniqueId(source)
      })
      const key = getUniqueId(source)

      const _height = height + props.gap
      vertual.setSize(key, {
        height: _height,
        index,
      })
    }

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
        const _key = getUniqueId(_item)
        if (_item && ['string', 'number'].includes(typeof _key)) {
          slots.push(
            <ComItem
              key={_key}
              index={i}
              source={_item}
              comp={props.renderComponent}
              onHeightChange={hanleItemChange}></ComItem>
          )
        }
      }
      return slots
    }
    const rootRef = ref<HTMLElement>()
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

    const onScroll = () => {
      const offset = getOffset()
      const clientHeight = getClientHeight()
      const scrollHeight = getScrollHeight()
      vertual.handScroll(offset)
      context.emit('scroll', { offset, clientHeight, scrollHeight })
      // 触底事件
      if (vertual.isBehind() && offset + clientHeight >= scrollHeight) {
        context.emit('toBottom')
      }
      // 触顶事件
      if (vertual.isFront() && offset <= 0 && !!props.resouce.length) {
        context.emit('toTop')
      }
    }
    const scrollToOffset = (offset: number, smooth?: boolean) => {
      const root = rootRef.value
      root?.scrollTo({
        top: offset,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
    const scrollToBottom = (smooth?: boolean) => {
      const root = rootRef.value
      root?.scrollTo({
        top: root.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
    const scrollToIndex = (index: number, smooth: boolean) => {
      if (index > props.resouce.length - 1) {
        scrollToBottom(smooth)
      } else {
        const offset = vertual.getIndexOffset(index)
        scrollToOffset(offset, smooth)
      }
    }
    context.expose({
      scrollToIndex,
      scrollToBottom,
    })

    return () => {
      const { startFront, endFront } = range.value
      return (
        <div ref={rootRef} onScroll={onScroll} class={'am-vertual-list'}>
          <div
            style={{
              padding: `${startFront}px 0px ${endFront}px 0px`,
              display: 'flex',
              flexDirection: 'column',
              gap: `${props.gap}px`,
            }}>
            {renderSlots()}
          </div>
          <div style={{ width: '100%', height: '0px' }}></div>
        </div>
      )
    }
  },
})
