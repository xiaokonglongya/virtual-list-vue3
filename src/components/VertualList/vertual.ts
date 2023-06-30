interface IVertual {
  /**数据源 */
  resouce: Array<any>
  /**展示数量 */
  visibleCount: number
  /**item 固定高度 */
  fixedSizeHeight: number
}
/** 子内容高度类型 */
const CALCTYPE = {
  DYNAMIC: 'dynamic',
  FIXED: 'fixed',
}
/**滚动的方向 */
const SCROLLTYPE = {
  FRONT: 'front',
  BEHIND: 'behind',
}
export type Range = {
  start: number
  end: number
  startFront: number
  endFront: number
}
export default class Vertual {
  options: IVertual = {} as typeof Vertual.prototype.options
  uids: Array<string | number> = []
  /**展示数量 */
  visibleCount: number = 0
  /**展示类型 */
  calcType = CALCTYPE.FIXED
  /** 固定的大小高度,用于计算偏移的值,越靠近实际大小确计算的越准 */
  fixedSizeHeight: number = 50
  range: Range = Object.create(null) as Range
  offset: number = 0
  direction: string = SCROLLTYPE.FRONT
  /**更新试图 */
  updateView: (range: Range) => void = () => {}
  constructor(options: IVertual, update: (range: Range) => void) {
    this.init(options, update)
  }
  init(options: IVertual, update: (range: Range) => void) {
    this.options = options
    this.updateView = update
    this.range = Object.create(null) as Range
    if (options) {
      this.checkRange(0, options.visibleCount - 1)
    }
  }
  /**获取最后的索引，通过开始索引 */
  getEndIndexByStartIndex(start: number) {
    const theoryEnd = start + this.options.visibleCount - 1
    const turelyEnd = Math.min(theoryEnd, this.getTotalLength() - 1)
    return turelyEnd
  }

  getItemSize(index: number) {
    return this.options.fixedSizeHeight
  }
  getEstimateSize() {
    return this.calcType === CALCTYPE.FIXED ? this.fixedSizeHeight : this.options.fixedSizeHeight
  }
  getIndexOffset(gindex: number) {
    if (!gindex) return 0
    let offset = 0
    let index_size = 0
    for (let index = 0; index < gindex; index++) {
      index_size = this.getItemSize(index)
      offset = offset += typeof index_size === 'number' ? index_size : this.getEstimateSize()
    }
    return offset
  }
  /**获取所有数据长度 */
  getTotalLength() {
    return this.options.resouce.length
  }

  getScrollOver() {
    const offset = this.offset
    if (offset <= 0) return 0
    if (this.calcType === CALCTYPE.FIXED) {
      return Math.floor(offset / this.fixedSizeHeight)
    }
    return 0
  }
  /**向前滚动 */
  handleFront() {
    const overs = this.getScrollOver()
    if (overs > this.range.start) {
      return
    }
    this.checkRange(overs, this.getEndIndexByStartIndex(overs))
  }
  /**向后滚动 */
  handleBehind() {
    const overs = this.getScrollOver()
    this.checkRange(overs, this.getEndIndexByStartIndex(overs))
  }
  /**滚动条滚动 */
  handScroll(offset: number) {
    this.direction = offset < this.offset ? SCROLLTYPE.FRONT : SCROLLTYPE.BEHIND
    this.offset = offset
    if (!this.options) return
    if (this.direction === SCROLLTYPE.FRONT) {
      this.handleFront()
    }
    if (this.direction === SCROLLTYPE.BEHIND) {
      this.handleBehind()
    }
  }
  updateParams(options: IVertual) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        const _key = key as keyof IVertual
        const value = options[_key]
        this.options[_key] = value as any
      }
    }
  }
  /**
   * 检查范围
   * @param start 开始
   * @param end 结束
   */
  checkRange(start: number, end: number) {
    const total = this.getTotalLength()
    const visible_count = this.visibleCount
    // 如果总数小于可见数量,则全部展示
    if (total <= visible_count) {
      start = 0
      end = total - 1
      // 如果结束位置减去开始位置小于可见数量,则从开始位置开始展示
    } else if (end - start < visible_count - 1) {
      start = end - visible_count + 1
    }
    if (this.range.start !== start) {
      this.updateRange(start, end)
    }
  }

  /**更新渲染范围 */
  updateRange(start: number, end: number) {
    this.range.start = start
    this.range.end = end
    this.range.startFront = this.getStartFront()
    this.range.endFront = this.getEndFront()
    this.updateView(this.range)
  }
  /**获取前方预计大小 */
  getStartFront() {
    if (this.calcType === CALCTYPE.FIXED) {
      return this.range.start * this.fixedSizeHeight || 0
    }
    return 0
  }
  /**获取后方预计大小 */
  getEndFront() {
    const end = this.range.end
    const lastIndex = this.options.resouce.length - 1
    if (this.calcType === CALCTYPE.FIXED) {
      return (lastIndex - end) * this.fixedSizeHeight || 0
    }
    return 0
  }

  /**当前的渲染范围 */
  getRange() {
    const range = Object.create(null) as Range
    range.start = this.range.start
    range.end = this.range.end
    range.startFront = this.range.startFront
    range.endFront = this.range.endFront
    return range
  }
}
