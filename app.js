// app.js
App({
  onLaunch() {
    this.checkPlatform()
    // 清除本地数据
    wx.clearStorageSync() // TODO debug
  },
  globalData: {
    userInfo: null
  },
  checkPlatform() {
    const sys = wx.getSystemInfoSync()

    this.globalData.platform = sys.platform
    if (sys && sys.platform != 'android' && sys.platform != 'devtools') {
      this.globalData.nfcIsAvailable = false
      wx.showModal({
        title: '当前设备暂不支持NFC功能，请使用Android设备进行体验',
        showCancel: false
      })
    }
  }
})
