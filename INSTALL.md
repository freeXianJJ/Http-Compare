# 安装指南

## 第一步：创建目录结构

由于PowerShell工具限制，请按以下方式创建项目目录：

### 方法一：运行批处理文件（推荐）

双击运行 `create-dirs.bat` 文件，它会自动创建所有必需的目录。

### 方法二：手动创建

在 `d:\Project\http` 目录下手动创建以下目录结构：

```
d:\Project\http\
├── src\
│   ├── components\
│   │   ├── ApiConfig\
│   │   ├── ServiceConfig\
│   │   ├── ResponseDiff\
│   │   └── common\
│   ├── services\
│   ├── stores\
│   ├── types\
│   ├── utils\
│   └── styles\
└── public\
```

### 方法三：使用命令行

打开CMD命令行，执行以下命令：

```cmd
cd /d d:\Project\http
md src\components\ApiConfig
md src\components\ServiceConfig
md src\components\ResponseDiff
md src\components\common
md src\services
md src\stores
md src\types
md src\utils
md src\styles
md public
```

## 第二步：复制源代码文件

目录创建完成后，需要将所有源代码文件复制到对应目录。

源代码文件列表将在下一步提供。

## 第三步：安装依赖

```bash
npm install
```

## 第四步：运行项目

开发模式：
```bash
npm run dev
```

生产构建：
```bash
npm run build
```

## 遇到问题？

1. **目录创建失败**：请确保有写入权限
2. **npm install 失败**：检查网络连接，或使用国内镜像
3. **端口被占用**：修改 vite.config.ts 中的端口号

## 下一步

目录创建完成后，我将为您生成所有源代码文件。
