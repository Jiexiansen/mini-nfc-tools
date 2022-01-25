import { isEmpty, generateUUID, throttle } from '../../utils/util'
Page({
  data: {
    strContent: '',
    lastKey: ''
  },
  onShow: function () {
    this.getClipboardData()
  },
  /**
   * 获取剪切板内容
   */
  getClipboardData() {
    wx.getClipboardData({
      success: res => {
        const { data } = res

        if (data && data != this.data.strContent) {
          wx.showModal({
            title: '识别到剪切板内容，是否粘贴？',
            content: data,
            confirmText: '粘贴',
            cancelText: '不了',
            confirmColor: '#22c068',
            cancelColor: '#999',
            showCancel: true,
            success: result => {
              if (result.confirm) {
                this.setData({
                  strContent: data
                })
              }
            }
          })
        }
      }
    })
  },
  onInputStr(e) {
    this.data.strContent = e.detail.value
  },
  /**
   * 批量加载
   */
  onTapLoad: throttle(function () {
    const strContent = this.data.strContent.trim()
    // 按 '逗号' 和 '回车' 进行分割
    const data = strContent.split(/[\n,，]/g)
    const list = []
    // 移除空数据
    for (let i = 0; i < data.length; i++) {
      if (data[i] == '') {
        data.splice(i, 1)
        i--
      } else {
        list.push({
          idx: i + 1,
          text: data[i],
          writeState: 0,
          verificationState: 0
        })
      }
    }

    console.log('list', list)

    if (isEmpty(list)) {
      wx.showToast({
        title: '分割数据为空，请重试！',
        icon: 'none'
      })
    } else {
      this.onRecordList({
        list
      })
    }
  }),
  onRecordList({ list, key }) {
    console.log('key', key)
    if (!key) {
      key = `record_${generateUUID()}`
      wx.setStorageSync(key, list)
    }

    wx.navigateTo({
      url: `/pages/write-list/index?key=${key}`,
      success: () => {
        this.setData({ lastKey: key })
      }
    })
  },
  /**
   * 清除
   */
  onClear() {
    this.setData({ strContent: '' })
  },
  /**
   * 继续上次操作
   */
  onLastOperate() {
    this.onRecordList({
      key: this.data.lastKey
    })
  }
})
