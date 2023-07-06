import { PropType } from 'vue'
export default {
  /**数据源 */
  resouce: {
    type: Array as PropType<Array<any>>,
    required: true,
    default: () => [],
  },
  /**唯一key */
  resouceKey: {
    type: [String, Function] as PropType<string | Function>,
    required: true,
    default: 'id',
  },
  /**每项高度 */
  estimateSize: {
    type: Number as PropType<number>,
    required: true,
    default: 30,
  },
  /**展示数量 */
  visibleCount: {
    type: Number as PropType<number>,
    required: true,
    default: 10,
  },
  /**渲染组件 */
  renderComponent: Object,
  /**间隔 */
  gap: {
    type: Number as PropType<number>,
    default: 0,
  },
}
