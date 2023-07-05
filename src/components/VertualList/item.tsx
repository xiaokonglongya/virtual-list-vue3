import { defineComponent, onMounted, onUnmounted, onUpdated, ref } from 'vue'

export default defineComponent({
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
      if (!vertualItemRef.value) return
      const hegiht = vertualItemRef.value?.offsetHeight
      context.emit('HeightChange', source, hegiht)
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
    //@ts-ignore
    const { comp, source, index } = props
    return () => {
      return (
        <div ref={vertualItemRef} {...{ index }}>
          <comp item={source} />
        </div>
      )
    }
  },
})
