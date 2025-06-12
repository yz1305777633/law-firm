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
/* 全局样式，确保 html 和 body 充满视口并设置背景色 */
:global(html, body) {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f0f2f5; /* 将背景色应用到 body */
}

/* 主应用样式 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* background: #f0f2f5; */ /* 移除这里的背景色，让 body 的背景色显示出来 */
}

/* 应用头部样式 */
.app-header {
  background: #ffffff; /* 纯白背景 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); /* 调整阴影效果 */
  padding: 24px 0; /* 调整内边距 */
  border-bottom: 1px solid #e8e8e8; /* 添加底部边框 */
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 24px; /* 调整内边距 */
}

.app-title {
  font-size: 2.2rem; /* 调整字体大小 */
  font-weight: 600; /* 调整字重 */
  color: #1f2d3d; /* 深色标题 */
  margin: 0 0 8px 0; /* 调整外边距 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px; /* 调整间距 */
}

.title-icon {
  font-size: 2.2rem; /* 调整图标大小 */
  color: #3a8ee6; /* Element Plus 主题蓝 */
}

.app-subtitle {
  font-size: 1rem; /* 调整字体大小 */
  color: #5a5e66; /* 调整字体颜色 */
  margin: 0;
  font-weight: 400;
}

/* 主要内容区域样式 */
.app-main {
  flex: 1;
  padding: 32px 24px; /* 调整内边距 */
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
  background: #ffffff;
  border-radius: 8px; /* 调整圆角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 调整阴影 */
}

.form-container {
  width: 100%;
  max-width: 960px; /* 调整最大宽度 */
  background: #ffffff;
  border-radius: 8px; /* 调整圆角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 调整阴影 */
  overflow: hidden;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 应用底部样式 */
.app-footer {
  background: #304156; /* 深色背景 */
  color: #a7b1c2; /* 调整字体颜色 */
  text-align: center;
  padding: 24px; /* 调整内边距 */
  margin-top: auto;
}

.app-footer p {
  margin: 0;
  font-size: 0.85rem; /* 调整字体大小 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-title {
    font-size: 1.8rem; /* 调整字体大小 */
    flex-direction: column;
    gap: 8px; /* 调整间距 */
  }
  
  .title-icon {
    font-size: 1.8rem; /* 调整图标大小 */
  }
  
  .app-subtitle {
    font-size: 0.9rem; /* 调整字体大小 */
  }
  
  .app-main {
    padding: 24px 16px; /* 调整内边距 */
  }
  
  .form-container {
    margin: 0;
    border-radius: 6px; /* 调整圆角 */
    max-width: 100%;
  }
  
  .app-header {
    padding: 16px 0; /* 调整内边距 */
  }
  
  .header-content {
    padding: 0 16px; /* 调整内边距 */
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 1.6rem; /* 调整字体大小 */
  }
  
  .header-content {
    padding: 0 12px; /* 调整内边距 */
  }
  
  .app-main {
    padding: 16px 8px; /* 调整内边距 */
  }
  
  .form-container {
    border-radius: 4px; /* 调整圆角 */
  }
  
  .app-footer {
    padding: 16px 12px; /* 调整内边距 */
  }
  
  .app-footer p {
    font-size: 0.75rem; /* 调整字体大小 */
  }
}

@media (max-width: 360px) {
  .app-title {
    font-size: 1.4rem; /* 调整字体大小 */
  }
  
  .app-subtitle {
    font-size: 0.8rem; /* 调整字体大小 */
  }
  
  .app-main {
    padding: 12px 4px; /* 调整内边距 */
  }
  
  .header-content {
    padding: 0 8px; /* 调整内边距 */
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
    margin: 0 0 20px 0;
    padding: 10px 15px;
    border-radius: 6px;
  }
  
  .template-manager-section {
     margin: 0 0 20px 0;
     padding: 0 15px;
   }
 }
 
 @media (max-width: 480px) {
   .form-toolbar {
     padding: 8px 12px;
     margin-bottom: 15px;
   }
   
   .template-manager-section {
     padding: 0 12px;
     margin-bottom: 15px;
   }
   
   .form-toolbar .el-button-group .el-button {
     font-size: 13px;
     padding: 6px 12px;
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
