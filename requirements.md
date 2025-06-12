# 法律事务所动态表单系统需求文档

## 技术要求

### 前端框架
- 使用 **Element Plus** 作为UI组件库
- 基于 Vue.js 开发
- 支持动态表单生成

### 核心功能
- 根据JSON配置动态加载对应的表单组件
- 支持多种表单控件类型（文本、日期、数字、选择器等）
- 支持表单验证和数据绑定
- 支持动态计算和自动填充

## 表单字段配置

### Complaint 表单字段详细规格

| 序号 | 分类 | 字段名称 | 变量名 | 控件类型 | 特殊要求 |
|------|------|----------|--------|----------|----------|
| 1 | Complaint | Plaintiff Name | `{d.PlaintiffName}` | Text | 可添加多个 |
| 2 | Complaint | Defendant Name | `{d.DefendantName}` | Text | 可添加多个。如果是公司，需要选择州。例如："a California corporation." |
| 3 | Complaint | Case Number | `{d.CaseNumber}` | Text | 默认值设置为空格 |
| 4 | Complaint | Judge Name | `{d.JudgeName}` | Text | - |
| 5 | Complaint | Complaint Filing Date | `{d.ComplaintFilingDate}` | Date | 格式需要为 "June 10, 2025" |
| 6 | Complaint | Choose Causes of Action | `{d.SelectedCauses}` | Selection | - |
| 7 | Complaint | / | `{d.PlaintiffPlurality1}` | Text | "Plaintiff" 或 "Plaintiffs"。需要根据单个或多个原告自动应用 |
| 8 | Complaint | / | `{d.PlaintiffPlurality2}` | Text | "Plaintiff is" 或 "Plaintiffs are"。需要根据单个或多个原告自动应用 |
| 9 | Complaint | / | `{d.DefendantPlurality1}` | Text | "Defendant" 或 "Defendants"。需要根据单个或多个被告自动应用 |
| 10 | Complaint | / | `{d.DefendantPlurality2}` | Text | "Defendant is" 或 "Defendants are"。需要根据单个或多个被告自动应用 |
| 11 | Complaint | Plaintiff Residence (County, State) | `{d.PlaintiffResidence}` | Text | - |
| 12 | Complaint | Defendant Business Type (e.g. restaurant) | `{d.DefendantBusinessType}` | Text | - |
| 13 | Complaint | Defendant's Detailed Business Address (Where the plaintiff worked) | `{d.DefendantBusinessAddress}` | Text | - |
| 14 | Complaint | Start Date of the Employment | `{d.EmploymentStartDate}` | Date | 用于计算雇佣周数 |
| 15 | Complaint | End date of the employment | `{d.EmploymentEndDate}` | Date | 用于计算雇佣周数 |
| 16 | Complaint | Plaintiff's hourly rate | `{d.HourlyRate}` | Number | 用于计算未付工资、加班费等 |
| 17 | Complaint | / | `{d.OvertimeHoursTotal}` | Number | 1.5倍加班时间 + 2倍加班时间 |
| 18 | Complaint | What is the applicable IWC Order(number) | `{d.iwcOrder}` | Number | - |
| 19 | Complaint | / | `{d.WageStatementPenalty}` | Number | 如果 < 4000，则为 50+(PayPeriods-1)*100，否则为 4000 |

## 业务逻辑要求

### 自动计算功能
1. **雇佣周数计算**：根据雇佣开始日期和结束日期自动计算
2. **加班费计算**：基于小时工资率和加班时间
3. **工资单罚金计算**：根据特定公式自动计算

### 动态显示逻辑
1. **单复数自动切换**：根据原告/被告数量自动调整用词
2. **条件显示**：某些字段可能需要根据其他字段的值来显示或隐藏

### 数据验证
1. **必填字段验证**
2. **数据格式验证**（日期、数字等）
3. **业务规则验证**

## 技术实现要点

### JSON配置结构
```json
{
  "formConfig": {
    "fields": [
      {
        "id": "plaintiffName",
        "label": "Plaintiff Name",
        "type": "text",
        "variable": "d.PlaintiffName",
        "multiple": true,
        "required": true
      }
      // ... 其他字段配置
    ]
  }
}
```

### 组件映射
- Text → el-input
- Date → el-date-picker
- Number → el-input-number
- Selection → el-select

### 状态管理
- 使用 Vue 3 Composition API
- 响应式数据绑定
- 计算属性用于自动计算字段

## 开发优先级

1. **阶段一**：基础动态表单框架
2. **阶段二**：实现所有字段类型和验证
3. **阶段三**：添加自动计算和业务逻辑
4. **阶段四**：优化用户体验和性能

## 扩展性考虑

- 支持添加新的字段类型
- 支持自定义验证规则
- 支持表单模板保存和加载
- 支持多语言国际化