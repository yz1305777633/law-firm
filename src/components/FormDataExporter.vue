<template>
  <!-- 表单数据导出组件 -->
  <div class="form-data-exporter">
    <!-- 导出操作按钮组 -->
    <div class="export-actions">
      <el-button-group>
        <el-button 
          type="primary" 
          :icon="Download" 
          @click="exportAsJSON"
        >
          导出JSON
        </el-button>
        <el-button 
          type="success" 
          :icon="Document" 
          @click="exportAsText"
        >
          导出文本
        </el-button>
        <el-button 
          type="info" 
          :icon="CopyDocument" 
          @click="copyToClipboard"
        >
          复制数据
        </el-button>
      </el-button-group>
    </div>

    <!-- 导出格式选择 -->
    <div class="export-options" v-if="showOptions">
      <el-card class="options-card">
        <template #header>
          <span>导出选项</span>
        </template>
        
        <!-- JSON导出选项 -->
        <div class="option-group">
          <h4>JSON格式选项</h4>
          <el-checkbox v-model="exportOptions.includeEmpty">包含空值字段</el-checkbox>
          <el-checkbox v-model="exportOptions.prettyFormat">格式化输出</el-checkbox>
          <el-checkbox v-model="exportOptions.includeMetadata">包含元数据</el-checkbox>
        </div>

        <!-- 文本导出选项 -->
        <div class="option-group">
          <h4>文本格式选项</h4>
          <el-radio-group v-model="exportOptions.textFormat">
            <el-radio value="keyValue">键值对格式</el-radio>
            <el-radio value="template">模板格式</el-radio>
            <el-radio value="table">表格格式</el-radio>
          </el-radio-group>
        </div>

        <div class="option-actions">
          <el-button @click="showOptions = false">取消</el-button>
          <el-button type="primary" @click="executeExport">确认导出</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
// 表单数据导出组件脚本
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Document, CopyDocument } from '@element-plus/icons-vue'
import { formatDate } from '../utils/formCalculations.js'

// 组件属性定义
const props = defineProps({
  // 表单数据
  formData: {
    type: Object,
    required: true,
    default: () => ({})
  },
  // 表单配置
  formConfig: {
    type: Object,
    required: true,
    default: () => ({ fields: [] })
  },
  // 文件名前缀
  fileNamePrefix: {
    type: String,
    default: 'complaint-form'
  }
})

// 响应式数据
const showOptions = ref(false) // 是否显示导出选项
const currentExportType = ref('') // 当前导出类型

// 导出选项配置
const exportOptions = reactive({
  includeEmpty: false, // 是否包含空值字段
  prettyFormat: true, // 是否格式化JSON
  includeMetadata: true, // 是否包含元数据
  textFormat: 'keyValue' // 文本格式类型
})

// 生成文件名
const generateFileName = (extension) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
  return `${props.fileNamePrefix}_${timestamp}.${extension}`
}

// 过滤表单数据
const getFilteredData = () => {
  const data = { ...props.formData }
  
  if (!exportOptions.includeEmpty) {
    // 移除空值字段
    Object.keys(data).forEach(key => {
      const value = data[key]
      if (value === '' || value === null || value === undefined || 
          (Array.isArray(value) && value.every(v => !v || !v.trim()))) {
        delete data[key]
      }
    })
  }
  
  return data
}

// 生成元数据
const generateMetadata = () => {
  return {
    exportTime: new Date().toISOString(),
    formTitle: props.formConfig.title || 'Dynamic Form',
    totalFields: props.formConfig.fields?.length || 0,
    filledFields: Object.keys(getFilteredData()).length,
    version: '1.0.0'
  }
}

// 导出为JSON格式
const exportAsJSON = () => {
  currentExportType.value = 'json'
  showOptions.value = true
}

// 导出为文本格式
const exportAsText = () => {
  currentExportType.value = 'text'
  showOptions.value = true
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    const data = getFilteredData()
    const jsonString = JSON.stringify(data, null, 2)
    
    await navigator.clipboard.writeText(jsonString)
    ElMessage.success('数据已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

// 执行导出操作
const executeExport = () => {
  if (currentExportType.value === 'json') {
    performJSONExport()
  } else if (currentExportType.value === 'text') {
    performTextExport()
  }
  showOptions.value = false
}

// 执行JSON导出
const performJSONExport = () => {
  try {
    const data = getFilteredData()
    
    let exportData = data
    if (exportOptions.includeMetadata) {
      exportData = {
        metadata: generateMetadata(),
        formData: data
      }
    }
    
    const jsonString = exportOptions.prettyFormat 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData)
    
    downloadFile(jsonString, generateFileName('json'), 'application/json')
    ElMessage.success('JSON文件导出成功')
  } catch (error) {
    ElMessage.error('JSON导出失败：' + error.message)
  }
}

// 执行文本导出
const performTextExport = () => {
  try {
    const data = getFilteredData()
    let textContent = ''
    
    // 添加标题和时间戳
    textContent += `${props.formConfig.title || 'Dynamic Form'}\n`
    textContent += `导出时间: ${formatDate(new Date(), 'legal')}\n`
    textContent += '=' .repeat(50) + '\n\n'
    
    switch (exportOptions.textFormat) {
      case 'keyValue':
        textContent += generateKeyValueFormat(data)
        break
      case 'template':
        textContent += generateTemplateFormat(data)
        break
      case 'table':
        textContent += generateTableFormat(data)
        break
    }
    
    downloadFile(textContent, generateFileName('txt'), 'text/plain')
    ElMessage.success('文本文件导出成功')
  } catch (error) {
    ElMessage.error('文本导出失败：' + error.message)
  }
}

// 生成键值对格式
const generateKeyValueFormat = (data) => {
  let content = ''
  
  props.formConfig.fields?.forEach(field => {
    const value = data[field.id]
    if (value !== undefined && value !== '') {
      content += `${field.label}: ${formatFieldValue(value, field)}\n`
    }
  })
  
  return content
}

// 生成模板格式
const generateTemplateFormat = (data) => {
  let content = ''
  
  // 按分类组织数据
  const categories = {}
  props.formConfig.fields?.forEach(field => {
    const category = field.category || 'General'
    if (!categories[category]) {
      categories[category] = []
    }
    if (data[field.id] !== undefined && data[field.id] !== '') {
      categories[category].push({
        label: field.label,
        value: formatFieldValue(data[field.id], field)
      })
    }
  })
  
  // 生成分类内容
  Object.keys(categories).forEach(category => {
    if (categories[category].length > 0) {
      content += `\n[${category}]\n`
      categories[category].forEach(item => {
        content += `${item.label}: ${item.value}\n`
      })
    }
  })
  
  return content
}

// 生成表格格式
const generateTableFormat = (data) => {
  let content = ''
  
  // 表头
  content += '字段名称'.padEnd(30) + '字段值\n'
  content += '-'.repeat(60) + '\n'
  
  // 表格内容
  props.formConfig.fields?.forEach(field => {
    const value = data[field.id]
    if (value !== undefined && value !== '') {
      const formattedValue = formatFieldValue(value, field)
      content += field.label.padEnd(30) + formattedValue + '\n'
    }
  })
  
  return content
}

// 格式化字段值
const formatFieldValue = (value, field) => {
  if (Array.isArray(value)) {
    return value.filter(v => v && v.trim()).join(', ')
  }
  
  if (field.type === 'date' && value) {
    return formatDate(value, 'legal')
  }
  
  if (field.type === 'number' && typeof value === 'number') {
    return value.toFixed(2)
  }
  
  return String(value || '')
}

// 下载文件
const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* 表单数据导出组件样式 */
.form-data-exporter {
  margin-top: 20px;
}

.export-actions {
  text-align: center;
  margin-bottom: 20px;
}

.export-options {
  margin-top: 20px;
}

.options-card {
  max-width: 500px;
  margin: 0 auto;
}

.option-group {
  margin-bottom: 20px;
}

.option-group h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.option-group .el-checkbox {
  display: block;
  margin-bottom: 8px;
}

.option-group .el-radio {
  display: block;
  margin-bottom: 8px;
}

.option-actions {
  text-align: right;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.option-actions .el-button {
  margin-left: 10px;
}
</style>