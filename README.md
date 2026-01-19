# EdgeForm - 边缘表单构建器

<div align="center">

![ESA Declaration](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)

**本项目由阿里云ESA提供加速、计算和保护**

一个基于阿里云ESA边缘计算平台构建的无服务器表单系统，让表单创建和数据管理变得简单高效。

[在线演示](https://form.178000.cn) | [GitHub仓库](https://github.com/nike022/edge-form)

</div>

---

## 📋 项目介绍

EdgeForm是一个完全运行在边缘的表单构建和管理系统,充分利用阿里云ESA的边缘计算能力,实现了:

- **零后端部署** - 无需传统服务器,完全基于ESA边缘函数和EdgeKV
- **全球加速** - 依托ESA全球节点,表单提交和数据访问毫秒级响应
- **安全可靠** - JWT认证保护管理后台,SHA-256密码加密,数据安全存储在EdgeKV


- **可视化表单构建器** - 点击添加字段,实时预览,所见即所得
- **一键生成嵌入代码** - 自动生成完整的HTML/JS代码,可直接嵌入任何网站
- **现代化UI设计** - 深色主题,渐变色彩,流畅动画,提供优秀的用户体验
- **智能字段管理** - 支持文本、邮箱、电话、日期、下拉选择、文本域等多种字段类型

#### 💼 应用价值
- **开箱即用** - 部署后即可使用,无需复杂配置
- **真实场景应用** - 适用于问卷调查、用户反馈、活动报名、联系表单等多种场景
- **数据管理完善** - 支持数据查看、导出CSV、删除等完整的CRUD操作
- **零成本运营** - 基于ESA边缘计算,无需维护服务器,成本极低
- **全球可用** - 依托ESA全球节点,任何地区都能快速访问
- **开放集成** - 支持嵌入任何网站,提供公开API,支持跨域调用

#### 🔬 技术探索
- **完整的ESA生态应用** - 深度整合ESA Pages + 边缘函数 + EdgeKV
- **边缘计算最佳实践** - 展示了如何在边缘构建完整的全栈应用
- **无服务器架构** - 真正的Serverless,自动扩展,按需付费
- **现代前端技术栈** - React 18 + TypeScript + Vite,类型安全,开发体验优秀
- **安全认证机制** - JWT + SHA-256,企业级安全标准

---

## ✨ 功能特性

### 表单构建
- 📝 支持多种字段类型:文本、邮箱、电话、网址、数字、日期、下拉选择、文本域
- ⚙️ 字段验证配置:必填、长度限制、数值范围、正则表达式、自定义错误提示
- 👁️ 实时预览:边编辑边预览表单效果
- 📋 一键生成嵌入代码:复制即用,无需额外开发

### 数据管理
- 🔐 JWT认证保护:只有管理员可以查看提交数据
- 📊 数据列表展示:时间、IP、表单内容一目了然
- 📥 CSV导出:支持导出所有数据为CSV格式
- 🗑️ 数据删除:支持单条删除,带二次确认防止误删
- 🔄 切换视图自动加载:切换到数据管理页面时自动获取最新数据

### 安全特性
- 🔒 密码哈希存储:SHA-256加密,安全可靠
- 🎫 JWT Token认证:7天有效期,自动过期保护
- 🚫 权限控制:表单提交公开,数据查看需认证
- 🛡️ CORS配置:支持跨域请求,安全可控

---

## 🛠️ 技术栈

### 前端
- **React 18** - 现代化UI框架
- **TypeScript** - 类型安全
- **Vite** - 极速构建工具
- **CSS3** - 现代化样式,支持渐变、动画

### 边缘计算
- **ESA Pages** - 静态资源托管和全球加速
- **ESA Edge Functions** - 边缘函数处理业务逻辑
  - `submit` - 处理表单提交
  - `auth` - 用户认证和JWT生成
  - `get-submissions` - 获取提交数据(需认证)
  - `delete-submission` - 删除数据(需认证)
- **EdgeKV** - 边缘键值存储
  - 存储表单提交数据
  - 存储管理员密码哈希
  - 存储JWT密钥

### 安全
- **Web Crypto API** - 密码哈希和JWT签名
- **JWT** - 无状态认证
- **HMAC-SHA256** - JWT签名算法

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/nike022/edge-form.git
cd edge-form
```

### 2. 安装依赖

```bash
npm install
```

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 构建项目

```bash
npm run build
```

### 5. 部署到ESA Pages

1. 将项目推送到GitHub
2. 登录[阿里云ESA控制台](https://esa.console.aliyun.com/)
3. 创建Pages项目,连接GitHub仓库
4. 配置构建命令:`npm run build`
5. 配置输出目录:`dist`
6. 部署完成

### 6. 配置Edge Functions

在ESA控制台创建以下Edge Functions:

#### submit函数
- 代码:`functions/submit/src/index.js`
- 路由:`/api/submit`

#### auth函数
- 代码:`functions/auth/src/index.js`
- 路由:`/api/auth`

#### get-submissions函数
- 代码:`functions/get-submissions/src/index.js`
- 路由:`/api/get-submissions`

#### delete-submission函数
- 代码:`functions/delete-submission/src/index.js`
- 路由:`/api/delete-submission`

### 7. 配置EdgeKV

1. 在ESA控制台创建EdgeKV命名空间:`edge-form`
2. 打开 `setup-password.html` 生成密码哈希和JWT密钥
3. 在EdgeKV中添加以下键值对:
   - `admin_password_hash`: 你的密码哈希
   - `jwt_secret`: 生成的JWT密钥

---

## 📖 使用说明

### 创建表单

1. 访问网站,进入"表单构建"页面
2. 点击"添加字段"按钮,选择字段类型
3. 配置字段属性:标签、是否必填、验证规则等
4. 点击"生成嵌入代码"
5. 复制代码,粘贴到你的网站中

### 管理数据

1. 点击"数据管理"标签
2. 输入管理员密码登录
3. 查看所有提交数据
4. 可以导出CSV或删除单条数据

### 嵌入表单

将生成的代码粘贴到你的HTML页面中:

```html
<!-- EdgeForm 嵌入代码 -->
<div id="edge-form-my-form"></div>
<script>
  // 自动生成的表单代码
</script>
```

---

## 🏗️ 项目架构

```
edge-form/
├── src/                      # 前端源码
│   ├── App.tsx              # 主应用组件
│   ├── App.css              # 样式文件
│   └── main.tsx             # 入口文件
├── functions/               # Edge Functions
│   ├── submit/              # 表单提交函数
│   ├── auth/                # 认证函数
│   ├── get-submissions/     # 获取数据函数
│   └── delete-submission/   # 删除数据函数
├── setup-password.html      # 密码配置工具
└── README.md               # 项目文档
```

---

## 🔒 安全说明

- 管理员密码使用SHA-256哈希存储,不存储明文
- JWT Token有效期7天,过期自动失效
- 所有管理接口都需要JWT认证
- 表单提交接口公开,但记录IP地址
- 支持CORS,可配置允许的域名

---

## 📊 性能优势

- **边缘计算** - 全球节点就近响应,延迟低至毫秒级
- **无服务器** - 自动扩展,无需担心并发压力
- **CDN加速** - 静态资源全球分发,加载速度极快
- **按需付费** - 只为实际使用付费,成本极低

---

## 🏆 参赛信息

本项目参加**阿里云ESA Pages 边缘开发大赛**

### 赛事介绍
"阿里云ESA Pages 边缘开发大赛"是阿里云边缘安全加速ESA依托阿里云天池举办的前沿技术赛事。聚焦边缘计算、AI与前端工程的深度融合,让代码和AI在边缘绽放。

### 项目亮点
- **创意卓越**: 可视化表单构建器,一键生成嵌入代码,现代化UI设计
- **应用价值**: 开箱即用,真实场景应用,数据管理完善,零成本运营
- **技术探索**: 完整的ESA生态应用,边缘计算最佳实践,无服务器架构

---

## 🤝 贡献

欢迎提交Issue和Pull Request!

---

## 📄 开源协议

MIT License

---

## 👨‍💻 作者

- GitHub: [@nike022](https://github.com/nike022)
- 项目地址: [https://github.com/nike022/edge-form](https://github.com/nike022/edge-form)
- 在线演示: [https://form.178000.cn](https://form.178000.cn)

---

## 🙏 致谢

感谢阿里云ESA团队提供的强大边缘计算平台,让这个项目得以实现。

**本项目由阿里云ESA提供加速、计算和保护**
