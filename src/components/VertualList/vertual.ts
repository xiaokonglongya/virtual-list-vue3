interface IVertual {
  /**数据源 */
  resouce: Array<any>
  /**展示数量 */
  visibleCount: number
  /** item 估计高度 */
  estimateSize: number
}
/** 子内容高度类型 */
const CALCTYPE = {
  DYNAMIC: 'dynamic',
  FIXED: 'fixed',
  INIT: 'init',
}
/**滚动的方向 */
const SCROLLTYPE = {
  /**向前 */
  FRONT: 'front',
  /**向后 */
  BEHIND: 'behind',
}
export type Range = {
  start: number
  end: number
  startFront: number
  endFront: number
}
export default class Vertual {
  sizes = new Map<
    string,
    {
      height: number
      index: number
    }
  >()
  options: IVertual = {} as typeof Vertual.prototype.options
  uniqueIds: Array<string> = []
  /**展示数量 */
  visibleCount: number = 0
  /**展示类型 */
  calcType = CALCTYPE.FIXED
  /** 固定的大小高度,用于计算偏移的值,越靠近实际大小确计算的越准 */
  fixedSizeHeight: number | undefined = void 0
  /**取值区间 */
  range: Range = Object.create(null) as Range
  /**便宜量 */
  offset: number = 0
  /**滚动方向 */
  direction: string = SCROLLTYPE.FRONT
  /** 第一个范围的总高度 */
  firstRangeTotalSize: number | undefined = 0
  /** 第一个范围的平均高度 */
  firstRangeAverageSize: number | undefined = 0
  /**最后计算的索引 */
  lastCalcIndex: number = 0
  /**数据缓冲区 */
  buffer: number = 0
  /**估计高度 */
  estimateSize: number = 0

  init(options: IVertual, update: (range: Range) => void) {
    this.firstRangeAverageSize = 0
    this.firstRangeTotalSize = 0
    this.sizes = new Map()
    this.fixedSizeHeight = 0
    this.calcType = CALCTYPE.INIT
    this.buffer = this.visibleCount * 2
    this.estimateSize = options.estimateSize
    this.options = options
    this.updateView = update
    this.range = Object.create(null) as Range
    if (options) {
      this.uniqueIds.length = this.options.resouce.length
      this.checkRange(0, options.visibleCount - 1)
    }
  }
  /**是否向前 */
  isFront() {
    return this.direction === SCROLLTYPE.FRONT
  }
  /**是否向后 */
  isBehind() {
    return this.direction === SCROLLTYPE.BEHIND
  }

  /**更新参数 */
  updateParams(options: IVertual) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        const _key = key as keyof IVertual
        const value = options[_key]
        this.options[_key] = value as any
      }
    }
  }

  /**更新视图 */
  updateView: (range: Range) => void = () => {}
  constructor(options: IVertual, update: (range: Range) => void) {
    this.init(options, update)
  }
  /**获取所有数据长度索引 */
  getLastIndex() {
    return this.uniqueIds.length - 1
  }
  /**获取最后的索引，通过开始索引 */
  getEndIndexByStartIndex(start: number) {
    const theoryEnd = start + this.options.visibleCount - 1
    const turelyEnd = Math.min(theoryEnd, this.getLastIndex())
    return turelyEnd
  }
  /**获取预估每个的高度 */
  getEstimateSize() {
    if (this.calcType === CALCTYPE.FIXED && this.fixedSizeHeight) return this.fixedSizeHeight
    return this.firstRangeAverageSize ? this.firstRangeAverageSize : this.estimateSize
  }
  /**获取指定开始索引偏移量 */
  getIndexOffset(gindex: number) {
    if (!gindex) return 0
    let offset = 0
    let index_size: undefined | number = 0
    for (let index = 0; index < gindex; index++) {
      index_size = this.sizes.get(this.uniqueIds[index])?.height
      if (typeof index_size === 'number') {
        offset += index_size
      } else {
        offset += this.getEstimateSize()
      }
    }
    this.lastCalcIndex = Math.max(this.lastCalcIndex, gindex - 1)
    this.lastCalcIndex = Math.min(this.lastCalcIndex, this.getLastIndex())
    return offset
  }
  /**
   * 获取最后的偏移量
   * @returns
   */
  getScrollOver() {
    const offset = this.offset
    if (offset <= 0) return 0
    if (this.calcType === CALCTYPE.FIXED && this.fixedSizeHeight) {
      return Math.floor(offset / this.fixedSizeHeight)
    }
    let low = 0
    let middle = 0
    let middleOffset = 0
    let high = this.uniqueIds.length
    while (low <= high) {
      middle = low + Math.floor((high - low) / 2)
      middleOffset = this.getIndexOffset(middle)

      if (middleOffset === offset) {
        return middle
      } else if (middleOffset < offset) {
        low = middle + 1
      } else if (middleOffset > offset) {
        high = middle - 1
      }
    }
    return low > 0 ? --low : 0
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
    if (overs < this.range.start + this.buffer) return
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

  /**
   * 检查范围
   * @param start 开始
   * @param end 结束
   */
  checkRange(start: number, end: number) {
    const total = this.getLastIndex()
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
  /**
   * 更新所有的uniqueId
   */
  updateUniqueIds(uniqueIds: string[]) {
    this.sizes.forEach((_, key) => {
      if (!uniqueIds.includes(key)) {
        this.sizes.delete(key)
      }
    })
    this.uniqueIds = uniqueIds
  }
  /**更新渲染范围 */
  updateRange(start: number, end: number) {
    this.range.start = start
    this.range.end = end
    this.range.startFront = this.getStartFront()
    this.range.endFront = this.getEndFront()
    this.updateView(this.getRange())
  }
  /**获取前方预计大小 */
  getStartFront() {
    if (this.calcType === CALCTYPE.FIXED && this.fixedSizeHeight) {
      return this.range.start * this.fixedSizeHeight || 0
    } else {
      return this.getIndexOffset(this.range.start)
    }
  }
  /**获取后方预计大小 */
  getEndFront() {
    const lastIndex = this.getLastIndex()
    const end = this.range.end
    if (this.calcType === CALCTYPE.FIXED && this.fixedSizeHeight) {
      return (lastIndex - end) * this.fixedSizeHeight
    }
    if (this.lastCalcIndex === lastIndex) {
      return this.getIndexOffset(lastIndex) - this.getIndexOffset(end)
    } else {
      return (lastIndex - end) * this.getEstimateSize()
    }
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

  /**设置指定UID高度 */
  setSize(uid: string, size: { height: number; index: number }) {
    this.sizes.set(uid, size)
    this.sizes = new Map(Array.from(this.sizes).sort((a, b) => a[1].index - b[1].index))
    // 初始化计算类型
    if (this.calcType === CALCTYPE.INIT) {
      this.fixedSizeHeight = size.height
      this.calcType = CALCTYPE.FIXED
    } else if (this.calcType === CALCTYPE.FIXED && this.fixedSizeHeight !== size.height) {
      this.calcType = CALCTYPE.DYNAMIC
      delete this.fixedSizeHeight
    }
    // 当前的计算类型不是固定的,并且第一次渲染的总大小已经计算出来,则重新计算
    if (this.calcType !== CALCTYPE.FIXED && typeof this.firstRangeTotalSize !== void 0) {
      // 如果当前储存的大小数量大于可见数量或者总数,则重新计算
      if (this.sizes.size < Math.min(this.options.visibleCount, this.uniqueIds.length)) {
        this.firstRangeTotalSize = [...this.sizes.values()].reduce((a, b) => a + b.height, 0)
        this.firstRangeAverageSize = Math.round(this.firstRangeTotalSize / this.sizes.size)
      } else {
        delete this.firstRangeTotalSize
      }
    }
  }
}
