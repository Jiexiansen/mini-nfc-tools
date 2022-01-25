import { byteToString, formatNullCharacter, throttle } from '../../utils/util'

Page({
  NFCAdapter: null,
  data: {
    btnTypes: {
      0: 'default',
      1: 'primary',
      2: 'warn'
    },
    currentWriteNdef: '',
    key: '',
    keyList: [],
    title: '',
    content: '',
    read: {},
    writeItem: {},
    validateItem: {},
    infoState: 1
  },
  onLoad: function (options) {
    const key = options.key || 'record_5241db3580af4717b5e8c8ed0f6ea95f'
    const keyList = wx.getStorageSync(key)

    this.data.key = key
    this.setData({ keyList })
  },
  onShow() {
    this.NFCAdapter = wx.getNFCAdapter()
    this.NFClistener()
  },
  /**
   * 开启监听NFC事件
   */
  NFClistener() {
    this.NFCAdapter.startDiscovery({
      success: () => {
        this.setData({ title: '开启NFC适配器成功!' })
      },
      fail: error => {
        console.log('开启NFC适配器失败！', error)
        wx.showToast({
          title: '开启适配器失败',
          icon: 'error'
        })
        this.setData({
          title: '开启适配器失败!',
          infoState: 0
        })
      }
    })
  },
  /**
   * 验证 监听回调
   */
  validateDiscoverHandler(callback) {
    console.log('==================== START ====================')
    console.log('onDiscovered callback=>', callback)
    if (callback.techs.length != 0) {
      this.setData({
        title: '识别成功！',
        infoState: 1
      })
    } else {
      this.setData({
        title: '无效设备',
        infoState: 0
      })
    }

    if (callback.messages) {
      let cordsArray = callback.messages[0].records
      cordsArray.forEach(item => {
        const read = {
          payload: formatNullCharacter(byteToString(new Uint8Array(item.payload))),
          id: byteToString(new Uint8Array(item.id)),
          type: byteToString(new Uint8Array(item.type))
        }
        const validateItem = this.data.validateItem
        let title = ''
        let icon = ''
        let verificationState = ''
        let infoState = 1

        if (validateItem.text == this.data.read.payload) {
          title = '验证成功~'
          icon = 'none'
          verificationState = 1
        } else {
          title = '验证失败！'
          icon = 'error'
          verificationState = 2
          infoState = 0
        }
        this.setData({
          title,
          read,
          infoState,
          [`keyList[${validateItem.idx - 1}].verificationState`]: verificationState
        })
        wx.showToast({
          title,
          icon
        })
        this.handleSyncStorageKey()
      })
    }
    console.log('read', this.data.read)

    this.NFCAdapter.offDiscovered(this.validateDiscoverHandler)
    console.log('===================== END =====================')
  },
  /**
   * 写入数据
   */
  onWriteNdefInfo: throttle(function (e) {
    const item = e.currentTarget.dataset.item
    this.data.writeItem = item
    wx.showToast({
      title: '靠近NFC标签',
      icon: 'loading',
      duration: 100000
    })
    // 监听 NFC 标签
    this.NFCAdapter.onDiscovered(this.writeDiscoverHandler)
  }),
  /**
   * 写入 监听
   */
  async writeDiscoverHandler() {
    wx.showToast({
      title: '识别NFC标签',
      icon: 'loading',
      duration: 1000000
    })

    const NFCTab = await this.initTab()

    if (!NFCTab) return

    const writeItem = this.data.writeItem
    let title = ''
    let icon = 'none'
    let writeState = 0
    let infoState = 1
    let read = {
      type: '',
      payload: ''
    }

    // 执行写入
    NFCTab.writeNdefMessage({
      uris: [writeItem.text],
      success: () => {
        title = '数据写入成功'
        icon = 'success'
        writeState = 1
        read.type = 'U'
        read.payload = writeItem.text
      },
      fail: () => {
        title = '数据写入失败'
        icon = 'error'
        writeState = 2
        infoState = 0
      },
      complete: res => {
        console.log('数据写入: res', res)
        wx.showToast({
          title,
          icon
        })
        this.setData({
          title,
          read,
          infoState,
          [`keyList[${writeItem.idx - 1}].writeState`]: writeState
        })
        this.closeConnect(NFCTab)
        this.handleSyncStorageKey()
      }
    })
  },
  /**
   * 连接设备NFC
   */
  initTab() {
    const NFCTab = this.NFCAdapter.getNdef()
    return new Promise((resolve, reject) => {
      NFCTab.connect({
        success: () => {
          this.setData({
            title: '连接设备成功',
            infoState: 1
          })
          resolve(NFCTab)
        },
        fail: error => {
          console.log('error', error)
          wx.showToast({
            title: '连接设备失败',
            icon: 'error'
          })
          this.setData({
            title: '连接设备失败',
            infoState: 0
          })
          this.NFCAdapter.offDiscovered(this.writeDiscoverHandler)
          reject()
        }
      })
    })
  },
  // 读写完毕，断开连接
  closeConnect(NFCTab) {
    NFCTab.close({
      complete: res => {
        console.log('清除标签连接：res', res)
        this.NFCAdapter.offDiscovered(this.writeDiscoverHandler)
      }
    })
  },
  /**
   * 验证
   */
  onValidate: throttle(function (e) {
    const item = e.currentTarget.dataset.item
    this.data.validateItem = item

    wx.showToast({
      title: '靠近NFC标签',
      icon: 'loading',
      duration: 1000000
    })
    // 监听 NFC 标签
    this.NFCAdapter.onDiscovered(this.validateDiscoverHandler)
  }),
  /**
   * 同步数据
   */
  handleSyncStorageKey() {
    wx.setStorageSync(this.data.key, this.data.keyList)
  },
  closeNFC() {
    if (this.NFCAdapter) {
      this.NFCAdapter.offDiscovered(this.writeDiscoverHandler)
      this.NFCAdapter.offDiscovered(this.validateDiscoverHandler)
      this.NFCAdapter.stopDiscovery()
      this.NFCAdapter = null
    }
  },
  onHide: function () {
    this.closeNFC()
  },
  onUnload: function () {
    this.closeNFC()
  }
})
