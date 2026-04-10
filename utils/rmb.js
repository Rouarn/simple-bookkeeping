/**
 * 大写金额
 * @description 将金额转换为大写金额
 * @param raw 金额
 * @returns 大写金额
 */
export function toRmbUppercase(raw) {
  const amount = Number(String(raw ?? '').replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(amount)) return ''

  const negative = amount < 0
  const abs = Math.abs(amount)
  const rounded = Math.round(abs * 100) / 100
  if (rounded === 0) return '零元整'

  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit1 = ['', '拾', '佰', '仟']
  const unit2 = ['', '万', '亿', '兆']

  const integerPart = Math.floor(rounded)
  const fractionPart = Math.round((rounded - integerPart) * 100)
  const jiao = Math.floor(fractionPart / 10)
  const fen = fractionPart % 10

  function sectionToChinese(section) {
    let out = ''
    let unitPos = 0
    let zero = true
    while (section > 0) {
      const d = section % 10
      if (d === 0) {
        if (!zero) {
          zero = true
          out = digit[0] + out
        }
      } else {
        zero = false
        out = digit[d] + unit1[unitPos] + out
      }
      unitPos++
      section = Math.floor(section / 10)
    }
    return out.replace(/零+/g, '零').replace(/零$/g, '')
  }

  let int = integerPart
  let intText = ''
  let sectionIndex = 0
  let needZero = false
  while (int > 0) {
    const section = int % 10000
    if (section === 0) {
      if (intText) needZero = true
    } else {
      let sectionText = sectionToChinese(section)
      if (needZero) intText = '零' + intText
      sectionText += unit2[sectionIndex]
      intText = sectionText + intText
      needZero = section < 1000
    }
    int = Math.floor(int / 10000)
    sectionIndex++
  }

  let fracText = ''
  if (jiao === 0 && fen === 0) {
    fracText = '整'
  } else {
    if (jiao !== 0) fracText += digit[jiao] + '角'
    if (fen !== 0) fracText += digit[fen] + '分'
  }

  if (integerPart === 0) {
    const result = fracText
    return negative ? `负${result}` : result
  }

  intText = (intText || '零') + '元'
  const result = intText + fracText
  return negative ? `负${result}` : result
}

