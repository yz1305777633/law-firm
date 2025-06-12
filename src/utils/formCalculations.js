/**
 * 表单计算工具类
 * 用于处理动态表单中的各种计算逻辑
 */

/**
 * 计算雇佣周数
 * @param {string} startDate - 雇佣开始日期 (YYYY-MM-DD格式)
 * @param {string} endDate - 雇佣结束日期 (YYYY-MM-DD格式)
 * @returns {number} 雇佣周数
 */
export const calculateEmploymentWeeks = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // 计算天数差
  const timeDiff = end.getTime() - start.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
  
  // 转换为周数（向上取整）
  return Math.ceil(daysDiff / 7)
}

/**
 * 计算加班费
 * @param {number} hourlyRate - 小时工资率
 * @param {number} regularHours - 正常工作小时数
 * @param {number} overtimeHours15 - 1.5倍加班小时数
 * @param {number} overtimeHours20 - 2倍加班小时数
 * @returns {object} 包含各项费用的对象
 */
export const calculateOvertimePay = (hourlyRate, regularHours = 0, overtimeHours15 = 0, overtimeHours20 = 0) => {
  if (!hourlyRate || hourlyRate <= 0) {
    return {
      regularPay: 0,
      overtime15Pay: 0,
      overtime20Pay: 0,
      totalPay: 0,
      totalOvertimeHours: 0
    }
  }
  
  // 计算各项工资
  const regularPay = regularHours * hourlyRate
  const overtime15Pay = overtimeHours15 * hourlyRate * 1.5
  const overtime20Pay = overtimeHours20 * hourlyRate * 2.0
  const totalPay = regularPay + overtime15Pay + overtime20Pay
  const totalOvertimeHours = overtimeHours15 + overtimeHours20
  
  return {
    regularPay: Math.round(regularPay * 100) / 100,
    overtime15Pay: Math.round(overtime15Pay * 100) / 100,
    overtime20Pay: Math.round(overtime20Pay * 100) / 100,
    totalPay: Math.round(totalPay * 100) / 100,
    totalOvertimeHours
  }
}

/**
 * 计算工资单罚金
 * @param {number} payPeriods - 支付周期数
 * @param {number} maxPenalty - 最大罚金限额（默认4000）
 * @returns {number} 罚金金额
 */
export const calculateWageStatementPenalty = (payPeriods, maxPenalty = 4000) => {
  if (!payPeriods || payPeriods <= 0) return 0
  
  // 计算罚金：50 + (支付周期数 - 1) * 100
  const calculatedPenalty = 50 + (payPeriods - 1) * 100
  
  // 不超过最大限额
  return Math.min(calculatedPenalty, maxPenalty)
}

/**
 * 根据原告/被告数量确定单复数形式
 * @param {Array} names - 姓名数组
 * @param {object} pluralityConfig - 单复数配置对象
 * @returns {string} 对应的单复数形式
 */
export const determinePlurality = (names, pluralityConfig) => {
  if (!names || !Array.isArray(names)) return pluralityConfig.single || ''
  
  // 过滤掉空字符串，计算有效姓名数量
  const validNames = names.filter(name => name && name.trim())
  const count = validNames.length
  
  return count > 1 ? pluralityConfig.multiple : pluralityConfig.single
}

/**
 * 格式化日期为指定格式
 * @param {string|Date} date - 日期
 * @param {string} format - 格式类型 ('legal' | 'standard')
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'legal') => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return ''
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const month = months[dateObj.getMonth()]
  const day = dateObj.getDate()
  const year = dateObj.getFullYear()
  
  switch (format) {
    case 'legal':
      // 格式："June 10, 2025"
      return `${month} ${day}, ${year}`
    case 'standard':
      // 格式："2025-06-10"
      return dateObj.toISOString().split('T')[0]
    default:
      return `${month} ${day}, ${year}`
  }
}

/**
 * 验证表单字段值
 * @param {any} value - 字段值
 * @param {object} fieldConfig - 字段配置
 * @returns {object} 验证结果 { isValid: boolean, message: string }
 */
export const validateFieldValue = (value, fieldConfig) => {
  const { type, required, min, max } = fieldConfig
  
  // 必填验证
  if (required && (!value || (Array.isArray(value) && value.every(v => !v || !v.trim())))) {
    return {
      isValid: false,
      message: `${fieldConfig.label}是必填项`
    }
  }
  
  // 如果值为空且非必填，则通过验证
  if (!value && !required) {
    return { isValid: true, message: '' }
  }
  
  // 根据类型进行特定验证
  switch (type) {
    case 'number':
      const numValue = Number(value)
      if (isNaN(numValue)) {
        return {
          isValid: false,
          message: `${fieldConfig.label}必须是有效数字`
        }
      }
      if (min !== undefined && numValue < min) {
        return {
          isValid: false,
          message: `${fieldConfig.label}不能小于${min}`
        }
      }
      if (max !== undefined && numValue > max) {
        return {
          isValid: false,
          message: `${fieldConfig.label}不能大于${max}`
        }
      }
      break
      
    case 'date':
      const dateValue = new Date(value)
      if (isNaN(dateValue.getTime())) {
        return {
          isValid: false,
          message: `${fieldConfig.label}必须是有效日期`
        }
      }
      break
      
    case 'text':
    case 'textarea':
      if (typeof value !== 'string' && !Array.isArray(value)) {
        return {
          isValid: false,
          message: `${fieldConfig.label}格式不正确`
        }
      }
      break
  }
  
  return { isValid: true, message: '' }
}

/**
 * 计算所有相关字段的值
 * @param {object} formData - 表单数据
 * @param {Array} fieldConfigs - 字段配置数组
 * @returns {object} 计算后的字段值
 */
export const calculateAllComputedFields = (formData, fieldConfigs) => {
  const computedValues = {}
  
  fieldConfigs.forEach(field => {
    if (field.type === 'computed') {
      switch (field.computeRule) {
        case 'plaintiffCount':
          computedValues[field.id] = determinePlurality(
            formData.plaintiffName,
            field.values
          )
          break
          
        case 'defendantCount':
          computedValues[field.id] = determinePlurality(
            formData.defendantName,
            field.values
          )
          break
          
        case 'employmentWeeks':
          computedValues[field.id] = calculateEmploymentWeeks(
            formData.employmentStartDate,
            formData.employmentEndDate
          )
          break
          
        case 'overtimeCalculation':
          const overtimeResult = calculateOvertimePay(
            formData.hourlyRate,
            formData.regularHours || 0,
            formData.overtimeHours15 || 0,
            formData.overtimeHours20 || 0
          )
          computedValues[field.id] = overtimeResult.totalOvertimeHours
          break
          
        case 'wageStatementPenaltyCalculation':
          const weeks = calculateEmploymentWeeks(
            formData.employmentStartDate,
            formData.employmentEndDate
          )
          // 假设每周一个支付周期
          computedValues[field.id] = calculateWageStatementPenalty(weeks)
          break
          
        default:
          computedValues[field.id] = '未知计算规则'
      }
    }
  })
  
  return computedValues
}