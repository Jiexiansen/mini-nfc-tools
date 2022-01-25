import { byteToString, isEmpty, formatNullCharacter } from '../../utils/util'
const app = getApp()

Page({
  NFCAdapter: null,
  data: {
    nfcInfo: {},
    msgTitle: '',
    typeText: { U: '网址', T: '文本' }
  },
  onShow: function () {
    this.onInit()
  },
  onInit() {
    const platform = app.globalData.platform

    if (platform == 'android') {
      this.NFCAdapter = wx.getNFCAdapter()
      this.NFClistener()
    } else {
      if (platform != 'devtools') {
        wx.showModal({
          title: '提示',
          content: '小程序NFC官方暂仅支持安卓设备',
          confirmColor: '#d93e4b',
          confirmText: '确定',
          showCancel: false
        })
      }

      this.setData({
        msgTitle: '小程序NFC官方暂仅支持安卓设备'
      })
    }
  },
  /**
   * 开始监听 NFC
   */
  NFClistener() {
    this.NFCAdapter.startDiscovery({
      success: () => {
        this.setData({
          msgTitle: '请将设备放入识别区NFC',
          msgContent: ''
        })
        // 监听 NFC 标签
        this.NFCAdapter.onDiscovered(this.discoverHandler)
      },
      fail: error => {
        this.setData({
          msgTitle: '请重试'
        })
        console.error(error)
      }
    })
  },
  /**
   * 监听回调
   */
  discoverHandler(callback) {
    console.log('==================== START ====================')
    console.log('onDiscovered callback=>', callback)
    if (callback.messages) {
      let cordsArray = callback.messages[0].records
      cordsArray.forEach(item => {
        const nfcInfo = {
          payload: formatNullCharacter(byteToString(new Uint8Array(item.payload))),
          id: byteToString(new Uint8Array(item.id)),
          type: byteToString(new Uint8Array(item.type))
        }
        this.setData({ nfcInfo })
      })
    } else {
      this.setData({ nfcInfo: {} })
    }
    console.log('nfcInfo', this.data.nfcInfo)

    if (callback.techs.length != 0) {
      let msgContent = '可支持标签：'
      callback.techs.forEach((res, index) => {
        if (index != 0) {
          msgContent += '、'
        }
        msgContent += res
      })
      this.setData({
        msgTitle: '识别成功！',
        msgContent
      })
    } else {
      this.setData({
        msgTitle: '无效设备'
      })
    }
    console.log('===================== END =====================')
  },
  /**
   * 拷贝 NDEF 信息
   */
  onClickNDEFContent() {
    const data = this.data.nfcInfo.payload
    if (isEmpty(data)) return

    wx.setClipboardData({ data })
  },
  closeNFC() {
    if (this.NFCAdapter) {
      this.NFCAdapter.offDiscovered(this.discoverHandler)
      this.NFCAdapter.stopDiscovery()
      this.NFCAdapter = null
    }
  },
  /**
   * 注销 NFCAdapter
   */
  onHide() {
    this.closeNFC()
  },
  onUnload: function () {
    this.closeNFC()
  }
})
