---
title: "Vue3 响应式原理"
date: "2025-09-11"
category: "Vue 底层原理"
tags: ["Vue"]
summary: "本文简单介绍一下 Vue 响应式原理的底层实现。"
author: "破酥"
readTime: "60分钟"
---

# Vue3 响应式原理

本文简单介绍一下 Vue 响应式原理的底层实现。

# TLDR

在本篇文章，我们先分析了Vue的MVVM的整体架构，主要实现了最基本的响应式系统。实现一个响应式系统最重要的一点就是理解副作用。副作用函数指的是会产生副作用的函数。当一个函数执行时，会直接或间接影响其他函数的执行，这时候我们就称这个函数产生了副作用。副作用很容易产生，例如我们在文章中经常提到的`document.body.innerText = refObj.bar`，他的设置会改变其他代码对文本内容的设置；再比如修改全局变量等等。我们称`refObj.bar`为副作用函数的依赖，副作用函数会因为依赖的变化而产生副作用。

那么响应式是什么？Vue 最标志性的功能就是其低侵入性的响应式系统。响应式就是当数据变化时，视图也会随机自动更新。这里的更新就是重新触发数据（依赖）关联的副作用函数。那我们的响应式系统就要做到能够创建响应，并收集响应式数据相关联的副作用函数，当响应式数据发生改变时，重新触发这些副作用函数。

我们首先需要拦截对响应式数据的读写操作。由于`Proxy`的易用性，在Vue3中采用`Proxy`代替了`Object.defineProperty`来实现数据劫持。我们使用`get`方法拦截数据的读取操作，用`set`方法拦截数据的设置操作。这个思路会贯穿整个响应式系统的实现。

在使用`get`方法拦截数据的读取操作时，我们需要追踪该数据，并收集其关联的副作用函数，将这些函数存入一个储存副作用函数的桶`effectBucket`中（`track`），并在使用`set`方法拦截数据设置操作时根据需要重新执行他们（`trigger`）。这里我们使用了`activeEffect`来作为中间变量来操作副作用函数的存储。

我们知道代理对象、字段名（对象键值）与副作用函数之间存在着树状关系，因此他们对应的数据结构也是树状的。为了防止内存溢出，我们使用`weakMap`来作为存储所有副作用函数的桶。`weakMap`在代理对象没有任何引用的情况下会自动触发垃圾回收机制，从而避免了内存溢出。`EffectBucket`储存着字段名（对象键值）与副作用函数依赖集合的键值对，当我们在`track`函数中进行副作用函数的存储时，根据树状结构依次存储相关的信息。

而对于`set`方法我们使用`trigger`函数触发更新。我们只需要根据字段名在`EffectBucket`中找到对应的副作用函数依赖集合，并重新运行里面存放的副作用函数就可以了。

这里我们可能会遇到一些不必要的更新。当某一变量发生变化时，代码执行的分支可能也会随之变化，称为分支切换。当发生分支变换时，我们不一定需要执行原有的副作用函数，因此我们在每次将副作用函数添加到依赖集合时，先清空依赖集合中原有的副作用函数，再通过`track`将当前代码执行分支所需的副作用函数添加到`EffectBucket`中。

在副作用函数中可能会嵌套另一个副作用函数。如果存在effect嵌套，我们目前的系统全局`activeEffect`永远是初始化时最后执行的那个副作用函数。为了解决这个问题，我们需要一个副作用函数栈`effectStack`，副作用函数执行时压栈，执行完毕后退栈，并始终让`activeEffect`指向栈顶。

当我们遇到形如`obj.foo++`这类调用自身的副作用函数时，需要避免无限递归循环。在这个副作用函数中，读取`obj.foo`会触发`track`，而将更新完后的值赋给本身又会触发`trigger`，从桶中取出副作用函数重新执行，而我们当前就正在处理这个副作用函数，这样就导致了无限递归调用自身。所以我们需要在`trigger`中添加护卫条件，当当前执行的副作用函数与触发的副作用函数相同时，则不触发执行。

可调度是响应式系统非常重要的特性。当trigger触发副作用函数执行时，应有能力决定副作用函数执行时机、次序以及方式，我们为副作用函数增加了一个选项参数调度器scheduler，如果该属性存在，则按照`scheduler`函数来执行副作用函数。我们可以使用调度器来实现多次修改响应式数据只触发一次更新（使用Promise创建微序列）。

计算属性`computed`就是通过调度器实现的。首先我们先为副作用函数选项添加懒加载`lazy`，用于不希望函数立即执行，而在需要的场景执行的情况。接下来我们需要修改用来监听副作用的`watchEffect`：

```typescript
function watchEffect(fn: EffectFunction, options: EffectOptions = {}): EffectFunction {
  const effectFn: EffectFunction = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(activeEffect)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }

  effectFn.options = options
  effectFn.deps = []

  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}
```

这样处理后，不难看出传递给`effect`的函数`fn`才是真正的副作用函数，`effectFn`的返回值就是副作用函数的执行结果。仅当`lazy`属性为false时才执行该函数，返回`effectFn`，用于在需要的时候调用。我们把传递给`watchEffect`的函数看作一个`getter`，那么我们在手动执行副作用函数时，就可以拿到返回值

对于计算属性，我们还需要缓存计算结果，而不是读取时才进行计算。我们实现一个调度器，引入`dirty`实现脏读，进行计算后设置为false，当其为true时才执行副作用函数重新计算。当在`watchEffect`里读取`computed`的计算值时会发生嵌套，我们需要get方法中调用`track`函数来收集`computed`内层的响应式数据；当计算属性依赖的响应式数据发生变化时，通过调度器手动调用`trigger`函数。

`watch` 本质是观测一个响应式数据，当数据发生变化时通知并执行相应的回调函数。`watch`的实现本质就是利用了`watchEffect`以及`scheduler`选项，当响应式数据发生变化时，触发`scheduler`调度函数执行，相当于一个回调函数。我们需要一个`traverse`函数进行递归读取操作，`watch`函数允许观测响应式数据和`getter`函数，同时能通过`lazy`在回调函数中获取旧值和新值。

当然如果我们在执行异步编程时，可能会发生竞态问题，于是我们需要引入`onInvalidate`来注册一个回调，当在`watch`内部检测到变更时，在副作用函数重新执行之前会先调用我们通过`onInvalidate`注册的过期回调。这时我们可以设置一个过期标识`expired`，如果为真，则不将此次获得的结果赋给最终结果。

实现了响应式基础，接下来我们来具体实现响应式系统。在平时使用Vue的时候我们就经常用到`reactive`和`ref`。`reactive`只能用于创建对象的响应式，无法创建原始值的响应式，这部分就由`ref`来实现。

这里说说`Reflect`。`Reflect` 是一个内建对象，可简化 `Proxy` 的创建。对于任意 `Proxy` 捕捉器，都有一个带有相同参数的 `Reflect` 调用。我们可以使用它们将调用转发给目标对象，也可以将操作转发给原始对象。`Reflect.get`函数还能接收第三个参数，即指定接收者`receiver`，你可以把它理解为函数调用过程中的`this`。这里我们用`receiver`在大部分情况下指定this为代理对象，以避免指向原始对象丢失响应。

接下来就是对对象的各种方法进行拦截了。对于一些只有一个`target`参数的操作方法，我们使用`ITERATE_KEY`来作为`effectBucket`的键值。触发时我们只需要将于`ITERATE_KEY`相关联的副作用函数也取出来执行即可。

无论是添加或删除新属性，还是修改已有的属性值，其基本语义都是`[[Set]]`，我们都是通过 set 拦截函数来实现拦截的，设置属性操作发生时，就需要我们在`set`拦截函数内能够区分操作的类型，并在`trigger`中通过`type`区分当前操作类型，并且只有当操作类型`type`为 ‘ADD’ 和 ‘DELETE’ 时，才会触发与`ITERATE_KEY`相关联的副作用函数重新执行。将上述拦截方法封装，就是`reactive`函数了。

对于异常对象的处理思路也类似，但我们需要创建一个中间对象来拦截一些特殊的方法，比如`[Symbol.iterate]`。这里我们需要注意处理数组的`push`方法时需要屏蔽对`length`属性的读取，否则会引起死循环。

接下来`ref`的实现就简单了。我们只需要将非对象类型数据用对象包裹，并用`Object.defineProperty`添加响应标识`_is_Ref_`，并根据响应标识`_is_Ref_`来自动脱`ref`实现在模板等使用环境中直接读取数据而不用通过`value`字段读取。

# 响应式基础

## 副作用

首先我们先来了解一下 Vue 响应式的一个重要概念：**副作用函数**。

为了能重新运行计算的代码来更新，我们需要将计算包装为一个 `update()` 函数，这个 `update()` 函数会产生一个**副作用**，或者就简称为**作用** (effect)，因为它会更改程序里的状态。例如：

```jsx
let A2

function update() {
  A2 = A0 + A1
}
```

`A0` 和 `A1` 被视为这个作用的**依赖** (dependency)，因为它们的值被用来执行这个作用。因此这次作用也可以被称作它的依赖的一个**订阅者** (subscriber)。例如由于 `A0` 和 `A1` 在 `update()` 执行时被访问到了，则 `update()` 需要在第一次调用之后成为 `A0` 和 `A1` 的订阅者。当检测到变量变化时，应该通知其所有订阅了的副作用重新执行。我们需要一个函数，能够在 `A0` 或 `A1` (这两个**依赖**) 变化时调用 `update()` (产生**作用**)。

当一个依赖发生变化后，**副作用会重新运行**，这时候会创建一个更新后的虚拟 DOM 树。运行时渲染器遍历这棵新树，将它与旧树进行比较，然后将必要的更新应用到真实 DOM 上去。

## 数据劫持

在Vue3，我们使用`Proxy`来实现数据劫持。与Vue2使用的`Object.defineProperty`的区别在于`Object.defineProperty`必须对于确定的`key`值进行响应式的定义，而`Proxy`在定义的时候并不用关心key值，只要你定义了get方法，那么后续对于data上任何属性的访问（哪怕是不存在的），都会触发`get`的劫持，`set`也是同理。

```jsx
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      trigger(target, key)
    }
  })
}

function ref(value) {
  const refObject = {
    get value() {
      track(refObject, 'value')
      return value
    },
    set value(newValue) {
      value = newValue
      trigger(refObject, 'value')
    }
  }
  return refObject
}
```

**由于Proxy实现的`reactive`只能劫持对象，Vue对于非对象数据采用包装到具有value属性的对象，并代理这个包装对象实现劫持，这就是`ref`的由来。**

> 一句话总结：在 Vue3 中，我们需要通过`Proxy` 实现对数据的劫持，并利用其不需要指定特定 key 的特点，在各种对数据的操作中捕获一些会影响状态的**副作用**，并在数据更新时重新执行这些副作用函数以更新状态。
> 

为了实现该功能，我们需要一个全局副作用函数桶`effectBucket` ，并设置一个全局副作用变量`activeEffect` ，在`track()` 内部收集副作用，读取时在`trigger()`内部再次从桶中取出副作用函数执行。

在 `track()` 内部，我们会检查当前是否有正在运行的副作用。如果有，我们会查找到一个存储了所有追踪了该属性的订阅者的 Set，然后将当前这个副作用作为新订阅者添加到该 Set 中。在 `trigger()` 之中，我们会再查找到该属性的所有订阅副作用。但这一次我们需要执行它们。副作用订阅将被存储在一个全局的 `WeakMap<target, Map<key, Set<effect>>>` 数据结构中。如果在第一次追踪时没有找到对相应属性订阅的副作用集合，会在这里新建一个集合。

![image.png](https://pic1.imgdb.cn/item/68c1aacb58cb8da5c899816f.png)

> 这里使用`WeakMap`的原因是它对`key`是弱引用，当`target`没有任何引用时，垃圾回收器会完成回收任务，如果使用`Map`，即使用户代码对`target`没有任何引用，也不会被回收，可能会导致内存溢出。
> 

这样，我们就实现了一个简单的响应式：

```typescript
let activeEffect: Function
const effectBucket = new WeakMap()
const refObj = new Proxy(data, {
	get(target, key) {
        track(target, key)
        return target[key]
    },
    
    set(target, key, newVal) {
        target[key] = newVal
        trigger(target, key)
    }
})

function effect(fn) {
    activeEffect = fn
    fn()
}

export function track(target: any, key: string | symbol) {
	if (!activeEffect) return target[key]

  let depsMap = effectBucket.get(target)

  if (!depsMap) {
    effectBucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
}

function trigger(target: any, key: string | symbol) {
	const depsMap = bucket.get(target)
    if (!depsMap) { return false }
    const effects = depsMap.get(key)
    effects && effects.forEach((fn: Function) => fn())
}
```

> 一句话总结：为了收集数据操作过程中的副作用函数，我们需要利用`weakMap` 将相关对象作为键，对应的键值为一个`Map` ，该`Map`的键为该对象的键名`key` ，键值为一个收集有该`key`副作用函数的`Set` 。当`get`数据时触发`track(`收集副作用函数，`set`该数据时触发`trigger()` 执行对应的副作用函数。
> 

## 分支切换

当某一变量发生变化时，代码执行的分支会跟着跟着变化，称为分支切换，典型的例子就是三目运算符`a ? b : c`。当发生分支切换时，可能会产生遗留的副作用函数，运行时可能会触发不必要的更新。**解决方法就是每次副作用函数执行时，先从所有含有它的依赖集合中删除该副作用函数，再重新建立联系，这样在新的联系中就不会包含遗留（不需要）的副作用函数。**

这里我们在`effect`函数中设置一个`EffectFunction`，在`Function`的基础上新增`deps`属性，该属性是一个数组，用来存储所有包含当前副作用函数的依赖集合。不难发现，在`track`函数我们会发现其中的`deps`就是我们要的依赖集合，所以很适合在`track`中收集`effectFn.deps` 。有了`effectFn.deps`后，我们就可以根据它来获取所有相关联的依赖集合，进而移除不需要的副作用函数：

```typescript
export function track(target: any, key: string | symbol) {
	if (!activeEffect) return target[key]

  let depsMap = effectBucket.get(target) as DepsMap

  if (!depsMap) {
	  effectBucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
	  depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  
  activeEffect.deps.push(deps)
  
}

function effect(fn) {
    const effectFn: EffectFunction = () => {
        cleanup(effectFn)   // 清除原有依赖
        activeEffect = fn
        fn()
    }

    effectFn.deps = []

    effectFn()
}

function cleanup(effectFn) {
    if (effectFn.deps) {
        for (let deps of effectFn.deps) {
          deps.delete(effectFn)
        }
        effectFn.deps = []
    }
}
```

目前有个问题，如果我们目前的副作用函数是被需要的，那么在`trigger`函数的`effects && effects.forEach((fn) => fn())`中，我们先删除了该函数再添加了该函数，在集合中该值被删除但被重新添加，如果此时调用`forEach`遍历集合并没有结束，则会重新访问再次添加的值，引发死循环。解决方法也很简单，我们只需构造另外一个集合并遍历即可，此时我们再次添加该函数的集合就不是我们遍历的集合。

```typescript
export function trigger(target: any, key: string | symbol) {
	const depsMap = effectBucket.get(target)
  if (!depsMap) { return false }
  const effects = depsMap.get(key)
  
  const effectsToRun = new Set(effects)
  effectsToRun.forEach((fn) => fn())
}
```

> 一句话总结：为了避免分支切换等情况时遗留的副作用函数再次执行，我们需要为副作用函数加上属性`deps` 用于收集该副作用函数相关的依赖，每次副作用函数执行时，先从所有**含有它**的依赖集合中**删除该副作用函数**，**重新建立联系后**再执行。
> 

## effect嵌套

当副作用函数之间发生嵌套时，我们现有的响应式系统会出现一些问题。如果存在effect嵌套，我们目前的系统全局`activeEffect`永远是初始化时最后执行的那个副作用函数。为了解决这个问题，我们需要一个副作用函数栈`effectStack`，副作用函数执行时压栈，执行完毕后退栈，并始终让`activeEffect`指向栈顶：

```typescript
function effect(fn) {
    const effectFn: EffectFunction = () => {
        cleanup(effectFn)   // 清除原有依赖
        activeEffect = effectFn
        effectStack.push(activeEffect)
        fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
    }

    effectFn.deps = []

    effectFn()
}

```

> 一句话总结：当副作用函数之间发生嵌套时，我们目前的系统全局`activeEffect`永远是初始化时最后执行的那个副作用函数，因此我们需要一个副作用函数栈`effectStack`，副作用函数执行时压栈，执行完毕后退栈，并始终让`activeEffect`指向栈顶，这样解决了系统全局`activeEffect`永远是初始化时最后执行的那个副作用函数的问题。
> 

接下来看一个副作用函数：

```typescript
effect(() => { refObj.foo = refObj.foo + 1 })
```

在这个语句中，首先读取`obj.foo`的值，这会触发`track`操作，将当前副作用函数收集到“桶”中，接着将其加1后再赋值给`obi.foo`，此时会触发 trigger 操作，即把“桶”中的副作用函数取出并执行。但问题是该副作用函数正在执行中，还没有执行完毕，就要开始下一次的执行。这样会导致无限递归地调用自己，于是就产生了栈溢出。

我们为`trigger`添加护卫条件，如果`trigger`触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行：

```typescript
function trigger(target: any, key: string | symbol) {
  const depsMap = effectBucket.get(target)
  if (!depsMap) { return false }
  const effects = depsMap.get(key)

  const effectsToRun = new Set(effects)
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach((effectFn) => effectFn())
}
```

> 一句话总结：当出现赋值调用自身的情况时，由于会同时触发`track` 和 `trigger` 导致同一个副作用函数无限递归地调用自己，这里我们需要为`trigger`添加护卫条件，如果`trigger`触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行。
> 

## 可调度性

可调度性是响应系统非常重要的特性，当`trigger`触发副作用函数重新执行时，有能力决定副作用函数执行的时机、次数以及方式。我们为`EffectFunction`添加选项参数`options`，允许用户指定调度器：

```typescript
function effect(fn, options) {
    const effectFn: EffectFunction = () => {
        cleanup(effectFn)   // 清除原有依赖
        activeEffect = effectFn
        effectStack.push(activeEffect)
        fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
    }
	
    effectFn.options = options
    effectFn.deps = []

    effectFn()
}
```

我们在`trigger`函数中触发副作用函数重新执行时就可以直接调用用户传递的调度器函数，从而把控制权交给用户：

```typescript
effectsToRun.forEach((effectFn) => {
    const EffectFunctionOptions = effectFn.options as EffectOptions
    if (EffectFunctionOptions.scheduler) {
      EffectFunctionOptions.scheduler(effectFn)
    } else {
      effectFn()
    }
})
```

> 一句话总结：为了提供可调度性，我们为`EffectFunction`添加选项参数`options` 提供`scheduler` 属性允许用户指定调度器函数，并在`trigger` 时调用。
> 

## 懒加载与计算属性

我们在`EffectOptions`中添加懒加载布尔值`lazy`，用于不希望函数立即执行，而在需要的场景执行的情况。接下来修改`effect`函数，仅当`lazy`属性为false时才执行该函数，返回`effectFn`，用于在需要的时候调用。

**注意懒加载是**我们希望副作用函数（即计算过程）只有在第一次访问 `value` 时才会执行，这就是为什么将 `lazy` 设置为 `true`。如果强制设置 `lazy = false`，就会失去懒加载的效果，属性的值会立即计算。

```typescript
function effect(fn, options) {
    const effectFn: EffectFunction = () => {
        cleanup(effectFn)   // 清除原有依赖
        activeEffect = fn
        effectStack.push(activeEffect)
        const res = fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
        return res
    }
	
    effectFn.options = options
    effectFn.deps = []
    
		if (!options.lazy) effectFn()
		  
		return effectFn
}
```

不难看出传递给`effect`的函数`fn`才是真正的副作用函数，`effectFn`的返回值就是副作用函数的执行结果。实现了懒执行，我们就可以开始实现计算属性了。除了懒执行外，我们还需要缓存计算的结果，而不是读取时才会进行计算。如果在读取时才进行计算并得到值，多次访问时会导致值本身并没有发生变化但`effectFn` 仍然进行了多次计算，因此我们需要设置一个`dirty` ，用于判断当前值是否发生变化进而判断是否需要重新执行。

当完成一次计算时，`dirty`的值始终为`false`，这会导致再次计算时访问到的值不变，我们可以在之前的`scheduler` 中添加`dirty = true`来解决这个问题。需要注意，当另一个effect读取计算属性的值时，这本质上是一个effect嵌套，外层的effect不会被内层的effect中的响应式数据收集。解决方法也很简单，当读取计算属性值时，手动调用`track`函数；当计算属性依赖的响应式数据发生变化时，手动调用`trigger`函数：

```typescript
export function computed(getter) {
  let cache
  let dirty = true
  
  const effectFn = watchEffect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) { 
      	dirty = true
      	trigger(obj, "value")
      }
    }
  })

  const obj: { readonly value: any } = {
    get value() {
      if (dirty) {
        cache = effectFn()
        dirty = false
      }
      track(obj, "value")
      return cache
    }
  }

  return obj
}
```

> 一句话总结：我们在`EffectOptions`中添加懒加载布尔值`lazy`，用于不希望副作用函数立即执行，而在需要的场景（即读取时）才执行的情况。有了懒加载，我们就可以着手实现计算属性`computed`。为了处理值本身并没有发生变化时读取`effectFn` 仍然会进行了多次计算的问题，我们需要设置一个`dirty` ，用于判断当前值是否发生变化进而判断是否需要重新执行。由于计算属性本质上是一个effect嵌套，因此当读取计算属性值时，手动调用`track`函数；当计算属性依赖的响应式数据发生变化时，手动调用`trigger`函数。
> 

## watch

`watch` 本质是观测一个响应式数据，当数据发生变化时通知并执行相应的回调函数。`watch`的实现本质就是利用了`effect`以及`scheduler`选项，当响应式数据发生变化时，触发`scheduler`调度函数执行，相当于一个回调函数。`watch`函数允许观测响应式数据和`getter`函数，对于对象我们需要一个`traverse`函数通过递归读取操作对对象进行深度读取。

对于新旧值的获取，我们可以在初始化 `watch` 时手动调用副作用函数以获取一个值，该值可以视为旧值。然后，在调度器触发时，我们再次调用该副作用函数以获取新值。这样我们同时能通过`lazy`在回调函数中获取旧值和新值。

```typescript
function watch<T>(target:  T | (() => T) | Ref<T>, callback) {
	let getter
  if (typeof target = "function") getter = target
  else getter = () => traverse(target)
  
      
  let newVal, oldVal
  
  const effectFn = effect(() => getter(), {
      lazy: true,
      scheduler() {
          newVal = effectFn()
          callback(newVal, oldVal)
          oldVal = newVal
      }
  })
  oldVal = effectFn()
}

function traverse(value, traversed = new Set()) {
    // 目前只考虑数组
	if (typeof value !== 'object' || value === nul || traversed.have(value)) { return }
	traversed.add(value)
    
  for (const key in value) {
      traverse(value[key], traversed)
  }
    
}
```

`watch`的回调只会在响应式数据发生变化时才执行，如果需要立即执行，我们可以设置一个可选参数`immediate`来控制。如果还需要指定回调函数的其他执行时机，可以使用`flush`选项来指定，类型为`post | pre | sync`，在这里不做过多叙述。

我们还需要一个让副作用过期的手段。在开发过程中对于异步编程我们可能会遇到旧值覆盖新值的问题，我们为`watch`的回调函数添加第三个参数`onInvalidate`来注册一个回调，这个回调函数会在当前副作用函数过期时执行，当在`watch`内部检测到变更时，在副作用函数重新执行之前会先调用我们通过`onInvalidate`注册的过期回调。这些我们仅作了解，不做深入探讨。

> 一句话总结：`watch` 实现的核心就是利用`effect`的`scheduler` 函数。`watch`函数允许观测响应式数据和`getter`函数，对于对象我们需要一个`traverse`函数通过递归读取操作对对象进行深度读取，处理后作为`getter`函数。对于新旧值的获取，我们可以在初始化 `watch` 时手动调用副作用函数以获取一个值，该值可以视为旧值。然后，在调度器触发时，我们再次调用该副作用函数以获取新值。
> 

# 响应式系统

## Reflect

在这之前我们知道Vue3响应式数据是基于`Proxy`实现的，我们再次了解一下Proxy和与之相关联的`Reflect`。Proxy可以创建一个代理对象，能够实现对其他对象**基本语义**的代理，注意只能代理对象，无法代理非对象值，它允许我们拦截并重新定义对一个对象的基本操作。我们使用`get`拦截读取操作，`set`拦截设置操作，`apply`拦截函数调用。

`Reflect` 是一个内建对象，可简化 `Proxy` 的创建**。对于任意 `Proxy` 捕捉器，都有一个带有相同参数的 `Reflect` 调用。**我们可以使用它们将调用转发给目标对象，也可以将操作转发给原始对象。`Reflect.get`函数还能接收第三个参数，即指定接收者`receiver`，你可以把它理解为函数调用过程中的`this`。

如果我们给`data`加上get属性：

```typescript
const obj = { 
	text: "hello",
  get bar() {
      return this.text
  }
}

const refObj = new Proxy(obj, {
	get(target, key) {
        track(target, key)
        return target[key]
    },
    
    set(target, key, newVal) {
        target[key] = newVal
        trigger(target, key)
    }
})

watchEffect(() => {
    console.log(refObj.bar)
})
```

此时我们进行数据劫持后再修改`refObj.text`的数据，会发现并没有触发响应。问题就出在 bar 属性的访问器函数`getter`里，当我们使用 `this.foo` 读取 `foo`属性值时，在`get`拦截函数通过 `target[key]`返回属性值，而我们的`target`是原始数据`obj`，说明`this`最后访问的其实是`obj.text`。**在副作用函数内通过原始对象访问它的某个属性是不会建立响应联系的。** 解决办法就是使用`Reflect.get`的第三个参数`receiver`，代表谁在读取属性。

> 一句话总结：当我们访问原始对象中设置 get 属性并通过`this` 获取值，触发 `getter`时，`this` 指向原始对象而不是响应式对象，**在副作用函数内通过原始对象访问它的某个属性是不会建立响应联系的。** 解决办法就是使用`Reflect.get`的第三个参数`receiver`，代表谁在读取属性。
> 
- 下面列出对象操作对应的 Reflect 方法，有兴趣可以了解一下
    - 访问属性`obj.foo`
        
        根据已经给出的代码就可以拦截
        
    - 判断对象或原型上是否存在给定的key`key in obj`
        
        `in` 操作符的运算结果是通过调用一个叫作`HasProperty`的抽象方法得到的
        
        ```typescript
        has(target, key) {
            track(target, key)
            return Reflect.has(target, key)
        }
        ```
        
    - 使用`for ... in`循环遍历对象：
        
        该方法是一个 generator 函数，接收一个参数obj，obj 就是被`for...in`循环遍历的对象，其关键点在于使用`Reflect.ownKeys(obj)`来获取只属于对象自身拥有的键。我们可以使用`ownKeys`拦截函数来拦截`Reflect.ownKeys`操作。
        
        **这里统一介绍一下对于一些只有一个`target`参数的操作方法，我们使用`ITERATE_KEY`来作为`effectBucket`的键值。触发时我们只需要将于`ITERATE_KEY`相关联的副作用函数也取出来执行即可。**我们在使用`track`函数进行追踪的时候，将`ITERATE_KEY`作为追踪的 key，因为`ownKeys`拦截函数与 get/set 拦截函数不同，在 set/get 中，我们可以得到具体操作的 key，但是在`ownKeys`中，我们只能拿到目标对象 target。
        
        ```typescript
        
        const ITERATE_KEY = Symbol()
        
        ownKeys(target) {
            // 关联ITERATE_KEY
            track(target, ITERATE_KEY)
            return Reflect.onwKeys(target)
        }
        ```
        
        既然追踪的是 ITERATE_KEY，那么相应地，在触发响应的时候也应该触发它才行。当我们为obj添加新的属性时，并不会触发副作用函数重新执行。添加新属性时触发`set`拦截函数执行，此时接收到的key就是字符串`bar`，因此调用`trigger`时只触发了与`bar`相关的副作用函数重新执行，但`for .. in`循环是在副作用函数与`ITERATE_KEY`之间建立联系，与`bar`一点关系没有。我们只需要将于`ITERATE_KEY`相关联的副作用函数也取出来执行即可：
        
        ```typescript
        function trigger(target: any, key: string | symbol) {
          const depsMap = effectBucket.get(target)
          if (!depsMap) { return false }
          // 获取与key相关联的所有副作用
          const effects = depsMap.get(key)
        
          // 获取与 ITERATE_KEY相关联的副作用函数
          const iterateEffects = depsMap.get(ITERATE_KEY)
        
          // 要执行的副作用集合
          const effectsToRun = new Set(effects)
        
          effects && effects.forEach(effectFn => {
            // 避免重复调用自身引发栈溢出
            if (effectFn !== activeEffect) {
              effectsToRun.add(effectFn)
            }
          })
        
          iterateEffects && iterateEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
              effectsToRun.add(effectFn)
            }
          })
        
          effectsToRun.forEach((effectFn) => {
            // 如果存在调度器，则使用调度器执行副作用函数
            const EffectFunctionOptions = effectFn.options as EffectOptions
            if (EffectFunctionOptions.scheduler) {
              EffectFunctionOptions.scheduler(effectFn)
            } else {
              effectFn()
            }
          })
        
        }
        ```
        
    - 删除属性
        
        delete 操作符的行为依赖`[[Delete]]`内部方法。论是添加或删除新属性，还是修改已有的属性值，其基本语义都是`[[Set]]`，我们都是通过 set 拦截函数来实现拦截的，设置属性操作发生时，就需要我们在`set`拦截函数内能够区分操作的类型。
        
        ```typescript
        deleteProperty(target, key) {
            // 检查被操作的属性是否是对象自己的属性
        	const hadKey = Object.prototype.hasOwnProperty.call(target, key)
            
          const res = Reflect.deleteProperty(target, key)
          
          // 删除成功且属性存在，触发更新
          if (res && hadKey) {
              trigger(target, key, "DELETE")
          }
          
          return res
        }
        
        const refObj = new Proxy(data, {
        	set(target, key, newVal, receiver) {
        		
            const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
            
            const res = Reflect.set(target, key, newVal, receiver)
            
            trigger(target, key, type)
            
            return res
        	}
        })
        
        ```
        
        由于删除操作会使得对象的键变少，它会影响`for...in`循环的次数，因此当操作类型为 ‘DELETE’ 时，我们也应该触发那些与 ITERATE_KEY 相关联的副作用函数重新执行。在`trigger`中通过`type`区分当前操作类型，并且只有当操作类型`type`为 ‘ADD’ 和 ‘DELETE’ 时，才会触发与`ITERATE_KEY`相关联的副作用函数重新执行：
        
        ```typescript
        export function trigger(target: any, key: string | symbol, type: string) {
          const depsMap = effectBucket.get(target)
          if (!depsMap) { return false }
          // 获取与key相关联的所有副作用
          const effects = depsMap.get(key)
        
          // 要执行的副作用集合
          const effectsToRun = new Set(effects)
        
          effects && effects.forEach(effectFn => {
            // 避免重复调用自身引发栈溢出
            if (effectFn !== activeEffect) {
              effectsToRun.add(effectFn)
            }
          })
        
          // 添加、删除属性
          if (type === TriggerType.ADD || type === TriggerType.DELETE) {
            // 获取与 ITERATE_KEY相关联的副作用函数
            const iterateEffects = depsMap.get(ITERATE_KEY)
        
            iterateEffects && iterateEffects.forEach(effectFn => {
              if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
              }
            })
        
          }
        
          effectsToRun.forEach((effectFn) => {
            // 如果存在调度器，则使用调度器执行副作用函数
            const EffectFunctionOptions = effectFn.options as EffectOptions
            if (EffectFunctionOptions.scheduler) {
              EffectFunctionOptions.scheduler(effectFn)
            } else {
              effectFn()
            }
          })
        
        }
        
        ```
        
        当值没有变化时，我们不应触发响应，例如p.foo 的初始值为 1，当为 p.foo 设置新的值时，如果值没有发生变化，则不需要触发响应。同时我们也要避免新值和旧值不全等时都不是NaN：
        
        ```typescript
        const refObj = new Proxy(data, {
            set(target, key, newVal, receiver) {
                const oldVal = target[key]
                
                const type = Object.prototype.hasOwnProperty.call(target, key) ? "SET" : "ADD"
                
                const res = Reflect.set(target, key, newVal, receiver)
                
                if (oldVal !== newVal && (oldVal === newVal || oldVal === newVal)) {
                    trigger(target, key, type)
                }
                
                return res
            }
        })
        ```
        

## reactive

接下来我们将上面的内容封装成一个`reactive`函数，接收一个对象作为参数，并返回为其创键的响应式数据。

由于某些属性需要通过额外的`ITERATE_KEY`来作为副作用函数桶的 key 值，我们需要设置一个`iterateBucket`，用来将`ITERATE_KEY`和对应的对象联系起来。

当我们将一个响应式对象设置为另一个响应式对象的原型时，我们也会与副作用函数之间建立联系，当我们执行`child.bar = 2`类似的操作时，副作用会执行两次，产生不必要的更新。

对于get方法，如果对象自身不存在该属性，那么会获取对象的原型，并调用原型的`[[Get]]`方法得到最终结果。当读取`child.bar`属性值时，由于child 代理的对象 obj 自身没有 bar 属性，因此会获取对象 obj 的原型，也就是 parent 对象，所以最终得到的实际上是`parent.bar`的值。但是大家不要忘了，parent 本身也是响应式数据，因此在副作用函数中访问`parent.bar`的值时，会导致副作用函数被收集，从而也建立响应联系。所以我们能够得出一个结论，即`child.bar`和`parent.bar`都与副作用函数建立了响应联系。

对于set方法，如果设置的属性不存在于对象上，那么会取得其原型，并调用原型的`[[Set]]`方法，也就是 parent 的`[[Set]]`内部方法。换句话说，虽然我们操作的是`child.bar`，但这也会导致parent 代理对象的 set 拦截函数被执行。前面我们分析过，当读取`child.bar`的值时，副作用函数不仅会被`child.bar`收集，也会被`parent.bar`收集。所以当 parent 代理对象的 set 拦截函数执行时，就会触发副作用函数重新执行，这就是为什么修改`child.bar`的值会导致副作用函数重新执行两次。

![image.png](https://pic1.imgdb.cn/item/68c1aaf258cb8da5c899819c.png)

解决方法就是屏蔽非当前操作对象的副作用函数。我们不难发现`receiver`就是`target`的代理对象，由于child中`target`中不存在`bar`属性，发生set操作时调用原型的`[[Set]]`方法触发parent的set拦截函数，由此可知parent的receiver就是代理对象child，而不再是parent的target的代理对象。因此我们可以根据receiver是不是target的代理对象来判断是否触发更新。

当我们访问`parent.raw`时，会返回`parent`的原始对象，由此我们可以判断当前操作是否为target的代理对象：

```typescript
 get(target, key: string | symbol, receiver: any) {
  if (key === "raw") {
    return target
  }
  track(target, key)
  return Reflect.get(target, key, receiver)
},

set(target, key, newVal, receiver) {
  const oldVal = target[key]

  const type = Object.prototype.hasOwnProperty.call(target, key) ? "SET" : "ADD"

  const res = Reflect.set(target, key, newVal, receiver)

  if (receiver.raw === target) {
    if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
        trigger(target, key, type)
    }

  }

  return res
},
```

> 一句话总结：由于某些属性需要通过额外的`ITERATE_KEY`来作为副作用函数桶的 key 值，我们需要设置一个`iterateBucket`，用来将`ITERATE_KEY`和对应的对象联系起来。当我们将一个响应式对象设置为另一个响应式对象的原型时，由于如果对象自身不存在该属性，那么会获取对象的原型，并调用原型的相关方法得到最终结果，从而导致重复执行，对于这种情况我们可以通过`paren.raw`判断当前操作是否为target的代理对象来处理。
> 

### 深响应和浅响应

当我们代理对象中包含其他对象时，我们会丢失对这些对象的响应，所以我们现在实现的reactive是浅响应的。要解决这个问题，我们需要对 Reflect.get 返回的结果做一层包装：

```typescript
get(target,key:string |symbol,receiver:any) {
	if (key ==="raw") {
		return target
  }
	track(target, key)
	
	const res =Reflect.get(target, key, receiver)
	if (typeof res !==null &&typeof res ==="object") {
		return reactive(res)
  }
	return res
},
```

---

然而并非所有情况我们都希望深响应，我们封装一个createReactive函数，传入第二个可选参数指定深浅响应：

```typescript
function createReactive(obj, isShallow = false) {
    ...
    get(target, key: string | symbol, receiver: any) {
      if (key === "raw") {
        return target
      }
      track(target, key)

      const res = Reflect.get(target, key, receiver)
      if (isShallow) {
          return res
      }
      if (typeof res !== null && typeof res === "object") {
        return reactive(res)
      }
      return res
    },
}
```

### 只读和浅只读

我们为`createReactive`添加第三个参数`isReadonly`：

```typescript
function createReactive(data: {[key: string | symbol]: any}, isShallow = false, isReadonly = false): any {
  const ITERATE_KEY = Symbol()
  return new Proxy(data, {
	/* ... */
      
    // 设置操作
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`property: ${key.toString()} is readonly`)
        return true
      }
		/* ... */
    },
   	
   	/* ... */

    // 删除操作
    deleteProperty(target: any, key: string | symbol) {
      if (isReadonly) {
        console.warn(`property: ${key.toString()} is readonly`)
        return true
      }
		/* ... */

  })
}
```

如果一个数据是只读的，那就意味着任何方式都无法修改它。因此，没有必要为只读数据建立响应联系。出于这个原因，当在副作用函数中读取一个只读属性的值时，不需要调用 track 函数追踪，修改`get`拦截函数：

```typescript
get(target, key: string | symbol, receiver: any) {
  	/* ... */
  	
  if (!isReadonly) {
    track(target, key)
  }
  
	/* ... */
	
},

```

同时为了实现深只读，让响应式对象内部的对象也设置为只读，修改`get`拦截函数：

```typescript
get(target, key: string | symbol, receiver: any) {
  	/* ... */
  	
    if (typeof res !== null && typeof res === "object") {
    	return isReadonly ? readonly(res) : reactive(res)
    }
  
	/* ... */
	
},
```

当`isReadonly && !isShallow`为true时，为深只读，反之为浅只读。

## 数组

- 读取操作
    - 通过索引访问数组元素值：`arr[0]`。
    - 访问数组的长度：`arr.length`。
    - 把数组作为对象，使用`for...in`循环遍历。
    - 使用`for...of`迭代遍历数组。
    - 数组的原型方法，如`concat/join/every/some/find/findIndex/includes`等，以及其他所有不改变原数组的原型方法。
- 设置操作
    - 通过索引修改数组元素值：`arr[1] = 3`。
    - 修改数组长度：`arr.length = 0`。
    - 数组的栈方法：`push/pop/shift/unshift`。
    - 修改原数组的原型方法：`splice/fill/sort`等。

### **数组索引与`length`**

通过数组的索引访问元素的值就会建立响应式联系，但通过索引设置数组的元素值与设置对象的属性值仍然存在根本上的不同。

- 如果设置的索引值大于数组当前的长度，那么要更新数组的 length 属性。所以当通过索引设置元素值时，可能会隐式地修改 length 的属性值，因此在触发响应时，也应该触发与 length 属性相关联的副作用函数重新执行
    - 通过索引可以修改或增加元素，当索引值大于数组长度时，就是增加元素。假设当前对象为数组且为增加元素的操作，那么应该触发与 `length` 相关的副作用
- 当修改 length 属性值时，只有那些索引值大于或等于新的`length`属性值的元素才需要触发响应
    - 通过 `length` 也会影响数组元素，当 `length` 设置为小于原来长度时 相当于将 `index > newLength` 的数据设置为 `undefined`，需要触发相关的副作用

```typescript
// createReactive

set(target, key, newVal, receiver) {
    ...

    // 如果代理目标是数组，判断索引大小是否大于数组大小，如果大于为添加操作，小于为设置操作
    const type = Array.isArray(target) ?
      Number(key) < target.length ? "SET": "ADD" :
      Object.prototype.hasOwnProperty.call(target, key) ? "SET" : "ADD"
	
  	
   if (receiver.raw === target) {
      if (oldVal !== newVal && (oldVal === newVal || oldVal === newVal)) {
          // 将新的length传给trigger
          trigger(target, key, type, newVal)
      }

}		
    ...
},
  
// trigger
// 对象是数组，且增加了数组元素
if (type === TriggerType.ADD && Array.isArray(target)) {
  const lengthEffects = depsMap.get("length")
  lengthEffects && lengthEffects.forEach((effectFn) => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
}
  
// 对象是数组，且修改了length属性
if (key === "length" && Array.isArray(target)) {
  depsMap.forEach((effects, key) => {
    if (key.toString() >= newVal) {
      effects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn)
        }
      })
    }
  })
}
```

> 一句话总结：对于数组索引和`length` ，通过数组索引设置元素值时，如果索引大于当前长度，会隐式修改 `length` 属性，因此需要触发相关副作用，同样在修改 `length` 属性时，只有索引大于或等于新长度的元素会触发响应，且大于新长度的元素会被设置为 `undefined`。
> 

### 遍历数组

使用`for...in`循环遍历数组与遍历常规对象并无差异，因此同样可以使用`ownKeys`拦截函数进行拦截。但我们需要注意的是会影响`for...in`循环遍历数组本质还是length：

- 添加新元素：`arr[100] = 'bar'`。
- 修改数组长度：`arr.length = 0`。

因此我们使用`"length"`来代替key：

```typescript
// for ... in 循环操作
ownKeys(target: any) {
    track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
    return Reflect.ownKeys(target)
},
```

接下来来看`for ... of`。该方法用于实现了迭代器的对象，数组内建了`Symbol.iterator`方法的实现。数组迭代器的执行会读取数组的 length 属性。如果迭代的是数组元素值，还会读取数组的索引。迭代数组时，只需要在副作用函数与数组的**长度和索引之间建立响应联系**，就能够实现响应式的`for...of`迭代。数组的 values 方法的返回值实际上就是数组内建的迭代器，在不增加任何代码的情况下，我们也能够让数组的迭代器方法正确地工作。

无论是使用`for...of`循环，还是调用`values`等方法，它们都会读取数组的`Symbol.iterator`属性。该属性是一个`symbol`值，为了避免发生意外的错误，以及性能上的考虑，我们不应该在副作用函数与`Symbol.iterator`这类`symbol`值之间建立响应联系，因此需要修改 get 拦截函数，如以下代码所示：

```typescript
get(target,key:string |symbol,receiver:any) {
    ...

	// 如果 key 的类型是 symbol，则不进行追踪
	if (!isReadonly &&typeof key !=="symbol") {
		track(target, key)
	}
    ...
},
```

> 一句话总结：对于`for...in` 通过拦截 `ownKeys` 和 `Symbol.iterator`，确保只在数组的 `length` 和索引变化时触发响应式更新，对于 `for...of` 循环遍历数组时，通过在`get` 中排除 key 的类型是 symbol 的情况避免在 `Symbol.iterator` 上建立不必要的响应联系以提高性能。
> 

### **数组查找**

```typescript
const obj = {}
const arr = reactive([obj])

console.log(arr.includes(arr[0]))
```

这个操作应该返回 true，但如果你尝试运行这段代码，会发现它返回了 false。问题出在`include`函数执行时会把当前代理对象当作内部`this`的值，在之前的实现我们知道通过代理对象来访问元素值时，如果值仍然是可以被代理的，那么得到的值就是新的代理对象而非原始对象，而**即使参数 obj 是相同的，reactive创建的代理对象也都是不同的**，因此`arr`内部创建的代理对象`arr[0]`与直接使用`arr[0]`并不相同。

解决方法是创建一个Map，用来建立原始对象和代理对象的联系。

```typescript
function reactive(data) {
  const existedProxy = reactiveMap.get(data)
  if (existedProxy) {
    return existedProxy
  }
  const proxy = createReactive(data)
  reactiveMap.set(data, proxy)
  return proxy
}
```

当我们运行`arr.includes(obj)`时，由于我们直接拿着原始对象去找，肯定是找不到的，我们还需要重写`includes`方法。我们知道，`arr.includes`可以理解为读取代理对象`arr`的`includes`属性，这就会触发`get`拦截函数，在该函数内检查`target`是否是数组，如果是数组并且读取的键值存在于`arrayInstrumentations`上，则返回定义在`arrayInstrumentations`对象上相应的值。也就是说，当执行`arr.includes`时，实际执行的是定义在`arrayInstrumentations`上的`includes`函数，这样就实现了重写，`indexOf`和`lastIndexof`类似。

```typescript
const originMethod = Array.prototype.includes
const arrayInstrumentation = {
  includes: function(...args: any): any {
    let res = originMethod.apply(this, args)

    if (res === false) {
      res = originMethod.apply(this.raw, args)
    }

    return res
  }
}

get(target, key: string | symbol, receiver: any) {
    ...

    // 拦截代理操作
    if (Array.isArray(target) && arrayInstrumentation.hasOwnProperty(key)) {
    return Reflect.get(arrayInstrumentation, key, receiver)
    }

    ...
},

```

> 一句话总结：为了确保 `arr.includes(obj)` 返回 `true`，我们通过创建一个 `Map` 来建立原始对象和代理对象之间的联系，并重写数组的 `includes` 方法，以确保在代理对象和原始对象之间正确地进行匹配，`indexOf`和`lastIndexof`类似。
> 

### 隐式修改数组长度

主要指的是数组的栈方法，例如`push/pop/shift/unshift`。拿`push`来说：当调用数组的 push 方法向数组中添加元素时，**既会读取数组的 length 属性值，也会设置数组的 length属性值**。这会导致两个独立的副作用函数互相影响，从而发生栈溢出。

问题的原因是 push 方法的调用会间接读取 length 属性。所以，只要我们“屏蔽”对 length 属性的读取，从而避免在它与副作用函数之间建立响应联系，其他的方法也类似。

```typescript
const trackMethods = ["push", "pop", "shift", "unshift", "splice"]

trackMethods.forEach((method: any) => {
  const originMethod = Array.prototype[method]
  
  // 使用前面Array数组查找的相同对象
  arrayInstrumentation[method] = function(...args: any): any {
    shouldTrack = false
    let res = originMethod.apply(this, args)
    shouldTrack = true
    return res
  }
})

// track
if (!activeEffect || !shouldTrack) {
    return
}
```

> 一句话总结：数组的栈方法，例如`push/pop/shift/unshift` ，**既会读取数组的 length 属性值，也会设置数组的 length属性值**。这会导致两个独立的副作用函数互相影响，从而发生栈溢出，我们需要“屏蔽”对 length 属性的读取，从而避免在它与副作用函数之间建立响应联系。
> 

## Set & Map

与普通对象不同，Set 和 Map 类型的数据有特定的属性和方法用来操作自身。

`Set.prototype.size`是一个访问器属性，我们需要修正访问器属性的 getter 函数执行时的 this 指向：

```typescript
get(target, key: string | symbol, receiver: any) {
    ... 

    // 处理Set和Map的size读取
    if (key === "size") {
		track(target, ITERATE_KEY)	
        return Reflect.get(target, key, target)
    }

    ...
},

```

### **`add & delete`**

当访问`p.delete`时，`delete`方法并没有执行，真正使其执行的语句是`p.delete(1)`这样的**函数调用**，故此时`target[key]`是一个函数调用，只需要把 delete 方法与原始数据对象绑定即可：

```typescript

get(target, key: string | symbol, receiver: any) {
      ... 
    const res = target[key].bind(target)
    if (typeof res !== null && typeof res === "object") {
    	return isReadonly? readonly(res) : reactive(res)
    }
    return res
     
},
```

有了思路以后，我们就可以实现`Set`类型数据的响应式方案了。对于add方法，`Set`工作方式为在副作用函数内访问了 p.size 属性；接着，调用`p.add`函数向集合中添加数据。由于这个行为会间接改变集合的`size`属性值，所以我们期望副作用函数会重新执行。为了实现这个目标，我们需要在访问size属性时调用 track 函数进行依赖追踪，然后在`add`方法执行时调用`trigger`函数触发响应。

```typescript
// Set交互处理
const mutableInstrumentation: {[index: string]: any} = {

  add(key: string | symbol): any {
    // this指向代理对象，获取原始对象
    const target = this.raw
    // 判断值是否存在
    const hadKey = target.has(key)
    const res = target.add(key)

    if (!hadKey) {
      trigger(target, key, "ADD")
    }
    return res
  },

  delete(key: string | symbol): any {
    const target = this.raw
    // 判断值是否存在
    const hadKey = target.has(key)
    const res = target.delete(key)

    if (!hadKey) {
      trigger(target, key, "ADD")
    }
    return res
  }
}

// createReactive
// 处理Set或Map的操作
if (typeof key === "string" && setMethod.includes(key)) {
    return mutableInstrumentation[key]
}

```

> 一句话总结：为了实现 `Set` 类型数据的响应式代理，我们需要修正 `size` 访问器属性的 `get` 方法的 `this` 指向，并在自定义的 `add` 和 `delete` 方法中绑定原始数据对象，以确保对 `Set` 操作时能够触发依赖追踪和副作用函数的正确执行。
> 

### **`set & get`**

`Map`数据类型拥有`get`和`set`这两个方法，当调用`get`方法读取数据时，需要调用`track`函数追踪依赖建立响应联系；

对于get，只需要注意在非浅响应的情况下，如果得到的数据仍然可以被代理，那么要调用 reactive(res) 将数据转换成响应式数据后返回。在浅响应模式下，就不需要这一步了。

```typescript
get(key: any) {
    const target = this.raw
    const hadKey = target.has(key)
    track(target, key)

    if (hadKey) {
      const result = target.get(key)
      return typeof result === "object" ? reactive(result) : result // 
    }
}
```

当调用`set`方法设置数据时，需要调用`trigger`方法触发响应。但会引发污染问题，在副作用函数中，我们通过原始数据 m 来读取数据值，然后又通过原始数据 m 设置数据值，此时发现副作用函数重新执行了。原因是我们原封不动把value设置到了target上，意味着设置到原始对象上的也是响应式数据，我们把这种行为称为**数据污染**。所以我们这里需要获取原始数据：

```typescript
set(key: any, value: any) {
    const target = this.raw
    const hadKey = target.has(key)

    const oldVal = target.get(key)

    // 获取原始数据
		const rawVal = value.raw || value
		target.set(key, rawValue)

    if (!hadKey) {
      trigger(target, key, "ADD")
    } else if (oldVal !== value && (oldVal === oldVal || value === value)) {
      trigger(target, key, "SET")
    }

},

```

> 一句话总结：在代理 `Map` 类型时，`get` 方法需要调用 `track` 追踪依赖并在非浅响应模式下通过 `reactive` 转换值为响应式数据；`set` 方法设置值时，必须避免数据污染，通过 `value.raw` 获取原始数据，确保不会错误地将响应式数据设置到原始对象上。
> 

### **`forEach((value, key, m) => {})`**

`forEach`的回调函数接收三个参数，分别是值、键以及原始 Map 对象。遍历操作只与键值对的数量有关，因此任何会修改 Map 对象键值对数量的操作都应该触发副作用函数重新执行，例如 delete 和 add 方法等。

所以当`forEach`函数被调用时，我们应该让副作用函数与`ITERATE_KEY`建立响应联系。但这里需要注意的是，我们不能直接用原生的`forEach`来实现，这样会导致传递给回调函数的参数是非响应式数据。其中第二个参数可以用来指定回调函数执行时的this值。

```typescript
forEach(callback: Function, thisArg: any) {
    // wrap用于包装响应式数据
    const wrap = (val: any) => typeof val === 'object' ? reactive(val) : val
    const target = this.raw
    // forEach遍历也和size有关，用size打标记
    track(target, ITERATE_KEY, "SIZE")

    target.forEach((v: any, k: any) => {
      callback.call(thisArg, wrap(v), wrap(k), this)
    })
}
```

`for in` 只关心键值，而`forEach`即关心键又关心值。这意味着，当调用`p.set('key', 2)`修改值的时候，也应该触发副作用函数重新执行，即使它的操作类型是`SET`。因此，我们应该修改`trigger`函数的代码来弥补这个缺陷：

```typescript

if (type === TriggerType.ADD || type === TriggerType.DELETE ||
    // 如果操作类型为SET且目标对象为MAP也应触发ITERATE_KEY对应操作
      type === "SET" && Object.prototype.toString.call(target) === "[Object Map]"
  ) {
    ...

}
```

> 一句话总结：在处理 `Map` 的 `forEach` 方法时，我们需要确保重写方法中回调函数中的值和键是响应式的，并且通过 `track` 追踪依赖与 `ITERATE_KEY` 关联，确保修改操作如 `SET`、`ADD` 或 `DELETE` 能触发副作用函数重新执行。
> 

### 迭代器

集合类型有三个迭代器方法：`entries, keys, values`，由于 Map 或 Set 类型本身部署了`Symbol.iterator`方法，因此它们可以使用`for...of`进行迭代。我们也可以调用迭代器函数取得迭代器对象后，手动调用迭代器对象的`next`方法获取对应的值。实际上`m[Symbol.iterator]`与`m.entries`是等价的。

当我们使用`for...of`循环迭代一个代理对象时，内部会试图从代理对象`p`上读取`p[Symbol.iterator]`属性，这个操作会触发 get 拦截函数。使用`for...of`循环迭代集合时，如果迭代产生的值也是可以被代理的，那么也应该将其包装成响应式数据。

```typescript
const mutableInstrumentations = {
	// 共用 iterationMethod
	[Symbol.iterator]: iterationMethod,
	entries: iterationMethod
}

function iterationMethod(this: any) {
  const target = this.raw
  const iterator = target[Symbol.iterator]()

  console.log(target)

  // wrap响应式包装
  const wrap = (val: any) => typeof val === 'object'  && val !== null ? reactive(val) : val

  track(target, ITERATE_KEY, "SIZE")

  if (target instanceof Map) {
    return {
      next() {
        const {value, done} = iterator.next()
        return {
          // 如果value不是undefined则进行wrap
          value: value ? [wrap(value[0]), wrap(value[1])] : value,
          done
        }
      }
    }
  } else if (target instanceof Set) {
    return {
      next() {
        const {value, done} = iterator.next()
        return {
          // 如果value不是undefined则进行wrap
          value: value ? wrap(value) : value,
          done
        }
      }
    }
  }
}

```

对于`entries`，**切勿把可迭代协议与迭代器协议搞混**。可迭代协议指的是一个对象实现了`Symbol.iterator`方法，而迭代器协议指的是一个对象实现了 next 方法。`p.entries`函数的返回值是一个对象，该对象带有`next`方法，但不具有`Symbol.iterator`方法。因此我们还需要在上面的抽象方法中返回一个`[Symbol.iterate]`：

```typescript
return {
  next() {
    const {value, done} = iterator.next()
    return {
      // 如果value不是undefined则进行wrap
      value: value ? wrap(value) : value,
      done
    }
  },
  [Symbol.iterator]() {
    return this
  }
}

```

> 一句话总结：在处理 Map 和 Set 的迭代时，使用代理对象时需要通过 `Symbol.iterator`触发 get 拦截，并确保迭代过程中产生的值是响应式的；同时，entries 返回的迭代器对象需要实现 `next` 方法和 `Symbol.iterator` 方法，以符合迭代器协议。
> 

`values`方法的实现与`entries`方法类似，不同的是，当使用`for...of`迭代`values`时，得到的仅仅是`Map`数据的值，而非键值对

```typescript
function valuesIterationMethod(this: any) {
  const target = this.raw
  let iterator: any = target.values()

  // wrap响应式包装
  const wrap = (val: any) => typeof val === 'object'  && val !== null ? reactive(val) : val

  track(target, ITERATE_KEY, "SIZE")

  return {
    next() {
      const {value, done} = iterator.next()
      return {
        // 如果value不是undefined则进行wrap
        value: wrap(value),
        done
      }
    },
    [Symbol.iterator]() {
      return this
    }
  }
```

而`keys`得到的是`Map`数据的键，我们只需在`iterationMethod`增加判断即可。但这里需要注意的是，如果我们将`Map`的新值赋给原有的键， 不应该触发副作用函数响应。我们对 Map 类型的数据进行了特殊处理。前文提到，即使操作类型为`SET`，也会触发那些与`ITERATE_KEY`相关联的副作用函数重新执行，这对于`values`或`entries`等方法来说是必需的，但对于`keys`方法来说则没有必要，因为`keys`方法只关心`Map`类型数据的键的变化，而不关心值的变化。

```typescript
const MAP_KEY_ITERATE_KEY = Symbol()

function keysIterationMethod(this: any) {
  const target = this.raw
  let iterator: any = target.keys()

  // wrap响应式包装
  const wrap = (val: any) => typeof val === 'object'  && val !== null ? reactive(val) : val

  track(target, MAP_KEY_ITERATE_KEY, "SIZE")

  return {
    next() {
      const {value, done} = iterator.next()
      return {
        // 如果value不是undefined则进行wrap
        value: wrap(value),
        done
      }
    },
    [Symbol.iterator]() {
      return this
    }
  }
}

```

由于我们在`trigger`中只针对`ITERATE_KEY`触发更新，更换标识后`set`方法就不会触发`keys`方法的更新了。

> 一句话总结：在实现 `Map` 的响应式代理时，`values` 和 `entries` 方法返回的值需要包装成响应式数据，而 `keys` 方法只关心键的变化，不需要触发副作用函数更新值，因此在处理 `keys` 方法时需要特别注意，避免触发不必要的更新。
> 

## `ref`

正如我们前面说的，由于Proxy实现的`reactive`只能劫持对象，无法代理原始值，因此想要将原始值变成响应式数据，就必须对其做一层包裹。我们可以封装一个函数，将包裹对象的创建工作都封装到该函数中。同时，我们还需要区分一个对象到底是原始值的包裹对象，还是一个非原始值的响应式数据。方法也很简单，使用`Object.defineProperty`为原始值的包裹对象添加标记即可：

```typescript

function (data) {
  const wrapper = {
    value: data
  }

  Object.defineProperty(wrapper, '_is_Ref_', {
    value: true
  })

  return reactive(wrapper)
}
```

### **响应丢失**

ref 除了能够用于原始值的响应式方案之外，还能用来解决响应丢失问题。在进行例如解构操作时，容易是返回了一个普通对象，它不具有任何响应式能力。把一个普通对象暴露到模板中使用，是不会在渲染函数与响应式数据之间建立响应联系的。换句话说，我们需要实现在副作用函数内，即使通过普通对象来访问属性值，也能够建立响应联系。

在之前的实现中，我们使用get等方法来拦截数据的读取操作。我们可以用类似的想法来实现通过普通对象来访问属性值的响应联系建立。

```typescript
function toRefs(obj: {[index: string | symbol]: any}, key: any): Ref<any> {
  const wrapper = {
    get value() {
      return obj[key]
    },
    set value(val) {
      obj[key] = val
    }
  }

  Object.defineProperty(wrapper, '_is_Ref_', {
    value: true
  })

  return wrapper
}
```

### 自动脱 ref

由于`toRefs`会把响应式数据的第一层属性值转换为 ref，因此必须通过 value 属性访问值。所谓自动脱 ref，指的是属性的访问行为，即如果读取的属性是一个`ref`，则直接将该`ref`对应的`value`属性值返回，要实现此功能，需要使用`Proxy`为`newObj`创建一个代理对象，通过代理来实现最终目标，这时就用到了上文中介绍的 ref 标识，即`_is_Ref_`属性。

实际上，我们在编写 Vue.js 组件时，组件中的`setup`函数所返回的数据会传递给`proxyRefs`函数进行处理，这也是为什么我们可以在模板直接访问一个 ref 的值，而无须通过`value`属性来访问。既然读取属性的值有自动脱 ref 的能力，对应地，设置属性的值也应该有自动为 ref 设置值的能力。

```typescript
export function proxyRef(target: any): any {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      // 如果读取的值是 ref，则返回它的 value 属性值
      return value._is_Ref_ ? value.value : value
    },

    set(target, key, newVal, receiver) {
      const value = target[key]
      if (value._is_Ref_) {
        value.value = newVal
        return true
      }
      return Reflect.set(target, key, newVal, receiver)
    }
  })
}
}
```

---

*感谢阅读！如果这篇文章对你有帮助，请不要忘记点赞和分享。*
