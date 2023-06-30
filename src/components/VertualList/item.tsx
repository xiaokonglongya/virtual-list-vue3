import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    comp: {
      type: [Object, Function],
      default: () => {},
    },
    source: {
      type: Object,
    },
  },
  setup(props, context) {
    const { comp, source } = props
    return () => {
      return (
        <div>
          <comp item={props.source} />
        </div>
      )
    }
  },
})
