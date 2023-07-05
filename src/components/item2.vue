<script lang="ts">
import { defineComponent } from 'vue'
import item from './VertualList/item'

export default defineComponent({
  extends: item,
  props: {
    showAvatar: {
      type: Boolean,
      default: false,
    },
  },
})
</script>
