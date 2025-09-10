---
title: "Vitepress主题制作学习笔记-2"
date: "2024-07-18"
cover: "https://vitepress.dev/vitepress-logo-large.svg"
category: "Vitepress"
tags: ["Vitepress", "前端", "TypeScript", "Vue3", "主题开发"]
summary: "这里写制作主题中用到的Typescript。"
author: "破酥"
readTime: "25分钟"
---



这里写制作主题中用到的Typescript。

<!--more-->

# post文件处理

我们先来看`vitepress-theme-censored/composables`的ts使用：

- `index.ts`：用于数据输出以及处理
- `post.data.ts`：用于获取博客文章的内容与数据

## `post.data.ts`

这里涉及nodeJS的文件读取操作。

```typescript
const config: SiteConfig<CensoredThemeConfig> = (globalThis as any).VITEPRESS_CONFIG;
const theme = config.site.themeConfig;

declare const data: CensoredTheme.PostData[];

let md: MarkdownRenderer;
const cache = /* @__PURE__ */ new Map();

export { data };
```

全局属性 `globalThis` 包含全局的 `this` 值。在 Web 中，可以通过 `window`、`self` 或者 `frames` 取到全局对象，但是在 [Web Workers](https://developer.mozilla.org/zh-CN/docs/Web/API/Worker) 中，只有 `self` 可以。在 Node.js 中，它们都无法获取，必须使用 `global`。

对于`/* @__PURE__ */`，暗示创建 `Map` 实例的代码可以被认为是没有副作用的，因此在优化时可以进行一些特殊处理。是一种特殊的注释，通常用于工具链中的某些优化器（如 UglifyJS、Terser 或其他 JavaScript 压缩工具）。一般有3种：

```
/*@__INLINE__*/ - forces a function to be inlined somewhere.
/*@__NOINLINE__*/ - Makes sure the called function is not inlined into the call site.
/*@__PURE__*/ - Marks a function call as pure. That means, it can safely be dropped.
```

- 可以把@换成#。
- inline表示内联，会强制把标记的函数里依赖的函数内敛在里面。
- 而noinline则相反，不会把函数拆成内容内联进函数体内。
- 最后的pure则是用的最多的。会告诉编辑器，如果没用到这玩意，可以放心删了。

Vitepress中`LoaderModule`的定义为：

```typescript
interface LoaderModule {
    watch?: string[] | string;
    load: (watchedFiles: string[]) => any;
}
/**
 * Helper for defining loaders with type inference
 */
declare function defineLoader(loader: LoaderModule): LoaderModule;
```

vitepress在构建博客时，会根据定义的`LoaderModule`来获取md文件信息（例如存放在frontmatter, theme等信息），我们可以根据我们的需要来扩展该模块，最后根据load函数将处理后的数据存入我们事先定义的数组data中，并导出作为其他组件的输入数据。

我们设置一个缓存来存储读取内容，提高运行效率：

```
const cache = /* @__PURE__ */ new Map();
```

然后进入具体的load实现：

```
watch: [`${theme.postDir ?? 'posts'}/**/*.md`].map(p => normalizePath(path.join(config.root, p))),
async load(files) { }
```

> 在 JavaScript 和 TypeScript 中，对象属性列表的最后一个属性后面可以有一个逗号，但并不是必须的。这被称为“尾随逗号”或“拖尾逗号”（Trailing Comma）。使用尾随逗号的一个好处是，当你添加新的属性或方法时，版本控制系统的diff会更加清晰，因为每次添加属性时不需要修改前一个属性行的逗号。

`watch` 是一个数组，用于指定要监视的文件路径模式。`${theme.postDir ?? 'posts'}`是一个模板字符串，用于读取我们在`config.mts`内定义的post文章路径，如果该路径不存在，则默认使用posts为文章路径。`/**/*.md`是一个通配符模式，表示该目录及其子目录中的所有 Markdown 文件 (`.md` 文件)。

`map` 是 JavaScript 数组上的一个方法，用于创建一个新数组，其中每个元素都是通过调用提供的函数并使用原数组中的相应元素计算出来的。它是一个非常常用的方法，用于数组的转换操作。在`.map(p => normalizePath(path.join(config.root, p)))`中，`path.join(config.root, p)`将 `config.root`（表示项目的根目录）和前面生成的路径（`theme.postDir` 或 `'posts'`）连接起来，形成绝对路径；`normalizePath`将路径标准化（处理不同操作系统的路径分隔符差异）；`map` 方法将标准化后的路径放入 `watch` 数组中。

`load` 是一个异步方法，输入为获取的文件列表，用于处理文件列表并加载这些文件的内容。接下来我们具体看看load函数的实现。

### `async load`

```typescript
md = md || (await createMarkdownRenderer(config.srcDir, config.markdown, config.site.base, config.logger));
const raw = [];
```

首先我们初始化`md`变量，如果`md`已经存在，直接使用`md`的值；如果不存在，则异步创建一个`MarkdownRenderer`并初始化。创建一个`raw`数组用于存储未处理的数据。

接下来遍历每个文件，如果不是md文件，则跳过。

```typescript
for (const file of files) {
    if (!file.endsWith('.md')) {
        continue;
    }

    const { mtimeMs: timestamp, birthtimeMs } = fs.statSync(file);
    const cached = cache.get(file);

    if (cached && timestamp === cached.timestamp) {
        raw.push(cached.data);
        continue;
    }
}
```

`fs.statSync(file)`使用Node.js的`fs`模块中的同步方法`statSync`，用于获取文件的状态信息。`{ mtimeMs: timestamp, birthtimeMs }`从`fs.statSync(file)`返回的对象中解构出`mtimeMs`和`birthtimeMs`属性。`mtimeMs`表示文件的最后修改时间，以毫秒为单位；`birthtimeMs`表示文件的创建时间，以毫秒为单位。将`mtimeMs`重命名为`timestamp`以方便后续使用。

然后我们从缓存中获取与文件路径`file`对应的缓存记录，如果缓存存在且最后修改时间相同，则向raw添加该数据，然后继续下一个文件的读取。其他情况则进入下一步的处理。

vitepress使用`gray-matter`获取md文章中的`yml`参数信息。

```
const fileContent = fs.readFileSync(file, 'utf-8');
const { data: meta, content} = matter(fileContent);
```

我们用fs读取file对应的文件内容后，调用`gray-matter`的`matter`获取`yml`参数信息和文件内容，`{ data: meta, content}`：从`matter(fileContent)`返回的对象中解构出`data`和`content`属性。`data`包含前置物的元数据，重命名为`meta`；`content`包含文件的主要内容。

```
const reg = /<!--\s*more\s*-->/gs;
const rpt = reg.exec(content);
const excerpt = rpt ? content.substring(0, rpt.index) : '';
```

根据正则获取摘要，rpt.index为匹配的行数，从`0-rpt.index`行的内容即为摘要。如果正则匹配，则用`substring`获取content对应的摘要内容，否则返回空值。

> 这里theme-async的代码用回调函数实现的，但我自己写代码的时候死活匹配不了
>
> ```
> const fileContent = fs.readFileSync(file, 'utf-8');
> const { data: meta, excerpt } = matter(fileContent, {
>     excerpt: text => {
>         const reg = /<!--\s*more\s*-->/gs;
>         const rpt = reg.exec(text);
>         return rpt ? text.substring(0, rpt.index) : '';
>     },
> });
> ```
>
> 其实`gray-matter`自己就带有相应的截取参数，感兴趣可以去了解一下

处理完所有需要的数据后，我们将其存入`data`中，加入缓存和`raw`：

```
const renderedExcerpt = excerpt ? excerpt : md.render(excerpt);
const data = {
    excerpt: renderedExcerpt,
    ...meta,
    url: withBase(config.site.base, url),
    filePath: slash(path.relative(config.srcDir, file)),
};
cache.set(file, { data, timestamp });
raw.push(data);
```

最后load返回`raw`经过排序后的数据。

## `index.ts`

```typescript
// 获取所有文章
export const useAllPosts = (sort?: CensoredTheme.OrderByArg, filter?: (v: CensoredTheme.PostData, i: number, l: CensoredTheme.PostData[]) => boolean) => {
	let list = allPosts;
	if (filter) {
		list = list.filter(filter);
	}
	return sort ? sortBy([...list], sort) : [...list];
};
```

该函数接受两个可选参数：

- `sort`：用于指定排序规则的参数，其类型为 `CensoredTheme.OrderByArg`。
- `filter`：用于过滤文章的回调函数，其类型为 `(v: CensoredTheme.PostData, i: number, l: CensoredTheme.PostData[]) => boolean`，即接收三个参数并返回一个布尔值的函数。

如果提供了 `filter` 函数，则使用 `filter` 函数对 `list` 进行过滤，保留满足条件的文章；如果提供了 `sort` 参数，则使用 `sortBy` 函数对 `list` 进行排序，并返回排序后的新数组。`sortBy` 函数接受一个数组和排序规则作为参数。如果没有提供 `sort` 参数，则返回 `list` 的浅拷贝。

# 工具函数

这部分我们来看`vitepress-theme-censored/utils`内的ts使用。

## `client/index.ts`

```
export const formatDate = (d: Date | number | string | undefined, fmt: string = 'yyyy-MM-dd HH:mm:ss'): string => {
	if (!(d instanceof Date)) {
		if (isString(d)) {
			d = d.replace(/-/gs, '/');
		}
		d = d ? new Date(d) : new Date();
	}

	const o = {
		'M+': d.getMonth() + 1,
		'(d|D)+': d.getDate(),
		'(h|H)+': d.getHours(),
		'm+': d.getMinutes(),
		's+': d.getSeconds(),
		'q+': Math.floor((d.getMonth() + 3) / 3),
		S: d.getMilliseconds(),
	};

	if (/(([Yy])+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (d.getFullYear() + '').substring(4 - RegExp.$1.length));
	}

	for (const k in o) {
		if (new RegExp('(' + k + ')').test(fmt)) {
			const val = o[k as keyof typeof o].toString();
			fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? val : ('00' + val).substring(val.length));
		}
	}

	return fmt;
};
```

该函数接受两个参数：

- `d`：可以是 `Date` 对象、数字、字符串或 `undefined`，表示需要格式化的日期。
- `fmt`：一个可选的字符串，表示日期的格式，默认值为 `'yyyy-MM-dd HH:mm:ss'`。

如果 `d` 不是 `Date` 对象，且 `d` 如果是字符串，用 `/` 替换所有的 `-`，若 `d` 不为 `null` 或 `undefined`，将 `d` 转换为 `Date` 对象；否则，使用当前日期。

然后我们定义一个对象 `o`，其中包含日期各部分的正则表达式和相应的值：

- `'M+'`：月份，从0开始，因此需要加1。
- `'(d|D)+'`：日期。
- `'(h|H)+'`：小时。
- `'m+'`：分钟。
- `'s+'`：秒数。
- `'q+'`：季度。
- `'S'`：毫秒。

对于`if (/(([Yy])+)/.test(fmt)) { ... }`，如果格式字符串中包含年（`Y`或`y`），将其替换为年份`fmt.replace(RegExp.$1, (d.getFullYear() + '').substring(4 - RegExp.$1.length))`，将年份替换为 `d.getFullYear()` 的字符串表示，根据 `Y`或`y`的长度决定截取的位数。

遍历对象 `o` 的键，将格式字符串中的对应部分替换为相应的值：，`if (new RegExp('(' + k + ')').test(fmt)) { ... }`如果格式字符串中包含当前键 `k`，执行以下操作：

- `const val = o[k as keyof typeof o].toString();`：将键 `k` 对应的值转换为字符串。
- `fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? val : ('00' + val).substring(val.length));`：替换格式字符串中的匹配部分。如果匹配长度为1，直接替换为值；否则，补齐前导零。

最后返回格式化后的日期字符串。

> 由于新标准下正则表达式得`$`运算符（静态属性）已经被废弃，建议使用`replace`来代替
>
> from GPT
>
> ```
> export const formatDate = (d: Date | number | string | undefined, fmt: string = 'yyyy-MM-dd HH:mm:ss'): string => {
> 	if (!(d instanceof Date)) {
> 		if (typeof d === 'string') {
> 			d = d.replace(/-/gs, '/');
> 		}
> 		d = d ? new Date(d) : new Date();
> 	}
> 
> 	const o = {
> 		'M+': d.getMonth() + 1,
> 		'(d|D)+': d.getDate(),
> 		'(h|H)+': d.getHours(),
> 		'm+': d.getMinutes(),
> 		's+': d.getSeconds(),
> 		'q+': Math.floor((d.getMonth() + 3) / 3),
> 		'S': d.getMilliseconds(),
> 	};
> 
> 	if (/(([Yy])+)/.test(fmt)) {
> 		fmt = fmt.replace(/(([Yy])+)/, (match) => {
> 			return (d.getFullYear() + '').substring(4 - match.length);
> 		});
> 	}
> 
> 	for (const k in o) {
> 		if (new RegExp('(' + k + ')').test(fmt)) {
> 			const val = o[k as keyof typeof o].toString();
> 			fmt = fmt.replace(new RegExp('(' + k + ')'), (match) => {
> 				return match.length === 1 ? val : ('00' + val).substring(val.length);
> 			});
> 		}
> 	}
> 
> 	return fmt;
> };
> ```
>
> 当你使用一个替换函数作为 `replace` 方法的第二个参数时，匹配的部分会作为该函数的参数传递。这是 `String.prototype.replace` 的一个特性。

## `shared.ts`

这部分主要负责文章发布相关信息的具体处理。

### `dataPath`

`dataPath` 函数通过遍历 `paths` 中的键名，从嵌套对象 `data` 中提取指定路径上的值。如果路径中任意一级不是对象且未到达终点，函数返回 `undefined`。遍历完成后，返回最终路径部分对应的值。

```typescript
export const dataPath = <T>(data: any, paths: string): T | undefined => {
	const keys = paths.split('.');
	if (!isObject(data)) return;
	const len = keys.length;
	for (let index = 0; index < len; index++) {
		const key = keys[index];
		if (!isObject(data[key]) && index < len - 1) {
			return;
		} else {
			data = data[key];
		}
	}
	return data;
};
```

`<T>`：泛型参数 `T`，表示返回值的类型。

`(data: any, paths: string): T | undefined`：函数接受两个参数：

- `data: any`：表示输入对象。
- `paths: string`：表示对象中要提取的路径，路径部分用点 `.` 分隔。
- 返回值类型为 `T` 或 `undefined`，表示路径上找到的值或 `undefined`。

`const keys = paths.split('.');`将路径字符串 `paths` 按点 `.` 分割成数组 `keys`。检查 `data` 是否为对象（ `isObject` 是`@vueuse/core`中一个判断输入值是否为对象的辅助函数）。如果 `data` 不是对象，返回 `undefined`。遍历路径部分：

- `const key = keys[index];`：获取当前路径部分 `key`。
- `if (!isObject(data[key]) && index < len - 1) { return; }`：检查 `data[key]` 是否为对象，且当前路径部分不是最后一个路径部分。如果 `data[key]` 不是对象且不是最后一个路径部分，返回 `undefined`。
- `else { data = data[key]; }`：否则，将 `data` 更新为 `data[key]`，继续遍历下一路径部分。

### `groupBy`

 `groupBy` 泛型函数用于将一个对象数组按照指定路径上的值进行分组，并计算每个组的出现次数。该函数将 `Map` 对象转换为数组并返回，数组中的每个元素都是一个 `[key, value]` 数组，表示键值和对应的计数。

```typescript
export const groupBy = <T extends AnyObject>(data: T[], path: string, convert?: (key: string) => string) => {
	const map = new Map<string, number>();
	convert = convert ?? ((key: string) => key);

	const setMap = (key: string) => {
		const id = convert!(key);
		if (map.has(id)) {
			map.set(id, map.get(id)! + 1);
		} else {
			map.set(id, 1);
		}
	};

	data.forEach(item => {
		const val = dataPath(item, path);
		if ((val ?? '') !== '') {
			if (Array.isArray(val)) {
				for (let index = 0; index < val.length; index++) {
					setMap(<string>val[index]);
				}
			} else {
				setMap(<string>val);
			}
		} else {
			setMap('');
		}
	});
	return Array.from(map);
};
```

`<T extends AnyObject>`泛型参数 `T`，表示函数适用于任何对象类型;`data: T[]`表示一个包含对象的数组，表示要分组的数据。`path: string`为字符串参数，指定用于分组的对象路径。`convert?: (key: string) => string`表示可选的转换函数，用于将键值转换为字符串。

`const map = new Map<string, number>();`创建一个 `Map` 对象，用于存储分组后的键值和对应的计数。`convert = convert ?? ((key: string) => key);`如果未提供 `convert` 函数，使用默认的身份函数（返回键本身）。

```typescript
const setMap = (key: string) => {
	const id = convert!(key);
	if (map.has(id)) {
		map.set(id, map.get(id)! + 1);
	} else {
		map.set(id, 1);
	}
};
```

`const setMap = (key: string) => { ... }`定义了一个内部函数 `setMap`，用于更新 `Map` 对象：

- `const id = convert!(key);`：将键值转换为字符串 `id`
- `if (map.has(id)) { map.set(id, map.get(id)! + 1); }`：如果 `map` 中已存在该键，则计数加1
- `else { map.set(id, 1); }`：否则，将该键值的计数设置为1

```
data.forEach(item => {
	const val = dataPath(item, path);
	if ((val ?? '') !== '') {
		if (Array.isArray(val)) {
			for (let index = 0; index < val.length; index++) {
				setMap(<string>val[index]);
			}
		} else {
			setMap(<string>val);
		}
	} else {
		setMap('');
	}
});
```

`data.forEach(item => { ... })`遍历 `data` 数组中的每个对象 `item`：

- `const val = dataPath(item, path);`：调用上面的`datapath`函数获取对象 `item` 中指定路径 `path` 的值。

- 如果 `val` 不为 `null` 或 `undefined` 且不为空字符串：

  - 如果 `val` 是数组，遍历数组并调用 `setMap`：

    `setMap(<string>val[index]);`将数组中的每个元素转换为字符串并更新 `Map`。

- 否则，将 `val` 转换为字符串并更新 `Map`。

- 如果 `val` 为 `null` 或 `undefined` 或空字符串，将空字符串作为键值更新 `Map`。

### `parseArgs 

`parseArgs` 函数用于解析排序参数 `orderby` 并将其转换为一个数组，返回解析后的排序键值对数组。

- 检查 `orderby` 是否为字符串。
- 如果是字符串，将其按空格分割，并根据前缀 `+` 或 `-` 确定排序顺序。
- 如果是对象，将其键值对映射为 `[key, value]` 元组，并将排序顺序设定为 `1` 或 `-1`。
- 返回解析后的排序键值对数组。

```
export const parseArgs = (orderby: CensoredTheme.OrderByArg) => {
	const result: [string | number, -1 | 1][] = [];
	if (typeof orderby === 'string') {
		const arr = orderby.split(' ');
		for (let i = 0, len = arr.length; i < len; i++) {
			const key = arr[i];
			switch (key[0]) {
				case '+':
					result.push([key.slice(1), 1]);
					break;
				case '-':
					result.push([key.slice(1), -1]);
					break;
				default:
					result.push([key, 1]);
			}
		}
	} else {
		result.push(
			...Object.keys(orderby).map<[string, -1 | 1]>(key => {
				return [key, orderby[key]];
			}),
		);
	}
	return result;
};
```

函数接受一个参数 `orderby`，其类型为 `CensoredTheme.OrderByArg`，可能是字符串或对象。`const result: [string | number, -1 | 1][] = [];`初始化一个空数组 `result`，用于存储解析后的排序键值对。每个元素是一个元组，包含一个键（字符串或数字）和一个排序顺序（-1 或 1）。

```
if (typeof orderby === 'string') {
	const arr = orderby.split(' ');
	for (let i = 0, len = arr.length; i < len; i++) {
		const key = arr[i];
		switch (key[0]) {
			case '+':
				result.push([key.slice(1), 1]);
				break;
			case '-':
				result.push([key.slice(1), -1]);
				break;
			default:
				result.push([key, 1]);
		}
	}

```

`if (typeof orderby === 'string')`：检查 `orderby` 是否为字符串。

`const arr = orderby.split(' ');`：将字符串按空格分割成数组 `arr`。

`for (let i = 0, len = arr.length; i < len; i++) { ... }`：遍历数组 `arr`：
- `const key = arr[i];`：获取当前键 `key`。
- `switch (key[0]) { ... }`：根据键的第一个字符判断排序顺序：
  - `case '+':`：如果键以 `+` 开头，表示升序，移除 `+` 并添加到 `result`。
  - `case '-':`：如果键以 `-` 开头，表示降序，移除 `-` 并添加到 `result`。
  - `default:`：默认情况下，表示升序，直接添加到 `result`。

```typescript
} else {
	result.push(
		...Object.keys(orderby).map<[string, -1 | 1]>(key => {
			return [key, orderby[key]];
		}),
	);
}
```

如果 `orderby` 不是字符串，则假定其为对象。`result.push(...Object.keys(orderby).map<[string, -1 | 1]>(key => { ... }));`：将对象 `orderby` 的键值对映射为元组并添加到 `result`：

- `Object.keys(orderby)`：获取对象的所有键。
- `.map<[string, -1 | 1]>(key => { ... })`：将每个键映射为 `[key, orderby[key]]` 元组。
- `...`：使用展开运算符将映射后的元组数组展开并添加到 `result`。

### `sortBy`

`sortBy` 泛型函数用于根据指定的排序参数 `orderby` 对对象数组 `data` 进行排序。

```
export const sortBy = <T extends AnyObject>(data: T[], orderby: CensoredTheme.OrderByArg) => {
	const sort = parseArgs(orderby);
	const len = sort.length;
	return data.sort((a, b) => {
		for (let index = 0; index < len; index++) {
			const [key, order] = sort[index];
			if (a[key] === b[key]) {

			} else {
				return order > 0 ? a[key] - b[key] : b[key] - a[key];
			}
		}
		return 0;
	});
};
```

`data: T[]`：一个包含对象的数组，表示要排序的数据。`orderby: CensoredTheme.OrderByArg`为排序参数，可以是字符串或对象。

`const sort = parseArgs(orderby);`调用 `parseArgs` 函数解析 `orderby`，返回一个排序键值对数组 `sort`。`const len = sort.length;`获取排序键值对数组的长度 `len`。

```
return data.sort((a, b) => {
	for (let index = 0; index < len; index++) {
		const [key, order] = sort[index];
		if (a[key] === b[key]) {

		} else {
			return order > 0 ? a[key] - b[key] : b[key] - a[key];
		}
	}
	return 0;
});
```

对 `data` 数组进行排序，`(a, b) => { ... }`比较函数接受两个参数 `a` 和 `b`，表示要比较的两个对象。遍历排序键值对数组 `sort`：

- `const [key, order] = sort[index];`：解构赋值，获取当前排序键值对的键 `key` 和排序顺序 `order`。

- `if (a[key] === b[key]) { ... }`：如果 `a` 和 `b` 在当前键 `key` 上的值相等，继续比较下一个键。

- 否则，根据排序顺序返回比较结果

  `return order > 0 ? a[key] - b[key] : b[key] - a[key];`：如果 `order` 大于0，表示升序；否则，表示降序。返回两个值的差值以确定排序顺序。如果所有排序键的值都相等，返回0，表示 `a` 和 `b` 相等
