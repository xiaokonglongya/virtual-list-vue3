import { defineComponent, onMounted, onUnmounted, onUpdated, ref } from 'vue'

export default defineComponent({
  name: 'VirtualListItem',
  props: {
    comp: {
      type: [Object, Function],
      default: () => {},
    },
    source: {
      type: Object,
    },
    index: {
      type: Number,
    },
    uniqueKey: {
      type: String,
    },
  },
  emits: ['HeightChange'],
  setup(props, context) {
    const vertualItemRef = ref<HTMLElement>()
    const dispatchHeightChange = () => {
      const hegiht = vertualItemRef.value?.offsetHeight || 0
      context.emit('HeightChange', props.uniqueKey, hegiht)
    }
    let resizeObserver: ResizeObserver | undefined = void 0
    onMounted(() => {
      resizeObserver = new ResizeObserver(() => {
        dispatchHeightChange()
      })
      vertualItemRef.value && resizeObserver.observe(vertualItemRef.value)
    })
    onUpdated(() => {
      dispatchHeightChange()
    })
    onUnmounted(() => {
      resizeObserver && resizeObserver.disconnect()
      resizeObserver = void 0
    })

    return () => {
      //@ts-ignore
      const { comp, source, index, uniqueKey } = props
      const merged = {
        index,
        item: source, // 数据源给到指定属性上
      }
      return (
        <div key={uniqueKey} ref={vertualItemRef} {...{ index }}>
          <comp {...merged} />
        </div>
      )
    }
  },
})
