import { PropType } from 'vue'
export default {
  /**数据源 */
  resouce: {
    type: Array as PropType<Array<any>>,
    required: true,
    default: () => [],
  },
  /**每项高度 */
  itemHeight: {
    type: Number as PropType<number>,
    default: 50,
  },
  /**展示数量 */
  visibleCount: {
    type: Number as PropType<number>,
    required: true,
    default: 10,
  },
  /**展示类型 */
  calcType: String as PropType<'dynamic' | 'static'>,
  /**渲染组件 */
  renderComponent: Object,
}
