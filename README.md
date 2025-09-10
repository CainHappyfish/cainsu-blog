# cainsu-blog

闲着没事干写的博客

# 工程化

本项目已配置完整的前端工程化环境，包括代码规范、格式化、Git提交规范等。

## 代码质量

- **ESLint**: 代码检查工具，支持Vue 3 + TypeScript
- **Prettier**: 代码格式化工具，统一代码风格
- **VSCode集成**: 保存时自动格式化和错误修复

## Git工作流

- **Husky**: Git钩子管理工具
- **Commitlint**: 提交信息规范检查
- **Pre-commit**: 提交前自动运行代码检查
- **Commit-msg**: 验证提交信息格式

## 使用方法

### 开发环境设置

1. 安装依赖：
```bash
pnpm install
```

2. 启动开发服务器：
```bash
pnpm run dev
```

### 代码检查和格式化

```bash
# 运行ESLint检查
pnpm run lint

# 格式化代码
pnpm run format

# 构建项目
pnpm run build
```

### Git提交规范 

提交信息必须遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
type(scope): subject

body

footer
```

**支持的提交类型：**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建过程或辅助工具的变动
- `revert`: 回滚
- `build`: 构建系统或外部依赖项的更改

**示例：**
```bash
git commit -m "feat: 添加文章列表组件"
git commit -m "fix: 修复分页组件显示问题"
git commit -m "docs: 更新README文档"
```

# 目前存在的问题

- 无法直接通过 https://blog.cainsu.site/about 类似的 url 访问
    - Github Pages无法处理history模式的前端路由。