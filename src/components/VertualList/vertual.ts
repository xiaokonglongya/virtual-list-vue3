interface IVertual {
  /**数据源 */
  resouce: Array<any>
  /**展示数量 */
  visibleCount: number
  /** item 估计高度 */
  estimateSize: number
  /**唯一key的数组 */
  uniqueIds: Array<string>
  /**缓冲区 */
  buffer: number
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
  sizes = new Map<string, number>()
  options: IVertual | null = null

  /**取值区间 */
  range: Range = Object.create(null) as Range
  /** 第一个范围的总高度 */
  firstRangeTotalSize: number | undefined = 0
  /** 第一个范围的平均高度 */
  firstRangeAverageSize: number | undefined = 0
  /**最后计算的索引 */
  lastCalcIndex: number = 0
  /** 固定的大小高度,用于计算偏移的值,越靠近实际大小确计算的越准 */
  fixedSizeHeight: number | undefined = void 0
  /**展示类型 */
  calcType = CALCTYPE.FIXED
  /**便宜量 */
  offset: number = 0
  /**滚动方向 */
  direction: string = SCROLLTYPE.FRONT
  /**更新视图 */
  updateView: null | ((range: Range) => void) = null
  constructor(options: IVertual, update: (range: Range) => void) {
    this.init(options, update)
  }
  init(options: IVertual | null, update: null | ((range: Range) => void)) {
    this.options = options
    this.updateView = update

    this.sizes = new Map()
    this.firstRangeAverageSize = 0
    this.firstRangeTotalSize = 0
    this.fixedSizeHeight = 0
    this.lastCalcIndex = 0
    this.calcType = CALCTYPE.INIT

    this.offset = 0
    this.direction = ''

    this.range = Object.create(null) as Range
    if (options) {
      this.checkRange(0, options.visibleCount - 1)
    }
  }
  /**销毁 */
  destroy() {
    this.init(null, null)
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

  /**是否向前 */
  isFront() {
    return this.direction === SCROLLTYPE.FRONT
  }
  /**是否向后 */
  isBehind() {
    return this.direction === SCROLLTYPE.BEHIND
  }

  /**更新参数 */
  updateParams(key: string, value: any) {
    if (this.options && key in this.options) {
      if (key === 'uniqueIds') {
        this.sizes.forEach((_, key) => {
          if (!value.includes(key)) {
            this.sizes.delete(key)
          }
        })
      }
      // @ts-ignore
      this.options[key] = value
    }
  }

  /**设置指定UID高度 */
  setSize(uid: string, size: number) {
    this.sizes.set(uid, size)

    // 初始化计算类型
    if (this.calcType === CALCTYPE.INIT) {
      this.fixedSizeHeight = size
      this.calcType = CALCTYPE.FIXED
    } else if (this.calcType === CALCTYPE.FIXED && this.fixedSizeHeight !== size) {
      this.calcType = CALCTYPE.DYNAMIC
      delete this.fixedSizeHeight
    }
    // 当前的计算类型不是固定的,并且第一次渲染的总大小已经计算出来,则重新计算
    if (this.options && this.calcType !== CALCTYPE.FIXED && typeof this.firstRangeTotalSize !== void 0) {
      // 如果当前储存的大小数量大于可见数量或者总数,则重新计算
      if (this.sizes.size < Math.min(this.options.visibleCount, this.options.uniqueIds.length)) {
        this.firstRangeTotalSize = [...this.sizes.values()].reduce((a, b) => a + b, 0)
        this.firstRangeAverageSize = Math.round(this.firstRangeTotalSize / this.sizes.size)
      } else {
        delete this.firstRangeTotalSize
      }
    }
  }
  /** 源数据长度变化更新 */
  handleSourceDataChange() {
    let start = this.range.start
    if (this.isFront()) {
      start = start - 2
    } else if (this.isBehind()) {
      start = start + 2
    }
    start = Math.max(start, 0)
    this.updateRange(this.range.start, this.getEndIndexByStartIndex(start))
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
    if (this.options && overs < this.range.start + this.options?.buffer) return
    this.checkRange(overs, this.getEndIndexByStartIndex(overs))
  }

  /**
   * 获取最后的偏移量
   * @returns
   */
  getScrollOver() {
    if (!this.options) return 0
    const offset = this.offset
    if (offset <= 0) return 0
    if (this.calcType === CALCTYPE.FIXED && this.fixedSizeHeight) {
      return Math.floor(offset / this.fixedSizeHeight)
    }
    let low = 0
    let middle = 0
    let middleOffset = 0
    let high = this.options.uniqueIds.length
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
  /**获取指定开始索引偏移量 */
  getIndexOffset(gindex: number) {
    if (!gindex || !this.options) return 0
    let offset = 0
    let index_size: undefined | number = 0
    for (let index = 0; index < gindex; index++) {
      index_size = this.sizes.get(this.options.uniqueIds[index])
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
  /**获取所有数据长度索引 */
  getLastIndex() {
    return this.options ? this.options.uniqueIds.length - 1 : 0
  }

  /**
   * 检查范围
   * @param start 开始
   * @param end 结束
   */
  checkRange(start: number, end: number) {
    if (!this.options) return
    const visible_count = this.options.visibleCount
    const total = this.options.uniqueIds.length
    // 如果总数小于可见数量,则全部展示
    if (total <= visible_count) {
      start = 0
      end = this.getLastIndex()
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
    this.updateView && this.updateView(this.getRange())
  }
  /**获取最后的索引，通过开始索引 */
  getEndIndexByStartIndex(start: number) {
    if (!this.options) return 0
    const theoryEnd = start + this.options.visibleCount - 1
    const turelyEnd = Math.min(theoryEnd, this.getLastIndex())
    return turelyEnd
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

  /**获取预估每个的高度 */
  getEstimateSize() {
    if (!this.options) return 0
    if (this.calcType === CALCTYPE.FIXED && this.fixedSizeHeight) return this.fixedSizeHeight
    return this.firstRangeAverageSize ? this.firstRangeAverageSize : this.options.estimateSize
  }
}
