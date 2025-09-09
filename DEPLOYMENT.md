# 部署说明

本项目使用 GitHub Actions 自动部署到 `blog.cainsu.site`。

## 部署配置

### 1. GitHub Pages 设置

1. 进入 GitHub 仓库的 Settings 页面
2. 找到 "Pages" 选项
3. 在 "Source" 中选择 "Deploy from a branch"
4. 选择 "gh-pages" 分支和 "/ (root)" 目录
5. 点击 "Save"

### 2. 自定义域名设置

1. 在域名提供商处添加 CNAME 记录：
   ```
   blog.cainsu.site -> your-username.github.io
   ```

2. 或者添加 A 记录指向 GitHub Pages IP：
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

### 3. 工作流程说明

当代码推送到 `main` 或 `master` 分支时，GitHub Actions 会自动：

1. 检出代码
2. 设置 Node.js 18 环境
3. 安装 pnpm
4. 缓存依赖
5. 安装项目依赖
6. 构建项目
7. 部署到 GitHub Pages
8. 上传构建产物作为 artifacts

### 4. 本地测试

在推送代码前，建议先在本地测试构建：

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 预览构建结果
cd blog && pnpm run preview
```

### 5. 故障排除

- 如果部署失败，检查 GitHub Actions 的日志
- 确保 `GITHUB_TOKEN` 有足够的权限
- 检查域名 DNS 配置是否正确
- 确保 `blog/dist` 目录包含正确的构建文件

### 6. 环境要求

- Node.js >= 16.0.0
- pnpm (最新版本)
- GitHub Pages 已启用

## 文件结构

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 工作流
├── blog/                       # Vue.js 项目目录
│   ├── src/
│   ├── dist/                   # 构建输出目录
│   └── package.json
├── package.json                # Workspace 配置
└── DEPLOYMENT.md              # 本文件
```