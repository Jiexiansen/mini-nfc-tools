/**
 * 字节对象转字符串
 * @param {Object} arr
 */
export const byteToString = function (arr) {
  if (typeof arr === 'string') {
    return arr
  }

  var str = '',
    _arr = arr

  for (var i = 0; i < _arr.length; i++) {
    var one = _arr[i].toString(2),
      v = one.match(/^1+?(?=0)/)

    if (v && one.length == 8) {
      var bytesLength = v[0].length

      var store = _arr[i].toString(2).slice(7 - bytesLength)

      for (var st = 1; st < bytesLength; st++) {
        store += _arr[st + i].toString(2).slice(2)
      }

      str += String.fromCharCode(parseInt(store, 2))

      i += bytesLength - 1
    } else {
      str += String.fromCharCode(_arr[i])
    }
  }
  return str
}

/**
 * 检验数据是否为空
 */
export const isEmpty = obj => {
  if (obj === '' || obj === null || obj === undefined) {
    return true
  } else if (obj.constructor === Array && obj.length === 0) {
    return true
  } else if (obj.constructor === Object && Object.keys(obj).length === 0) {
    return true
  } else {
    return false
  }
}

/**
 * 生成UUID
 */
export const generateUUID = () => {
  let d = new Date().getTime()
  let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

/**
 * 字符串转字节
 * @param {Object} str
 */
export const stringToArrayBuffer = function (str) {
  // 首先将字符串转为16进制
  let val = ''
  for (let i = 0; i < str.length; i++) {
    if (val === '') {
      val = str.charCodeAt(i).toString(16)
    } else {
      val += ',' + str.charCodeAt(i).toString(16)
    }
  }
  // 将16进制转化为ArrayBuffer
  return new Uint8Array(
    val.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    })
  ).buffer
}

/**
 * 移除空字符
 */
export const removeNullCharacter = str => {
  return str.replace(/\\u([0-9]|[a-fA-F])([0-9]|[a-fA-F])([0-9]|[a-fA-F])([0-9]|[a-fA-F])/g, '')
}

/**
 * 格式化空字符为空字符串
 */
export const formatNullCharacter = str => {
  if (!str) return ''
  return JSON.parse(removeNullCharacter(JSON.stringify(str)))
}

/**
 * 节流函数
 * fn是我们需要包装的事件回调, interval是时间间隔的阈值
 */
export const throttle = (fn, interval) => {
  // last为上一次触发回调的时间
  let last = 0

  interval = interval || 1000

  // 将throttle处理结果当作函数返回
  return function () {
    // 保留调用时的this上下文
    let context = this
    // 保留调用时传入的参数
    let args = arguments
    // 记录本次触发回调的时间
    let now = +new Date()

    // 判断上次触发的时间和本次触发的时间差是否小于时间间隔的阈值
    if (now - last >= interval) {
      // 如果时间间隔大于我们设定的时间间隔阈值，则执行回调
      last = now
      fn.apply(context, args)
    }
  }
}

/**
 * 格式化得到aid值
 * @param {Object} buffer
 */
// export const ab2hex = function (buffer) {
//   var hexArr = Array.prototype.map.call(
//     new Uint8Array(buffer),

//     function (bit) {
//       return ('00' + bit.toString(16)).slice(-2);
//     }
//   );
//   return hexArr.join('');
// };
