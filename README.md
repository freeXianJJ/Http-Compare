# HTTP 接口对比测试工具

## 项目简介

一个用于对比新旧服务接口响应差异的Web应用工具,帮助在重构过程中快速验证接口兼容性。

## 功能特性

- ✅ 支持手动配置接口(URL、Method、参数)
- ✅ 支持多种参数类型(Query、Path、Body、Form、Header)
- ✅ 新旧服务独立配置(Host、Port、Token)
- ✅ 并发发送双端请求
- ✅ 精确差异对比(严格类型对比、数组无序对比)
- ✅ 可视化差异展示(颜色标识)
- ✅ 本地数据持久化

## 技术栈

- React 18 + TypeScript
- Ant Design 5.x
- Zustand (状态管理)
- Axios (HTTP客户端)
- Vite (构建工具)

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

构建产物在 `dist` 目录

## 部署

### 方式一: Nginx部署

1. 构建项目: `npm run build`
2. 将 `dist` 目录内容复制到Nginx的html目录
3. 配置Nginx
4. 重启Nginx

### 方式二: 简易HTTP服务器

```bash
npm install -g serve
serve -s dist -p 8080
```

## 使用说明

1. **配置服务地址**: 设置旧服务和新服务的Host、Port、Token
2. **配置接口**: 输入接口URL、选择HTTP方法、添加参数
3. **发送请求**: 点击"发送请求并对比"按钮
4. **查看结果**: 左右对比视图展示响应差异

## 开发计划

- [x] 第一阶段: 单接口测试功能(当前版本)
- [ ] 第二阶段: Swagger导入、批量测试
- [ ] 第三阶段: 测试历史、环境管理

## 许可证

MIT
