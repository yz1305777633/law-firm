<template>
  <!-- 表单模板管理组件 -->
  <div class="form-template-manager">
    <!-- 模板操作区域 -->
    <el-card class="template-card">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Collection /></el-icon>
            表单模板管理
          </span>
          <el-button 
            type="primary" 
            size="small" 
            @click="showSaveDialog = true"
            :disabled="!hasFormData"
          >
            保存当前模板
          </el-button>
        </div>
      </template>

      <!-- 模板列表 -->
      <div class="template-list">
        <div v-if="templates.length === 0" class="empty-state">
          <el-empty description="暂无保存的模板">
            <el-button type="primary" @click="showSaveDialog = true" :disabled="!hasFormData">
              保存第一个模板
            </el-button>
          </el-empty>
        </div>

        <div v-else class="template-grid">
          <div 
            v-for="template in templates" 
            :key="template.id"
            class="template-item"
          >
            <el-card class="template-item-card" shadow="hover">
              <div class="template-info">
                <h4 class="template-name">{{ template.name }}</h4>
                <p class="template-description">{{ template.description || '无描述' }}</p>
                <div class="template-meta">
                  <span class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    {{ formatDate(template.createdAt, 'legal') }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Document /></el-icon>
                    {{ getFieldCount(template.data) }} 个字段
                  </span>
                </div>
              </div>
              
              <div class="template-actions">
                <el-button-group>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="loadTemplate(template)"
                  >
                    加载
                  </el-button>
                  <el-button 
                    type="info" 
                    size="small" 
                    @click="previewTemplate(template)"
                  >
                    预览
                  </el-button>
                  <el-button 
                    type="warning" 
                    size="small" 
                    @click="editTemplate(template)"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="deleteTemplate(template.id)"
                  >
                    删除
                  </el-button>
                </el-button-group>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 保存模板对话框 -->
    <el-dialog 
      v-model="showSaveDialog" 
      title="保存表单模板" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="saveFormRef" 
        :model="saveForm" 
        :rules="saveFormRules" 
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input 
            v-model="saveForm.name" 
            placeholder="请输入模板名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="模板描述" prop="description">
          <el-input 
            v-model="saveForm.description" 
            type="textarea" 
            placeholder="请输入模板描述（可选）"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="模板标签">
          <el-select 
            v-model="saveForm.tags" 
            multiple 
            filterable 
            allow-create 
            placeholder="选择或创建标签"
            style="width: 100%"
          >
            <el-option 
              v-for="tag in availableTags" 
              :key="tag" 
              :label="tag" 
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showSaveDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存模板</el-button>
      </template>
    </el-dialog>

    <!-- 编辑模板对话框 -->
    <el-dialog 
      v-model="showEditDialog" 
      title="编辑模板信息" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="editFormRef" 
        :model="editForm" 
        :rules="saveFormRules" 
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input 
            v-model="editForm.name" 
            placeholder="请输入模板名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="模板描述" prop="description">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            placeholder="请输入模板描述（可选）"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="模板标签">
          <el-select 
            v-model="editForm.tags" 
            multiple 
            filterable 
            allow-create 
            placeholder="选择或创建标签"
            style="width: 100%"
          >
            <el-option 
              v-for="tag in availableTags" 
              :key="tag" 
              :label="tag" 
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateTemplate">更新模板</el-button>
      </template>
    </el-dialog>

    <!-- 模板预览对话框 -->
    <el-dialog 
      v-model="showPreviewDialog" 
      title="模板数据预览" 
      width="70%"
    >
      <div class="template-preview">
        <div class="preview-header">
          <h3>{{ previewTemplate?.name }}</h3>
          <p>{{ previewTemplate?.description }}</p>
        </div>
        
        <el-divider />
        
        <div class="preview-content">
          <pre class="data-preview">{{ formatPreviewData(previewTemplate?.data) }}</pre>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showPreviewDialog = false">关闭</el-button>
        <el-button type="primary" @click="loadTemplate(previewTemplate)">加载此模板</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 表单模板管理组件脚本
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Collection, Calendar, Document } from '@element-plus/icons-vue'
import { formatDate } from '../utils/formCalculations.js'

// 组件属性定义
const props = defineProps({
  // 当前表单数据
  formData: {
    type: Object,
    default: () => ({})
  },
  // 表单配置
  formConfig: {
    type: Object,
    default: () => ({ fields: [] })
  }
})

// 组件事件定义
const emit = defineEmits(['load-template'])

// 响应式数据
const templates = ref([]) // 模板列表
const showSaveDialog = ref(false) // 保存对话框显示状态
const showEditDialog = ref(false) // 编辑对话框显示状态
const showPreviewDialog = ref(false) // 预览对话框显示状态
const currentPreviewTemplate = ref(null) // 当前预览的模板
const currentEditTemplate = ref(null) // 当前编辑的模板

// 表单引用
const saveFormRef = ref()
const editFormRef = ref()

// 保存表单数据
const saveForm = reactive({
  name: '',
  description: '',
  tags: []
})

// 编辑表单数据
const editForm = reactive({
  name: '',
  description: '',
  tags: []
})

// 表单验证规则
const saveFormRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '模板名称长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 可用标签列表
const availableTags = ref([
  '诉讼表单',
  '雇佣纠纷',
  '合同纠纷',
  '常用模板',
  '紧急案件'
])

// 计算属性
const hasFormData = computed(() => {
  return Object.keys(props.formData).some(key => {
    const value = props.formData[key]
    return value && value !== '' && (!Array.isArray(value) || value.some(v => v && v.trim()))
  })
})

// 获取字段数量
const getFieldCount = (data) => {
  if (!data) return 0
  return Object.keys(data).filter(key => {
    const value = data[key]
    return value && value !== '' && (!Array.isArray(value) || value.some(v => v && v.trim()))
  }).length
}

// 格式化预览数据
const formatPreviewData = (data) => {
  if (!data) return ''
  return JSON.stringify(data, null, 2)
}

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 加载模板列表
const loadTemplates = () => {
  try {
    const savedTemplates = localStorage.getItem('formTemplates')
    if (savedTemplates) {
      templates.value = JSON.parse(savedTemplates)
    }
  } catch (error) {
    console.error('加载模板失败:', error)
    ElMessage.error('加载模板失败')
  }
}

// 保存模板列表到本地存储
const saveTemplatesToStorage = () => {
  try {
    localStorage.setItem('formTemplates', JSON.stringify(templates.value))
  } catch (error) {
    console.error('保存模板失败:', error)
    ElMessage.error('保存模板失败')
  }
}

// 保存模板
const saveTemplate = async () => {
  try {
    await saveFormRef.value.validate()
    
    const template = {
      id: generateId(),
      name: saveForm.name,
      description: saveForm.description,
      tags: saveForm.tags,
      data: { ...props.formData },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    templates.value.unshift(template)
    saveTemplatesToStorage()
    
    // 重置表单
    saveForm.name = ''
    saveForm.description = ''
    saveForm.tags = []
    showSaveDialog.value = false
    
    ElMessage.success('模板保存成功')
  } catch (error) {
    console.error('保存模板失败:', error)
  }
}

// 加载模板
const loadTemplate = (template) => {
  ElMessageBox.confirm(
    '加载模板将覆盖当前表单数据，是否继续？',
    '确认加载',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('load-template', template.data)
    ElMessage.success(`模板 "${template.name}" 加载成功`)
  }).catch(() => {
    // 用户取消
  })
}

// 预览模板
const previewTemplate = (template) => {
  currentPreviewTemplate.value = template
  showPreviewDialog.value = true
}

// 编辑模板
const editTemplate = (template) => {
  currentEditTemplate.value = template
  editForm.name = template.name
  editForm.description = template.description || ''
  editForm.tags = template.tags || []
  showEditDialog.value = true
}

// 更新模板
const updateTemplate = async () => {
  try {
    await editFormRef.value.validate()
    
    const index = templates.value.findIndex(t => t.id === currentEditTemplate.value.id)
    if (index !== -1) {
      templates.value[index] = {
        ...templates.value[index],
        name: editForm.name,
        description: editForm.description,
        tags: editForm.tags,
        updatedAt: new Date().toISOString()
      }
      
      saveTemplatesToStorage()
      showEditDialog.value = false
      ElMessage.success('模板更新成功')
    }
  } catch (error) {
    console.error('更新模板失败:', error)
  }
}

// 删除模板
const deleteTemplate = (templateId) => {
  ElMessageBox.confirm(
    '确定要删除这个模板吗？此操作不可恢复。',
    '确认删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = templates.value.findIndex(t => t.id === templateId)
    if (index !== -1) {
      const templateName = templates.value[index].name
      templates.value.splice(index, 1)
      saveTemplatesToStorage()
      ElMessage.success(`模板 "${templateName}" 删除成功`)
    }
  }).catch(() => {
    // 用户取消
  })
}

// 组件挂载时加载模板
onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
/* 表单模板管理组件样式 */
.form-template-manager {
  margin-top: 20px;
}

.template-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.template-list {
  min-height: 200px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.template-item-card {
  height: 100%;
  transition: transform 0.2s;
}

.template-item-card:hover {
  transform: translateY(-2px);
}

.template-info {
  margin-bottom: 15px;
}

.template-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.template-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.template-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.template-actions {
  text-align: center;
}

.template-actions .el-button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.template-actions .el-button {
  flex: 1;
  min-width: 60px;
}

.template-preview {
  max-height: 500px;
  overflow-y: auto;
}

.preview-header h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.preview-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.preview-content {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
}

.data-preview {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .template-actions .el-button {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>