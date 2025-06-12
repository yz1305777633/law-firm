<script setup>
// 主应用组件 - 法律事务所动态表单系统
import { ref, onMounted } from 'vue'
import { Document, Collection, Hide } from '@element-plus/icons-vue'
import DynamicForm from './components/DynamicForm.vue'
import FormTemplateManager from './components/FormTemplateManager.vue'
import formConfigData from './config/formConfig.json'

// 响应式数据
const formConfig = ref({}) // 表单配置
const loading = ref(true) // 加载状态
const currentFormData = ref({}) // 当前表单数据
const showTemplateManager = ref(false) // 是否显示模板管理器

// 初始化表单配置
const initFormConfig = () => {
  try {
    formConfig.value = formConfigData
    loading.value = false
    console.log('表单配置加载成功:', formConfig.value)
  } catch (error) {
    console.error('加载表单配置失败:', error)
    loading.value = false
  }
}

// 处理表单提交
const handleFormSubmit = (formData) => {
  console.log('表单提交数据:', formData)
  // 这里可以添加提交到后端的逻辑
}

// 处理表单数据变化
const handleFormChange = (formData) => {
  console.log('表单数据变化:', formData)
  currentFormData.value = formData
  // 这里可以添加实时保存或其他逻辑
}

// 处理模板加载
const handleTemplateLoad = (templateData) => {
  console.log('加载模板数据:', templateData)
  // 这里需要将模板数据传递给DynamicForm组件
  // 可以通过重新初始化表单或者提供一个方法来更新表单数据
  location.reload() // 临时解决方案，实际应该有更优雅的方式
}

// 切换模板管理器显示状态
const toggleTemplateManager = () => {
  showTemplateManager.value = !showTemplateManager.value
}

// 组件挂载时初始化
onMounted(() => {
  initFormConfig()
})
</script>

<template>
  <!-- 主应用模板 -->
  <div id="app">
    <!-- 应用头部 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <el-icon class="title-icon"><Document /></el-icon>
          法律事务所动态表单系统
        </h1>
        <p class="app-subtitle">基于 Vue 3 + Element Plus 的智能表单解决方案</p>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container" v-loading="loading" element-loading-text="正在加载表单配置..." element-loading-background="rgba(0, 0, 0, 0.8)">
        <div style="height: 200px;"></div>
      </div>

      <!-- 动态表单 -->
       <div v-else-if="formConfig.formConfig" class="form-container">
         <!-- 表单操作工具栏 -->
         <div class="form-toolbar">
           <el-button-group>
             <el-button 
               type="info" 
               :icon="showTemplateManager ? Hide : Collection"
               @click="toggleTemplateManager"
             >
               {{ showTemplateManager ? '隐藏' : '显示' }}模板管理
             </el-button>
           </el-button-group>
         </div>

         <!-- 模板管理器 -->
         <div v-if="showTemplateManager" class="template-manager-section">
           <FormTemplateManager
             :form-data="currentFormData"
             :form-config="formConfig.formConfig"
             @load-template="handleTemplateLoad"
           />
         </div>

         <!-- 动态表单 -->
         <DynamicForm
           :config="formConfig.formConfig"
           @submit="handleFormSubmit"
           @change="handleFormChange"
         />
       </div>

       <!-- 错误状态 -->
       <div v-else class="error-container">
         <el-alert
           title="配置加载失败"
           description="无法加载表单配置，请检查配置文件是否正确。"
           type="error"
           show-icon
         />
       </div>
    </main>

    <!-- 应用底部 -->
    <footer class="app-footer">
      <p>&copy; 2024 法律事务所动态表单系统. 基于 Vue 3 + Element Plus 开发</p>
    </footer>
  </div>
</template>

<style scoped>
/* 主应用样式 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 应用头部样式 */
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.title-icon {
  font-size: 2.5rem;
  color: #409eff;
}

.app-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
  font-weight: 400;
}

/* 主要内容区域样式 */
.app-main {
  flex: 1;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.loading-container {
  width: 100%;
  height: 400px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.form-container {
  width: 100%;
  max-width: 900px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

/* 应用底部样式 */
.app-footer {
  background: rgba(44, 62, 80, 0.9);
  color: #ecf0f1;
  text-align: center;
  padding: 20px;
  margin-top: auto;
}

.app-footer p {
  margin: 0;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 10px;
  }
  
  .title-icon {
    font-size: 2rem;
  }
  
  .app-subtitle {
    font-size: 1rem;
  }
  
  .app-main {
    padding: 20px 10px;
  }
  
  .form-container {
    margin: 0 10px;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 1.8rem;
  }
  
  .header-content {
    padding: 0 15px;
  }
  
  .app-main {
    padding: 15px 5px;
  }
}

/* 表单工具栏样式 */
.form-toolbar {
  margin-bottom: 20px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  backdrop-filter: blur(5px);
}

/* 模板管理器区域样式 */
.template-manager-section {
  margin-bottom: 20px;
  padding: 0 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .form-toolbar {
    margin: 0 10px 20px 10px;
    padding: 10px 15px;
  }
  
  .template-manager-section {
     margin: 0 10px 20px 10px;
     padding: 0 10px;
   }
 }

 /* 错误容器样式 */
 .error-container {
   max-width: 600px;
   margin: 50px auto;
   padding: 20px;
 }

 /* 加载容器样式 */
 .loading-container {
   min-height: 300px;
   position: relative;
 }
</style>
