/* eslint-disable no-sequences */

// 格式化中心直径
export const formatDiameter = diameter => {
  if (diameter) {
    return Math.max(...diameter.replace('*', '').split('mm'))
  } else {
    return ''
  }
}
