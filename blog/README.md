博客前端页面部分。

## 页面

- 首页

- 文章页
- 分类页
- 标签页
- 关于我页
- 归档页
- 监控页

## 博客组件

- 文章列表

- 文章详情
  - 文章信息
  - 文章内容
  - 视频插入
- 分类
- 评论
- 点赞
- 收藏
- 搜索
- 分类
- 标签
- 归档

## 配置化

- markdown 配置

- 基本信息配置
- 文章配置
- 分类配置
- 标签配置
- 归档配置
- 监控配置

# Vue 文件创建脚本

这个脚本可以快速创建 Vue 组件和页面文件，包含完整的 TypeScript 类型定义和样式模板。

## 使用方法

### 创建组件

```bash
# 创建一个新的 Vue 组件
pnpm run create:component <ComponentName>

# 示例
pnpm run create:component Button
pnpm run create:component UserCard
pnpm run create:component NavigationMenu
```

### 创建页面

```bash
# 创建一个新的 Vue 页面
pnpm run create:page <PageName>

# 示例
pnpm run create:page Home
pnpm run create:page About
pnpm run create:page UserProfile
```

### 通用命令

```bash
# 通用创建命令（需要指定类型）
pnpm run create:vue <type> <name>

# 示例
pnpm run create:vue component Button
pnpm run create:vue page Home
```

## 生成的文件结构

### 组件模板 (components)

生成的组件文件包含：
- TypeScript 类型定义的 props 接口
- 事件定义 (defineEmits)
- 基础的交互状态管理
- 完整的样式模板
- 插槽支持

文件位置：`src/components/<ComponentName>.vue`

### 页面模板 (pages)

生成的页面文件包含：
- 页面级别的状态管理
- 加载状态处理
- 基础的页面结构
- 响应式样式

文件位置：`src/pages/<PageName>.vue`

## 特性

- ✅ 完整的 TypeScript 支持
- ✅ Vue 3 Composition API
- ✅ 自动创建目录
- ✅ 重复文件检查
- ✅ 规范的命名约定
- ✅ 完整的样式模板
- ✅ 组件和页面的不同模板

## 注意事项

1. 文件名会自动添加 `.vue` 扩展名
2. 如果目标文件已存在，脚本会报错并退出
3. 组件名建议使用 PascalCase 命名（如：UserCard、NavigationMenu）
4. 页面名建议使用 PascalCase 命名（如：Home、About、UserProfile）
5. 创建页面后，记得在路由配置中添加对应的路由

## 自定义模板

如需修改模板，请编辑 `scripts/create-vue.ts` 文件中的 `pageTemplate` 和 `componentTemplate` 变量。