# EdgeForm - 边缘表单构建器

> 基于阿里云 ESA（边缘安全加速）生态的无服务器表单解决方案

## 📋 项目简介

EdgeForm 是一个完全运行在边缘的表单构建和管理系统，充分利用阿里云 ESA 生态的三大核心能力：

- **ESA Pages** - 静态页面托管，全球边缘节点分发
- **ESA Edge Functions** - 边缘函数计算，零冷启动
- **EdgeKV** - 边缘键值存储，毫秒级读写

## ✨ 核心特性

### 1. 可视化表单构建器
- 拖拽式字段管理（文本、邮箱、多行文本、下拉选择）
- 实时表单预览
- 字段必填项配置
- 自定义表单 ID

### 2. 一键生成嵌入代码
- 生成独立的 HTML/JavaScript 代码片段
- 可嵌入任何网站
- 自动处理表单提交和验证
- 无需额外依赖

### 3. 数据管理后台
- 实时查看表单提交数据
- 显示提交时间和 IP 地址
- JSON 格式展示表单内容
- 按表单 ID 筛选数据

### 4. 边缘计算优势
- 全球边缘节点部署，访问速度快
- 零冷启动，响应时间稳定
- 数据存储在边缘，降低延迟
- 自动扩容，无需运维

## 🏗️ 项目结构

```
edge-form/
├── src/                          # 前端源码
│   ├── App.tsx                   # 主应用组件
│   ├── App.css                   # 样式文件
│   └── main.tsx                  # 入口文件
├── functions/                    # 边缘函数
│   ├── submit/                   # 表单提交函数
│   │   ├── src/index.js         # 处理表单提交
│   │   └── esa.jsonc            # 函数配置
│   └── get-submissions/          # 获取提交数据函数
│       ├── src/index.js         # 查询提交记录
│       └── esa.jsonc            # 函数配置
├── esa.jsonc                     # ESA Pages 配置
├── package.json                  # 项目依赖
└── README.md                     # 项目文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 4. 部署到 ESA Pages

1. 登录阿里云 ESA 控制台
2. 创建新的 Pages 应用
3. 上传项目代码或连接 Git 仓库
4. ESA 会自动执行 `npm install` 和 `npm run build`
5. 部署完成后，配置边缘函数路由

### 5. 配置边缘函数

在 ESA 控制台配置以下路由：

- `/api/submit` → `functions/submit`
- `/api/get-submissions` → `functions/get-submissions`

### 6. 配置 EdgeKV

1. 在 ESA 控制台创建 EdgeKV 命名空间：`edge-form`
2. 边缘函数会自动使用该命名空间存储数据

## 💡 使用方法

### 创建表单

1. 在"表单构建器"页面设置表单 ID
2. 添加所需字段（文本、邮箱、多行文本等）
3. 配置字段标签和必填属性
4. 点击"生成嵌入代码"

### 嵌入表单到网站

1. 复制生成的嵌入代码
2. 粘贴到目标网页的 HTML 中
3. 表单会自动渲染并处理提交

### 查看提交数据

1. 切换到"数据管理"页面
2. 系统会自动加载当前表单的所有提交记录
3. 查看提交时间、IP 地址和表单内容

## 🔧 技术栈

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **ESLint** - 代码规范

### 后端
- **ESA Edge Functions** - 边缘函数计算
- **EdgeKV** - 边缘键值存储
- **JavaScript** - 函数运行时

## 🌟 ESA 生态集成

本项目完整展示了 ESA 生态的三大核心能力：

### 1. ESA Pages
- 静态资源托管在全球边缘节点
- 自动 HTTPS 和 CDN 加速
- 单页应用路由支持

### 2. ESA Edge Functions
- 表单提交处理（`/api/submit`）
- 数据查询接口（`/api/get-submissions`）
- 零冷启动，毫秒级响应

### 3. EdgeKV
- 表单提交数据存储
- 提交记录索引管理
- 全球边缘节点同步

## 📝 API 说明

### POST /api/submit

提交表单数据

**请求体：**
```json
{
  "formId": "contact-form",
  "submission": {
    "name": "张三",
    "email": "zhangsan@example.com",
    "message": "这是一条留言"
  }
}
```

**响应：**
```json
{
  "success": true,
  "submissionId": "contact-form_1234567890_abc123"
}
```

### GET /api/get-submissions?formId=contact-form

获取表单提交记录

**响应：**
```json
{
  "success": true,
  "submissions": [
    {
      "id": "contact-form_1234567890_abc123",
      "formId": "contact-form",
      "data": {
        "name": "张三",
        "email": "zhangsan@example.com"
      },
      "timestamp": "2026-01-19T10:30:00.000Z",
      "ip": "1.2.3.4"
    }
  ]
}
```

## 🎯 竞赛亮点

### 创意性
- 完全无服务器架构，无需后端服务器
- 可视化表单构建，降低使用门槛
- 一键生成嵌入代码，即插即用

### 实用价值
- 适用于企业官网、活动页面、问卷调查等场景
- 全球边缘部署，访问速度快
- 数据实时存储，管理便捷

### 技术探索
- 深度集成 ESA 三大核心能力
- 边缘计算 + 边缘存储的完整方案
- 展示 ESA 生态的技术优势

## 📄 开源协议

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 Issue 联系我们。
