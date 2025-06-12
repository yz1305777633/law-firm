<template>
  <!-- 动态表单组件 - 根据JSON配置渲染表单 -->
  <div class="dynamic-form">
    <!-- 表单标题和描述 -->
    <div class="form-header" v-if="config.title || config.description">
      <h2 v-if="config.title">{{ config.title }}</h2>
      <p v-if="config.description" class="form-description">{{ config.description }}</p>
    </div>

    <!-- Element Plus 表单容器 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="200px"
      label-position="left"
      class="dynamic-form-content"
    >
      <!-- 动态渲染表单字段 -->
      <template v-for="field in config.fields" :key="field.id">
        <!-- 普通文本输入框 -->
        <el-form-item
          v-if="field.type === 'text'"
          :label="field.label"
          :prop="field.id"
          :required="field.required"
        >
          <!-- 支持多个值的文本输入 -->
          <div v-if="field.multiple" class="multiple-input-container">
            <div
              v-for="(value, index) in getMultipleValues(field.id)"
              :key="index"
              class="multiple-input-item"
              v-if="getMultipleValues(field.id) && getMultipleValues(field.id).length > 0"
            >
              <el-input
                :model-value="formData[field.id] ? formData[field.id][index] : ''"
                @update:model-value="(val) => updateMultipleValue(field.id, index, val)"
                :placeholder="field.placeholder"
                class="multiple-input"
              />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click="removeMultipleValue(field.id, index)"
                v-if="getMultipleValues(field.id).length > 1"
              />
            </div>
            <el-button
              type="primary"
              :icon="Plus"
              @click="addMultipleValue(field.id)"
              class="add-button"
            >
              添加{{ field.label }}
            </el-button>
          </div>
          <!-- 单个文本输入 -->
          <el-input
            v-else
            v-model="formData[field.id]"
            :placeholder="field.placeholder"
          />
          <!-- 字段描述 -->
          <div v-if="field.description" class="field-description">
            {{ field.description }}
          </div>
        </el-form-item>

        <!-- 多行文本输入框 -->
        <el-form-item
          v-else-if="field.type === 'textarea'"
          :label="field.label"
          :prop="field.id"
          :required="field.required"
        >
          <el-input
            v-model="formData[field.id]"
            type="textarea"
            :placeholder="field.placeholder"
            :rows="3"
          />
          <div v-if="field.description" class="field-description">
            {{ field.description }}
          </div>
        </el-form-item>

        <!-- 数字输入框 -->
        <el-form-item
          v-else-if="field.type === 'number'"
          :label="field.label"
          :prop="field.id"
          :required="field.required"
        >
          <el-input-number
            v-model="formData[field.id]"
            :min="field.min || 0"
            :max="field.max"
            :step="field.step || 1"
            :placeholder="field.placeholder"
            style="width: 100%"
          />
          <div v-if="field.description" class="field-description">
            {{ field.description }}
          </div>
        </el-form-item>

        <!-- 日期选择器 -->
        <el-form-item
          v-else-if="field.type === 'date'"
          :label="field.label"
          :prop="field.id"
          :required="field.required"
        >
          <el-date-picker
            v-model="formData[field.id]"
            type="date"
            :placeholder="field.placeholder"
            format="MMMM DD, YYYY"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
          <div v-if="field.description" class="field-description">
            {{ field.description }}
          </div>
        </el-form-item>

        <!-- 选择器 -->
        <el-form-item
          v-else-if="field.type === 'select'"
          :label="field.label"
          :prop="field.id"
          :required="field.required"
        >
          <el-select
            v-model="formData[field.id]"
            :placeholder="field.placeholder"
            :multiple="field.multiple"
            style="width: 100%"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div v-if="field.description" class="field-description">
            {{ field.description }}
          </div>
        </el-form-item>

        <!-- 计算字段（只读显示） -->
        <el-form-item
          v-else-if="field.type === 'computed'"
          :label="field.label"
          :prop="field.id"
        >
          <el-input
            :model-value="getComputedValue(field)"
            readonly
            class="computed-field"
          />
          <div v-if="field.description" class="field-description">
            {{ field.description }}
          </div>
        </el-form-item>
      </template>

      <!-- 表单操作按钮 -->
      <el-form-item class="form-actions">
        <el-button type="primary" @click="handleSubmit">提交表单</el-button>
        <el-button @click="handleReset">重置表单</el-button>
        <el-button type="info" @click="handlePreview">预览数据</el-button>
      </el-form-item>
    </el-form>

    <!-- 表单数据导出组件 -->
    <div class="export-section">
      <el-divider content-position="center">
        <el-icon><Download /></el-icon>
        数据导出
      </el-divider>
      <FormDataExporter 
        :form-data="{ ...formData, ...computedValues }"
        :form-config="config"
        :file-name-prefix="'complaint-form'"
      />
    </div>

    <!-- 数据预览对话框 -->
    <el-dialog v-model="previewVisible" title="表单数据预览" width="60%">
      <pre class="data-preview">{{ JSON.stringify(formData, null, 2) }}</pre>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 动态表单组件脚本 - 使用Vue 3 Composition API
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Download } from '@element-plus/icons-vue'
import FormDataExporter from './FormDataExporter.vue'
import { 
  calculateAllComputedFields, 
  formatDate, 
  validateFieldValue 
} from '../utils/formCalculations.js'

// 组件属性定义
const props = defineProps({
  // 表单配置对象
  config: {
    type: Object,
    required: true,
    default: () => ({ fields: [] })
  },
  // 初始表单数据
  initialData: {
    type: Object,
    default: () => ({})
  }
})

// 组件事件定义
const emit = defineEmits(['submit', 'change'])

// 响应式数据
const formRef = ref() // 表单引用
const formData = reactive({}) // 表单数据
const previewVisible = ref(false) // 预览对话框显示状态

// 表单验证规则
const formRules = computed(() => {
  const rules = {}
  props.config.fields?.forEach(field => {
    if (field.required) {
      rules[field.id] = [
        {
          required: true,
          message: `请输入${field.label}`,
          trigger: field.type === 'select' ? 'change' : 'blur'
        }
      ]
    }
  })
  return rules
})

// 初始化表单数据
const initFormData = () => {
  props.config.fields?.forEach(field => {
    if (field.multiple) {
      // 多值字段初始化为数组
      formData[field.id] = props.initialData[field.id] || ['']
      // 确保至少有一个空值
      if (formData[field.id].length === 0) {
        formData[field.id].push('')
      }
      return
    } else if (field.type === 'computed') {
      // 计算字段不需要初始化
      return
    } else {
      // 普通字段初始化
      formData[field.id] = props.initialData[field.id] || field.defaultValue || ''
    }
  })
}

// 获取多值字段的值数组
const getMultipleValues = (fieldId) => {
  return formData[fieldId] || ['']
}

// 更新多值字段的特定索引值
const updateMultipleValue = (fieldId, index, value) => {
  if (!formData[fieldId]) {
    formData[fieldId] = []
  }
  formData[fieldId][index] = value
}

// 添加多值字段的新值
const addMultipleValue = (fieldId) => {
  if (!formData[fieldId]) {
    formData[fieldId] = []
  }
  formData[fieldId].push('')
}

// 删除多值字段的指定值
const removeMultipleValue = (fieldId, index) => {
  if (formData[fieldId] && formData[fieldId].length > 1) {
    formData[fieldId].splice(index, 1)
  }
}

// 计算字段的响应式值
const computedValues = computed(() => {
  return calculateAllComputedFields(formData, props.config.fields || [])
})

// 获取计算字段值
const getComputedValue = (field) => {
  const value = computedValues.value[field.id]
  
  // 如果是日期相关的计算，进行格式化
  if (field.computeRule && field.computeRule.includes('Date')) {
    return formatDate(value, 'legal')
  }
  
  // 如果是数字，保留两位小数
  if (typeof value === 'number' && !Number.isInteger(value)) {
    return value.toFixed(2)
  }
  
  return value || ''
}

// 表单提交处理
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate()
    
    // 发送提交事件
    emit('submit', { ...formData })
    
    ElMessage.success('表单提交成功！')
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入内容')
  }
}

// 表单重置处理
const handleReset = () => {
  formRef.value.resetFields()
  initFormData()
  ElMessage.info('表单已重置')
}

// 预览数据处理
const handlePreview = () => {
  previewVisible.value = true
}

// 监听表单数据变化
watch(
  () => formData,
  (newData) => {
    // 合并计算字段的值
    const allData = {
      ...newData,
      ...computedValues.value
    }
    emit('change', allData)
  },
  { deep: true }
)

// 监听计算值变化
watch(
  computedValues,
  (newComputedValues) => {
    // 当计算值变化时，也触发change事件
    const allData = {
      ...formData,
      ...newComputedValues
    }
    emit('change', allData)
  },
  { deep: true }
)

// 组件挂载时初始化
onMounted(() => {
  initFormData()
})
</script>

<style scoped>
/* 动态表单样式 */
.dynamic-form {
  max-width: 100%; /* 移除固定最大宽度，由父容器控制 */
  margin: 0 auto;
  padding: 24px; /* 调整内边距 */
  width: 100%;
  box-sizing: border-box;
}

.form-header {
  text-align: left; /* 标题左对齐 */
  margin-bottom: 24px; /* 调整外边距 */
  padding-bottom: 16px; /* 增加底部内边距 */
  border-bottom: 1px solid #f0f0f0; /* 添加分隔线 */
}

.form-header h2 {
  color: #1f2d3d; /* 深色标题 */
  margin-bottom: 8px; /* 调整外边距 */
  font-size: 1.6rem; /* 调整字体大小 */
  font-weight: 600; /* 调整字重 */
}

.form-description {
  color: #5a5e66; /* 调整字体颜色 */
  font-size: 0.9rem; /* 调整字体大小 */
  line-height: 1.6;
}

.dynamic-form-content {
  background: #ffffff; /* 保持白色背景 */
  padding: 24px; /* 调整内边距 */
  border-radius: 6px; /* 调整圆角 */
  /* 移除独立阴影，由父容器 .form-container 控制 */
  width: 100%;
  box-sizing: border-box;
}

.multiple-input-container {
  width: 100%;
}

.multiple-input-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px; /* 调整外边距 */
  gap: 12px; /* 调整间距 */
}

.multiple-input {
  flex: 1;
}

.add-button {
  margin-top: 8px; /* 调整外边距 */
}

.field-description {
  font-size: 0.85rem; /* 调整字体大小 */
  color: #8c939d; /* 调整字体颜色 */
  margin-top: 6px; /* 调整外边距 */
  line-height: 1.5;
}

.computed-field {
  background-color: #f7f8fa; /* 调整背景色 */
  padding: 10px 12px; /* 调整内边距 */
  border-radius: 4px; /* 调整圆角 */
  border: 1px solid #e4e7ed; /* 添加边框 */
}

.form-actions {
  text-align: right; /* 操作按钮右对齐 */
  margin-top: 32px; /* 调整外边距 */
  padding-top: 24px; /* 增加顶部内边距 */
  border-top: 1px solid #f0f0f0; /* 添加分隔线 */
}

.data-preview {
  background-color: #f7f8fa; /* 调整背景色 */
  padding: 16px; /* 调整内边距 */
  border-radius: 6px; /* 调整圆角 */
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; /* 使用更现代的等宽字体 */
  font-size: 0.8rem; /* 调整字体大小 */
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e4e7ed; /* 添加边框 */
}

.export-section {
  margin-top: 32px; /* 调整外边距 */
  padding: 24px; /* 调整内边距 */
  background: #f7f8fa; /* 调整背景色 */
  border-radius: 6px; /* 调整圆角 */
  border: 1px solid #e4e7ed; /* 添加边框 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dynamic-form {
    padding: 16px; /* 调整内边距 */
  }
  
  .form-header h2 {
    font-size: 1.4rem; /* 调整字体大小 */
  }
  
  .form-description {
    font-size: 0.85rem; /* 调整字体大小 */
  }
  
  .dynamic-form-content {
    padding: 16px; /* 调整内边距 */
  }
  
  .multiple-input-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px; /* 调整间距 */
  }
  
  .form-actions {
    text-align: center; /* 中小屏幕操作按钮居中 */
  }
}

@media (max-width: 480px) {
  .dynamic-form {
    padding: 12px; /* 调整内边距 */
  }

  .form-header {
    padding-bottom: 12px; /* 调整内边距 */
    margin-bottom: 16px; /* 调整外边距 */
  }

  .form-header h2 {
    font-size: 1.3rem; /* 调整字体大小 */
  }

  .dynamic-form-content {
    padding: 12px; /* 调整内边距 */
  }

  .form-actions {
    margin-top: 24px; /* 调整外边距 */
    padding-top: 16px; /* 调整内边距 */
  }

  .field-description {
    font-size: 0.8rem; /* 调整字体大小 */
  }

  .data-preview {
    font-size: 0.75rem; /* 调整字体大小 */
  }
}

/* 表单项响应式布局 */
@media (max-width: 768px) {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 14px;
    line-height: 1.4;
  }
  
  :deep(.el-input__inner) {
    font-size: 14px;
  }
  
  :deep(.el-select) {
    width: 100%;
  }
  
  :deep(.el-date-editor) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  :deep(.el-form-item__label) {
    font-size: 13px;
    margin-bottom: 5px;
  }
  
  :deep(.el-input__inner) {
    font-size: 13px;
    padding: 8px 12px;
  }
  
  :deep(.el-button) {
    padding: 8px 15px;
    font-size: 13px;
  }
  
  :deep(.el-button--small) {
    padding: 6px 10px;
    font-size: 12px;
  }
}

</style>