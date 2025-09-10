---
title: "Vue3 渲染器原理"
date: "2025-09-11"
category: "Vue 底层原理"
tags: ["Vue"]
summary: "简单介绍一些 Vue3 的渲染器实现原理"
author: "破酥"
readTime: "60min"
---

# Vue3 渲染器原理

这部分我们来介绍MVVM系统的渲染器部分。


渲染器是用来执行渲染任务的。在浏览器平台上，用它来渲染其中的真实 DOM 元素。渲染器不仅能够渲染真实 DOM 元素，它还是框架跨平台能力的关键。因此，在设计渲染器的时候一定要考虑好可自定义的能力。我们利用响应系统的能力，自动调用渲染器完成页面的渲染和更新，这个过程与渲染器的具体实现无关，仅仅设置了元素的`innerHTML`内容。


# 基本概念

- 渲染器`renderer`（注意render表示渲染这一动词）：渲染器的作用是把虚拟 DOM 渲染为特定平台上的真实元素。在浏览器平台上，渲染器会把虚拟 DOM 渲染为真实 DOM 元素。
- 虚拟DOM & 虚拟节点`vnode`：虚拟 DOM 和真实 DOM 的结构一样，都是由一个个虚拟节点组成的树型结构。
- 挂载`mount`：渲染器把虚拟 DOM 节点渲染为真实 DOM 节点的过程叫作挂载。
- 容器`container`：渲染器通常需要接收一个挂载点作为参数，用来指定具体的挂载位置。这里的“挂载点”其实就是一个DOM 元素，渲染器会把该 DOM 元素作为容器元素，并把内容渲染到其中，称为容器。

描述上述概念之间关系的代码如下：

```typescript
function createRenderer() {
	function render(vnode, container) {
        ...
    }
        
    return render
}
```

`createRenderer`函数用来创建一个**渲染器**。调用` createRenderer `函数会得到一个 render 函数，该`render`函数会以` container `为挂载点，将` vnode `渲染为真实 DOM并添加到该挂载点下。渲染器不仅包含` render `函数，还包含` hydrate `函数等。关于` hydrate `函数，介绍服务端渲染时会详细讲解。在 Vue.js 3 中，创建应用的` createApp `函数也是渲染器的一部分。

接下里我们可以调用` createRenderer `函数创建一个渲染器，接着调用渲染器的` renderer.render `函数执行渲染。当多次在同一个` container `上调用`renderer.render`函数进行渲染时，渲染器除了要执行挂载动作外，还要执行更新动作。

首次渲染时已经把` oldVNode `渲染到`container`内了，所以当再次调用` renderer.render `函数并尝试渲染` newVNode `时，就不能简单地执行挂载动作了。在这种情况下，渲染器会使用` newVNode `与上一次渲染的` oldVNode `进行比较，试图找到并更新变更点。这个过程叫作“打补丁”（或更新，patch），下面是`render`函数的基本实现：

```typescript
function createRenderer() {
  function render(vnode: VNode, container: Container) {
    if (vnode) {
      // 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // 旧 vnode 存在，且新 vnode 不存在，说明是卸载（unmount）操作
        // 只需要将 container 内的 DOM 清空即可
        container.innerHTML = ''
      }
    }

    container._vnode = vnode
  }

  return render
}
```

渲染过程：

```typescript
const renderer = createRenderer()

// 首次
renderer.render(vnode1, document.querySelector('#app'))
// 第二次
renderer.render(vnode2, document.querySelector('#app'))
// 第三次
renderer.render(null, document.querySelector('#app'))
```

- 首次渲染：渲染器会将` vnode1 `渲染为真实 DOM。渲染完成后，`vnode1`会存储到容器元素的` container._vnode `属性中，它会在后续渲染中作为旧` vnode `使用。
- 第二次渲染：旧` vnode `存在，此时渲染器会把` vnode2 `作为新` vnode`，并将新旧` vnode `一同传递给` patch `函数进行打补丁。
- 第三次渲染：新` vnode `的值为` null`，即什么都不渲染。但此时容器中渲染的是` vnode2 `所描述的内容，所以渲染器需要清空容器。从上面的代码中可以看出，我们使用`container.innerHTML = ''`来清空容器。需要注意的是，这样清空容器是有问题的，不过这里我们暂时使用它来达到目的。

`patch`函数是整个渲染器的核心入口，它承载了最重要的渲染逻辑。

- 第一个参数：旧` vnode`。
- 第二个参数：新` vnode`。
- 第三个参数` container`：容器。

在首次渲染时由于容器元素`_vnode`不存在，传递给 patch 函数的第一个参数` n1 `是` undefined`。这时，`patch`函数会执行挂载动作，它会忽略` n1`，并直接将` n2 `所描述的内容渲染到容器中。从这一点可以看出，`patch `函数不仅可以用来完成打补丁，也可以用来执行挂载。

# 自定义渲染器

我们将以浏览器作为渲染的目标平台，编写一个渲染器。

我们用下面的数据结果定义`VNode`：

```typescript
export interface VNode {

  type: string
  /**
   * 用于存放vnode的特性和属性
   */
  props: Record<symbol | string, any>
  children: string | Array<VNode>
  /**
   * DOM属性，可以是HTML元素容器，文本节点以及注释
   */
  el: Container | Text | Comment
  // 唯一标识
  key: string | number | symbol | undefined

}
```

接下来我们实现`patch`函数，结构如下：

```typescript
function patch(oldNode: VNode | undefined, newNode: VNode, container: Container) {
  // 如果不存在旧虚拟节点，则需要挂载，调用mountElement
  if (oldNode) {
    mountElement(newNode, container)
  } else {
    // 存在旧虚拟节点，更新
  }
}
```

我们先来看`mountElement`是如何挂载的：

```typescript
function mountElement(vnode: VNode, container: Container) {
  // 创建HTML元素
  const el: Container = document.createElement(vnode.type)
  
  // 挂载
  if (typeof vnode.children === 'string') {
    /* 如果子节点是字符串，则说明是文本节点 */
    el.textContent = vnode.children
  } 

  // 将元素添加到挂载点下
  container.appendChild(el)

}
```

首先调用` document.createElement `函数，以`vnode.type`的值作为标签名称创建新的 DOM 元素。接着处理`vnode.children`，如果它的值是字符串类型，则代表该元素具有文本子节点，这时只需要设置元素的` textContent `即可。最后调用`appendChild`函数将新创建的` DOM `元素添加到容器元素内。这样，我们就完成了一个` vnode `的挂载。

我们的目标是设计一个不依赖于浏览器平台的通用渲染器，因此我们需要将浏览器特有的 API 抽离。我们把用于操作 DOM 的 API 封装为一个对象，并把它传递给` createRenderer `函数。

```typescript
const renderer = createRenderer({
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementTest(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor)
    }
})


function createRenderer(options) {
    const {
        createElement,
        insert,
        setElementText
    } = options
    
    function mountElement() {}
    function patch() {}
    function render() {}
}
```

这样我们就可以从配置项中直接读取对应的API。

# 挂载和更新

## 子节点

一个元素除了具有文本子节点外，还可以包含其他元素子节点，并且子节点可以是很多个。当` vnode `含有标签属性`props`时，我们需要将这些属性渲染到真实DOM中。`HTML`标签有很多属性，其中有些属性是通用的，例如 id、class 等，而有些属性是特定元素才有的，例如` form `元素的` action `属性。修改`mountElement`函数：

```typescript
export function mountElement(vnode: VNode, container: Container) {
  // 创建HTML元素
  const el: Container = document.createElement(vnode.type)

  // 遍历props，将属性、事件添加到元素
  if (vnode.props) {
    for (const key in vnode.props) {
      /* 添加props到元素的属性、事件中 */
      patchProps(vnode, container, key)
    }

  }
  if (typeof vnode.children === 'string') {
    /* 如果子节点是字符串，则说明是文本节点*/
    el.textContent = vnode.children
  } else if (Array.isArray(vnode.children)) {
    /* 如果子节点是数组，则递归调用mountElement，遍历所有子节点 */
    vnode.children.forEach((child: VNode) => mountElement(child, el))
  } else {
    console.log("Wrong Type")
  }

  // 将元素添加到挂载点下
  container.appendChild(el)

}
```

`patchProps`用于挂载和更新 DOM 属性信息，我们针对不同的属性，逐步实现`patchProps`。在开始之前，我们先回顾一下`HTML Attrs`和`DOM Props`。

## 元素属性

`HTML Attributes`指的就是定义在 HTML 标签上的属性。当浏览器解析 HTML 代码后，会创建一个与之相符的 DOM 元素对象，我怕们可以用JS代码获取该 DOM 对象。这个 DOM 对象会包含很多属性（properties），这些属性就是所谓的 DOM Properties。很多` HTML Attributes `在 DOM 对象上有与之同名的` DOM Properties`，但两者除了名字不总相同外，并不是所有`HTML Attrs`都有对应的`DOM props`。类似地，也不是所有` DOM Properties `都有与之对应的` HTML Attributes`。

不是所有` HTML Attributes `与` DOM Properties `之间都是像`id`那样直接映射的关系。实际上，`HTML Attributes `的作用是设置与之对应的` DOM Properties `的**初始值**。一旦值改变，那么` DOM Properties `始终存储着当前值，而通过` getAttribute `函数得到的仍然是初始值。一个` HTML Attributes `可能关联多个` DOM Properties`。

我们只需要记住一个核心原则即可：`HTML Attributes`的作用是设置与之对应的` DOM Properties `的初始值。

无论是使用` setAttribute `函数，还是直接设置元素的` DOM Properties`，都存在缺陷。要彻底解决这个问题，我们只能做特殊处理，即优先设置元素的` DOM Properties`，但当值为空字符串时，要手动将值矫正为` true`。

```typescript
export function patchProps(vnode:VNode, el: Container, key: string) {
  // 判断是否存在对应的DOM props
  if (key in el) {
    // 获取HTML Attrs值
    const attributeValue = el.getAttribute(key)
    // 获取props值
    const propValue = vnode.props[key]
    // 如果是布尔类型，并且 value 是空字符串，则将值矫正为 true, 如disabled
    if (attributeValue === "" || propValue === "") {
      el.setAttribute(key, String(true))
    } else {
      el.setAttribute(key, propValue)
    }

  }
}
```

我们需要把属性的设置也变成与平台无关，因此需要把属性设置相关操作也提取到渲染器选项中。

```typescript
const renderer = createRenderer({
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementTest(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor)
    },
    patchProps(el, key, prevValue, nextValue) {
        ...
    }
})
```

## `class`

Vue中为元素设置`class`有很多种方法：

- `class="class1 class2"`，指定 class 为一个字符串值

  对应`vnode`：

  ```typescript
  const vnode = {
      type: 'div'
      props: {
      	class: 'class1 class2'
  	}
  }
  ```

- `:class="class1"`，指定 class 为一个对象

  对应`vnode`：

  ```typescript
  const class1 = { foo: true, bar: false }
  
  const vnode = {
      type: 'div'
      props: {
      	class: { foo: true, bar: false }
  	}
  }
  ```

- `:class="arr"`，指定 class 为一个数组

  对应`vnode`：

  ```typescript
  const class = [
      'class1',
      { foo: true, bar: false }
  ]
  
  const vnode = {
      type: 'div'
      props: {
      	class: [
              'class1',
              { foo: true, bar: false }
          ]
  	}
  }
  ```

因为 class 的值可以是多种类型，所以我们必须在设置元素的 class 之前将值归一化为统一的字符串形式，再把该字符串作为元素的 class 值去设置。我们简单实现`normalize`函数：

```typescript
function normalize(classSeries) {
  const className: Array<string> = []
  if (typeof classSeries == 'string') {
    return classSeries
  } else if (typeof classSeries === 'object' && !Array.isArray(classSeries)) {
    return normalizeObject(classSeries)
  } else if (Array.isArray(classSeries)) {
    return normalizeArray(classSeries)
  } else {
    console.error("class type should be string, object or array.")
    return
  }

  /**
   * 标准化对象
   * */
  function normalizeObject(classSeries: {[index: string | symbol]: boolean}) {
    const objectString: Array<string> = []
    Object.keys(classSeries).forEach((key: string | symbol) => {
      if (typeof classSeries[key] !== 'boolean') {
        console.error(`class value ${String(key)} must be a boolean.`)
        return false
      }
      if (classSeries[key]) {
        objectString.push(String(key))
      }

    })
    return objectString.join(" ")
  }

  /**
   * 标准化数组
   * */
  function normalizeArray(classSeries: Array<any>) {
    classSeries.forEach((item: any) => {
      if (typeof item === 'string') {
        className.push(item)
      } else if (typeof item === 'object') {
        if (normalizeObject(item)) {
          className.push(normalizeObject(item))
        }
      } else {
        console.error(`class value ${item} must be a string or object.`)
      }
      console.log(item, className)
    })

    return className.join(" ")
  }


}
```

我们知道，在浏览器中为一个元素设置 class 有三种方式，即使用`setAttribute`、`el.className`或`el.classList`。其中`el.className`的性能最优。在`patchProps`添加对应逻辑：

```typescript
if (attributeValue === "" || propValue === "") {
      el.setAttribute(key, String(true))
    } else if (key === 'class') {
      el.className = vnode.props[key]
    } else {
      el.setAttribute(key, propValue)
}
```

除了 class 属性之外，我们也需要对` style `做类似的处理，我们将在编译器部分用到这个函数。

## 卸载

卸载操作发生在更新阶段，更新指的是，在初次挂载完成之后，后续渲染会触发更新。首次挂载完成后，后续渲染时如果传递了 null 作为新` vnode`，则意味着什么都不渲染，这时我们需要卸载之前渲染的内容。

回顾之前的`render`函数，我们直接通过`innerHTML`清空容器，这么做是不严谨的：

- 容器的内容可能是由某个或多个组件渲染的，当卸载操作发生时，应该正确地调用这些组件的` beforeUnmount`、`unmounted`等生命周期函数。
- 即使内容不是由组件渲染的，有的元素存在自定义指令，我们应该在卸载操作发生时正确执行对应的指令钩子函数。
- 使用` innerHTML `清空容器元素内容的另一个缺陷是，它不会移除绑定在 DOM 元素上的事件处理函数。

正确的卸载方式是，根据` vnode `对象获取与其相关联的真实 DOM 元素，然后使用原生 DOM 操作方法将该 DOM 元素移除。为此，我们需要在` vnode `与真实 DOM 元素之间建立联系，修改`mountElement`：

```typescript
// 创建HTML元素，建立vnode与DOM之间的联系
const el: Container = vnode.el = document.createElement(vnode.type)
```

当卸载操作发生的时候，只需要根据虚拟节点对象` vnode.el `取得真实 DOM 元素，再将其从父元素中移除：

```typescript
function unmount(vnode) {
    const parent = vnode.el.parentNode
    if (parent) parent.removeChild(vnode.el)
}
```

在` unmount `函数内，我们有机会调用绑定在 DOM 元素上的指令钩子函数，例如` beforeUnmount`、`unmounted`等。当` unmount `函数执行时，我们有机会检测虚拟节点` vnode `的类型。如果该虚拟节点描述的是组件，则我们有机会调用组件相关的生命周期函数。

## 区分`vnode`

如果修改前后`vnode.type`属性的值不同，会造成新旧`vnode`所描述的内容不同，对于不同的元素来说，每个元素都有特有的属性。在这种情况下，正确的更新操作是，先将原元素卸载，再将新元素挂载到容器中。修改`patch`函数代码：

```typescript
function patch(oldNode, newNode, container) {
  // 如果旧节点存在，则对比新旧节点的type
  if (oldNode && oldNode.type !== newNode.type) {
    // 类型不同则卸载
    unmount(oldNode)
    oldNode = undefined
  }
    ...
}
```

即使新旧` vnode `描述的内容相同，我们仍然需要进一步确认它们的类型是否相同。我们知道，一个` vnode `可以用来描述普通标签，也可以用来描述组件，还可以用来描述` Fragment `等。对于不同类型的`vnode`，我们需要提供不同的挂载或打补丁的处理方式。所以，我们需要继续修改` patch `函数的代码以满足需求：

```typescript
// type是string类型，是普通元素
if (typeof type === 'string') {
    // 如果不存在旧虚拟节点，则需要挂载，调用mountElement
    if (!oldNode) {
      mountElement(newNode, container)
    } else {
      // 存在旧虚拟节点，更新
      patchElement(oldNode, newNode)

    }

  } else if (typeof type === 'object') {
    // type是object类型，是组件
}
```

## 事件处理

事件可以视作一种特殊的属性，因此我们可以约定，在` vnode.props `对象中，凡是以字符串` on `开头的属性都视作事件。将事件添加到 DOM 元素上只需要在` patchProps `中调用` addEventListener`函数来绑定事件即可：

```typescript
...

else if (/^on/.test(key)) {
  const event = key.substring(2).toLowerCase()
  // const invokers = el._invokers || (el._invokers = {})
  // let invoker: Invoker = invokers[event]
  el.addEventListener(event, () => {
    vnode.props[key]()
  })
} 

...
```

当事件更新时，我们绑定一个伪造的事件处理函数`invoker`，然后把真正的事件处理函数设置为` invoker.value`属性的值。这样当更新事件的时候，我们将不再需要调用`removeEventListener`函数来移除上一次绑定的事件，只需要更新`invoker.value`的值。我们还需要在同一个时刻缓存多个事件处理函数，所以我们需要用一个对象来存储所有的事件处理函数，否则将会出现事件覆盖的现象。这个对象的键值是事件名称，而值则是对应的事件处理函数。而对于同一事件的不同处理函数，我们用数组来存取：

```typescript
/* 事件处理 */
const eventName = key.substring(2).toLowerCase()
// 获取所有事件处理函数，如果不存在则新建一个
const invokers = el._invokers || (el._invokers = {})
let invoker: Invoker = invokers[eventName]

if(newVal) {
/* 如果invoker不存在，则初始化 */
if (!invoker) {
  // 将事件处理函数缓存到el._invokers
  invoker = el._invokers[eventName] = (event: Event) => {
    if (Array.isArray(invoker.value)) {
      // 如果 invoker.value 是数组，则遍历它并逐个调用事件处理函数
      invoker.value.forEach(fn => fn(event))
    } else {
      // 否则直接调用
      if (invoker.value) {
        invoker.value(event)
      }
    }
  }
  invoker.value = newVal
  el.addEventListener(eventName, invoker)
} else {
  // 有invoker直接更新
  invoker.value = newVal
}

} else if (invoker) {
  /* 如果没有新的事件绑定函数，移除原有事件监听 */
  el.removeEventListener(eventName, invoker)
}
```

### 事件冒泡与更新时机

我们来看一个小例子：

```typescript
const bol = ref(false)

watchEffect(() => {
    const vnode = {
        type = 'div',
        props: bol.value ? {
            onClick: () => {
                alert("parent clicked")
            }
    	} : {},
    	
    	children: [{
            type: 'p',
            props: {
                onClick: () => {
                    bol.value = true
                }
            },
            children: "text"
        }],          
    }
    
    // 渲染
    renderer.render(vnode, document.querySelector("#app"))
})
```

运行上面这段代码并点击` p `元素时，会发现父级` div `元素的` click `事件的事件处理函数竟然执行了，这其实与更新机制有关。

当点击 p 元素时，绑定到它身上的 click 事件处理函数会执行，于是` bol.value `的值被改为` true`。接下来的一步非常关键，由于`bol`是一个响应式数据，所以当它的值发生变化时，会触发副作用函数重新执行。由于此时的` bol.value `已经变成了` true`，所以在更新阶段，渲染器会为父级` div `元素绑定` click `事件处理函数。当更新完成之后，点击事件才从` p `元素冒泡到父级` div `元素。由于此时` div `元素已经绑定了` click `事件的处理函数，因此就发生了上述现象。

之所以会出现上述奇怪的现象，是因为更新操作发生在事件冒泡之前，即为 div 元素绑定事件处理函数发生在事件冒泡之前。

![](https://pic.imgdb.cn/item/66c710cdd9c307b7e9d42aec.png)

事件触发的时间要早于事件处理函数被绑定的时间。这意味着当一个事件触发时，目标元素上还没有绑定相关的事件处理函数，我们可以根据这个特点来解决问题：**屏蔽所有绑定时间晚于事件触发时间的事件处理函数的执行**。

我们为`invoker`增加一个事件处理函数绑定时间`attachTime`，如果绑定时间晚于事件发生时间，则不执行事件处理函数。

```typescript
if (!invoker) {
      // 将事件处理函数缓存到el._invokers
      invoker = el._invokers[eventName] = (event: Event) => {
        // timestamp是触发事件的时间戳，如果其早于事件处理函数的绑定事件，则不执行事件处理函数
        if (invoker.attachTime && e.timeStamp < invoker.attachTime) return

        if (Array.isArray(invoker.value)) {
          // 如果 invoker.value 是数组，则遍历它并逐个调用事件处理函数
          invoker.value.forEach(fn => fn(event))
        } else {
          // 否则直接调用
          if (invoker.value) {
            invoker.value(event)
          }
        }
      }
      invoker.value = newVal
      // 记录绑定时间
      invoker.attachTime = performance.now()
      el.addEventListener(eventName, invoker)
    } else {
      // 有invoker直接更新
      invoker.value = newVal
}
```

## 更新子节点

一个`vnode`的子节点可能有三种情况，那么当渲染器执行更新时，新旧子节点都分别是三种情况之一。

![](https://pic.imgdb.cn/item/66c71906d9c307b7e9db0246.png)

但落实到代码，我们会发现其实并不需要完全覆盖这九种可能。接下来实现`patchElement`。

```typescript
function patchElement(oldNode, newNode) {
  const el = newNode.el = oldNode.el as Container
  const oldProps = oldNode.props
  const newProps = newNode.props
  // 更新props
  for (const key in newProps) {
    if (newProps[key] !== oldProps[key]) {
      patchProps(el, key, oldProps[key], newProps[key])
    }
  }
  // 将旧Props中不存在于新Props中的属性去掉
  for (const key in oldProps) {
    if (!(key in newProps)) {
      patchProps(el, key, oldProps[key], null)
    }
  }

  // 更新子节点
  patchChild(oldNode, newNode, el)
}
```

更新子节点是对一个元素进行打补丁的最后一步操作。我们将它封装到` patchChildren `函数中，并将新旧`vnode`以及当前正在被打补丁的 DOM 元素` el `作为参数传递给它。新子节点是一组子节时处理涉及diff算法，我们会在后面实现，这里我们先用全部卸载和全部重新挂载来完成。

```typescript
function patchChild(oldNode, newNode, el) {
  /* 判断新子节点的类型是否为文字节点 */
  if (typeof newNode.children === 'string') {
    // 旧子节点的类型有三种：没有子节点、文本子节点、一组子节点
    // 当旧子节点为一组子节点时，才需要逐个卸载
    if (Array.isArray(oldNode.children)) {
      oldNode.children.forEach((child: VNode) => { unmount(child) })
    }

    // 最后将新的文本节点内容设置给容器元素
    el.textContent = newNode.children
  } else if (Array.isArray(newNode.children)) {
    /* 新子节点是一组子节点 */
    if (Array.isArray(oldNode.children)) {
      // 涉及到diff算法，暂时搁置
      oldNode.children.forEach((child: VNode) => { unmount(child) })
      newNode.children.forEach((child: VNode) => { patch(undefined, child, el) })
    } else {
      // 旧节点可能是没有子节点或文本子节点，清空容器并重新挂载新子节点
      el.textContent = ""
      newNode.children.forEach((child: VNode) => { patch(undefined, child, el) })

    }
  } else {
    if (Array.isArray(oldNode.children)) {
      // 没有新子节点的情况，直接卸载就可以了
      oldNode.children.forEach((child: VNode) => { unmount(child) })
    } else if (typeof oldNode.children === 'string') {
      // 文本节点的情况，直接清空
      el.textContent = ""
    }
  }
}
```

## 文本节点和注释节点

注释节点与文本节点不同于普通标签节点，它们不具有标签名称，这时候我们需要像实现响应式系统时处理`ownKeys`类似地人为创造一些唯一的标识，并将其作为注释节点和文本节点的 type 属性值。

```typescript
// 文本和注释的唯一标识
const Text = Symbol('Text')
const Comment = Symbol('Comment')

function patch(oldNode, newNode, container) {
  // 如果旧节点存在，则对比新旧节点的type
  if (oldNode && oldNode.type !== newNode.type) {
    // 类型不同则卸载
    unmount(oldNode)
    oldNode = undefined
  }
  const { type } = newNode
  // type是string类型，是普通元素
  if (typeof type === 'string') {
    // 如果不存在旧虚拟节点，则需要挂载，调用mountElement
    if (!oldNode) {
      mountElement(newNode, container)
    } else {
      // 存在旧虚拟节点，更新
      patchElement(oldNode, newNode)

    }

  } else if (typeof type === 'object') {
    // type是object类型，是组件
  } else if (type === Text) {
    // 文本节点
    if (!oldNode) {
      // 创建文本节点
      if (typeof newNode.children === 'string') {
        const el = newNode.el = document.createTextNode(newNode.children)
        container.appendChild(el)
      } else {
        console.error("Text children is not a string.")
      }
    }
  } else if (type === Comment) {
    // 文本节点
    if (!oldNode) {
      // 创建文本节点
      if (typeof newNode.children === 'string') {
        const el = newNode.el = document.createComment(newNode.children)
        container.appendChild(el)
      } else {
        console.error("Comment children is not a string.")
      }
    }
  }
}
```

## `Fragment`

`Fragment`（片断）是 Vue.js 3 中新增的一个` vnode `类型，用于实现多根节点模板（比如列表等）。与文本节点和注释节点类似，片段也没有所谓的标签名称，因此我们也需要为片段创建唯一标识，即 Fragment。

对于` Fragment `类型的` vnode `的来说，它的` children `存储的内容就是模板中所有根节点。有了` Fragment `后，我们就可以用它来描述` Items.vue `组件的模板了：

```vue
<!-- Items.vue -->
<template>
	<li>1</li>
    <li>2</li>
    <li>3</li>
</template>
```

对应虚拟节点：

```
const Fragment = Symbol()
const vnode = {
    type: Fragment,
    children: [
        { type: 'li', children: '1' },
        { type: 'li', children: '2' },
        { type: 'li', children: '3' },
    ]
}
```

同样的对于下面的模板：

```vue
<List>
	<Items />
</List>
```

对应虚拟节点：

```typescript
const vnode = {
    type: 'ul',
    children: [{
        type: Fragment,
        children: [
            { type: 'li', children: '1' },
            { type: 'li', children: '2' },
            { type: 'li', children: '3' },
        ]
    }]
}
```

当渲染器渲染 Fragment 类型的虚拟节点时，由于 Fragment 本身并不会渲染任何内容，所以渲染器只会渲染 Fragment 的子节点。`patch`函数：

```typescript
...
else if (type === 'Fragment') {
    // 旧节点不存在，挂载Fragment的子节点
    if (!oldNode) {
      if (typeof newNode.children !== 'string') {
        newNode.children.forEach((child: VNode) => {patch(undefined, child, container)})
      } else {
        console.error("Fragment children is not a vnode.")
      }  
    } else {
      // 旧节点存在，更新Fragment的子节点
      patchChild(oldNode, newNode, container)
    }
}
```

`unmount`函数也需要支持` Fragment `类型的虚拟节点的卸载：

```typescript
function unmount(vnode: VNode) {
  // 如果为Fragment，则卸载所有子节点
  if (vnode.type === "Fragment") {
    if (typeof vnode.children !== 'string') {
      vnode.children.forEach(child => unmount(child))
      return
    } else {
      console.error("Fragment children is not a vnode.")
    }
  }

  const parent = vnode.el.parentNode
  if (parent) parent.removeChild(vnode.el)
}
```

# 简单diff算法

当新旧节点的类型相同时，我们只需要修改更新过的内容，因此不需要删除和挂载操作。但新旧子节点数量未必相同，当新子节点组数量少于旧子节点组时，有些节点需要在更新后被卸载，同样的，如果新子节点组中存在旧子节点没有的节点时，也需要挂载新的节点。

```typescript
// 获取新旧子节点组的信息
const oldChildren = oldNode.children
const newChildren = newNode.children

const oldLen = oldChildren.length
const newLen = newChildren.length

// 获得新旧子节点组的共同长度
const commonLength = Math.min(oldLen, newLen)

if (Array.isArray(oldChildren)) {
  // 遍历commonLength次
  for (let i = 0; i < commonLength; i++) {
    patch(oldChildren[i], newChildren[i], el)
  }
  /* newLen > oldLen， 需要挂载新子节点 */
  if (newLen > oldLen) {
    for (let i = commonLength; i <= newLen; i++) {
      patch(undefined, newChildren[i], el)
    }
  } else if (newLen < newLen) {
    /* newLen < oldLen， 需要卸载旧子节点 */
    for (let i = commonLength; i <= oldLen; i++) {
      unmount(oldChildren[i])
    }
  }
}
```

## DOM复用

当我们遇到新子节点组相较于旧子节点组只是交换顺序时，我们就要用到`vnode`的唯一标识`key`来处理更新事件。只要两个虚拟节点的`type`属性值和` key `属性值都相同，那么我们就认为它们是相同的，即可以进行 DOM 的复用。

```typescript
// 遍历新旧节点，找出key相同的子节点
for (let i = 0 ; i < newLen; i++) {
  const newVNode = newChildren[i]
  for(let j = 0 ; j < oldLen; j++) {
    const oldVNode = oldChildren[j]
    if (newVNode === oldVNode) {
      // 找到相同节点，则先更新后跳出内循环
      patch(oldVNode, newVNode, el)
      break
    }
  }
}
```

接下来处理节点移动问题。每一次寻找可复用的节点时，都会记录该可复用节点在旧的一组子节点中的位置索引。把这些位置索引值按照先后顺序排列，如果顺序递增，则不需要移动任何节点，否则需要移动真实 DOM 。在旧` children `中寻找具有相同 key 值节点的过程中，记录遇到的最大索引值。如果在后续寻找的过程中，存在索引值比当前遇到的最大索引值还要小的节点，则意味着该节点需要移动。

![](https://pic.imgdb.cn/item/66c998ffd9c307b7e91553bb.png)

移动节点指的是移动一个虚拟节点所对应的真实 DOM 节点，并不是移动虚拟节点本身。在代码中，我们可以通过旧子节点的` vnode.el `属性取得它对应的真实 DOM 节点。`patchElement`函数首先将旧节点的` n1.el `属性赋值给新节点的` n2.el `属性。这个赋值语句的真正含义其实就是 DOM 元素的复用。我们知道，新 children 的顺序其实就是更新后真实 DOM 节点应有的顺序。

```typescript
// 存储遍历过程中遇到的最大索引
let lastIndex = 0
for (let i = 0 ; i < newLen; i++) {
  const newVNode = newChildren[i]
  for(let j = 0 ; j < oldLen; j++) {
    const oldVNode = oldChildren[j]
    if (newVNode === oldVNode) {
      // 找到相同节点，则先更新后跳出内循环
      patch(oldVNode, newVNode, el)
      if (j < lastIndex) {
        // 需要移动，先获取newVNode的前一个节点prevVNode
        const prevVNode = newChildren[i - 1]
        // 如果不存在prevNode说明是新子节点组第一个元素，则不需要移动，作为DOM树的第一个子节点来帮助定位
        if (prevVNode) {
          // 获取prevVNode对应真实DOM的下一个兄弟节点作为锚点，插入newVNode
          const anchor = prevVNode.el.nextSibling
          el.insertBefore(newVNode.el, anchor)
        }

      } else {
        // 更新最大索引
        lastIndex = j
      }
      break
    }
  }
}
```

## 添加新节点

对于新增节点，在更新时我们应该正确地将它挂载，这主要分为两步：

- 想办法找到新增节点
- 将新增节点挂载到正确位置

![](https://pic.imgdb.cn/item/66c9a05dd9c307b7e91c67db.png)

当遍历到新节点时，我们需要观察我们需要观察节点在新的一组子节点中的位置，获取新子节点组中新节点的前一个节点对应的DOM位置，并移动到该位置后即可。对于非新节点，操作与之前无异。

```typescript
let lastIndex = 0
for (let i = 0 ; i < newLen; i++) {
  const newVNode = newChildren[i]

  // 是否在旧子节点组中找到可复用的节点
  let found = false

  for(let j = 0 ; j < oldLen; j++) {
    const oldVNode = oldChildren[j]
    if (newVNode === oldVNode) {
      // 找到相同节点，则先更新后跳出内循环
      patch(oldVNode, newVNode, el)
      if (newVNode.key === oldVNode.key) {
        found = true
        patch(oldVNode, newVNode, el)
        if (j < lastIndex) {
          // 需要移动，先获取newVNode的前一个节点prevVNode
          const prevVNode = newChildren[i - 1]
          // 如果不存在prevNode说明是新子节点组第一个元素，则不需要移动，作为DOM树的第一个子节点来帮助定位
          if (prevVNode) {
            // 获取prevVNode对应真实DOM的下一个兄弟节点作为锚点，插入newVNode
            const anchor = prevVNode.el.nextSibling
            el.insertBefore(newVNode.el, anchor)
          }

        } else {
          // 更新最大索引
          lastIndex = j
        }
        break
      }
    }

    // 处理新节点
    if (!found) {
      // 同样获取prevVNode对应真实DOM的下一个兄弟节点作为锚点、
      const prevVNode = newChildren[i - 1]
      let anchor: ChildNode | null = null
      if (prevVNode) {
        anchor = prevVNode.el.nextSibling
      } else {
        // 没有prevVNode则说明是第一个节点，用容器元素的第一个子节点作为锚点
        anchor = el.firstChild
      }
      // 挂载
      patch(undefined, newVNode, el, anchor)
    }
  }
}
```

同时调整`patch`和`mountElement`以支持`anchor`参数：

```typescript
function patch(..., anchor) {
	...
    // 如果不存在旧虚拟节点，则需要挂载，调用mountElement
    if (!oldNode) {
		mountElement(newNode, container, anchor)
    } else {
      // 存在旧虚拟节点，更新
		patchElement(oldNode, newNode)

    }
    ...
}

function mountElement(..., anchor) {
    ...
    // 将元素添加到挂载点下
    if (anchor) {
    	container.insertBefore(el, anchor)
    }
    container.appendChild(el)
}
```

## 删除旧节点

渲染器应该能找到那些需要删除的节点并正确地将其删除。当基本的更新结束时，我们需要遍历旧的一组子节点，然后去新的一组子节点中寻找具有相同` key `值的节点。如果找不到，则说明应该删除该节点。

```typescript
function patchChild(...) {
  ...
  // 遍历旧子节点组删除不需要的节点
  for (let i = 0; i < oldLen ; i++) {
    const oldVNode = oldChildren[i] as VNode
    // 在新的子节点组中寻找相同key的节点
    const has = newChildren.find(child => child.key === oldVNode.key)

    // 没找到则卸载
    if (!has) {
      unmount(oldVNode)
    }
  }
  ... 
}
```

> 简单diff算法完整代码见：
>
> [CainHappyfish/vue-mvvm-domo at simple-diff-algorithm (github.com)](https://github.com/CainHappyfish/vue-mvvm-domo/tree/simple-diff-algorithm)

# 双端diff算法

双端 Diff 算法是一种同时对新旧两组子节点的两个端点进行比较的算法。因此，我们需要四个索引值，分别指向新旧两组子节点的端点。

![](https://pic.imgdb.cn/item/66c9ca38d9c307b7e9580e8d.png)

在双端比较中，每一轮比较都分为四个步骤：

- 比较旧子节点组的第一个节点和新子节点组的第一个子节点是否相同，相同复用，不相同不做处理
- 比较旧子节点组的最后一个节点和新子节点组的最后一个子节点是否相同，相同复用，不相同不做处理
- 比较旧子节点组的第一个节点和新子节点组的最后一个子节点是否相同，相同复用，不相同不做处理
- 比较新子节点组的第一个节点和旧子节点组的最后一个子节点是否相同，相同复用，不相同不做处理

我们按上面图示逐步实现基本的双端diff算法。

节点 p-4 原本是最后一个子节点，在新的顺序中，它变成了第一个子节点，将索引` oldEndIndex `指向的虚拟节点所对应的真实 DOM 移动到索引` oldStartIndex `指向的虚拟节点所对应的真实 DOM 前面。

![](https://pic.imgdb.cn/item/66c9ff22d9c307b7e9a97d6f.png)

- 比较旧的一组子节点中的头部节点 p-1 与新的一组子节点中的头部节点 p-2，由于两者的 key 值不同，不可复用，所以什么都不做。
- 比较旧的一组子节点中的尾部节点 p-3 与新的一组子节点中的尾部节点 p-3，两者的 key 值相同，可以复用。另外，由于两者都处于尾部，因此不需要对真实 DOM 进行移动操作，只需要打补丁即可。

![](https://pic.imgdb.cn/item/66ca0295d9c307b7e9acbb15.png)

- 比较旧的一组子节点中的头部节点 p-1 与新的一组子节点中的头部节点 p-2，比较旧的一组子节点中的尾部节点 p-2 与新的一组子节
  点中的尾部节点 p-1，由于两对节点对应的 key 值均不同，不可复用，因此什么都不做。
- 比较旧的一组子节点中的头部节点 p-1 与新的一组子节点中的尾部节点 p-1。两者的 key 值相同，可以复用。节点 p-1 原本是头部节点，但在新的顺序中，它变成了尾部节点，需要将节点 p-1 对应的真实 DOM 移动到旧的一组子节点的尾部节点 p-2 所对应的真实 DOM 后面，同时还需要更新相应的索引到下一个位置。

![](https://pic.imgdb.cn/item/66ca0374d9c307b7e9adb2a2.png)

比较旧的一组子节点中的头部节点 p-2 与新的一组子节点中的头部节点 p-2。发现两者 key 值相同，可以复用。但两者在新旧两组子节点中都是头部节点，因此不需要移动，只需要调用 patch 函数进行打补丁即可。

![](https://pic.imgdb.cn/item/66ca053cd9c307b7e9b38311.png)

至此，我们就完成了一次双端diff算法，完整代码如下：

```typescript
function patchKeyedChildren(oldNode: VNode, newNode: VNode, container: Container) {
  // 获取新旧子节点组的信息
  const oldChildren = oldNode.children
  const newChildren = newNode.children
  // 索引值
  let oldStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newStartIndex = 0
  let newEndIndex = newChildren.length - 1
  // 四个索引节点
  let oldStartNode = oldChildren[oldStartIndex] as VNode
  let oldEndNode = oldChildren[oldEndIndex] as VNode
  let newStartNode = newChildren[newStartIndex] as VNode
  let newEndNode = newChildren[newEndIndex] as VNode

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode.key === newStartNode.key) {
      // 仍处于头部，只需要更新
      patch(oldEndNode, newStartNode, container)
      // 更新完成后更新索引
      oldEndNode = oldChildren[++oldStartIndex] as VNode
      newEndNode = newChildren[++newStartIndex] as VNode
    } else if (oldEndNode.key === newEndNode.key) {
      // 仍处于末尾，只需要更新
      patch(oldEndNode, newStartNode, container)
      // 更新完成后更新索引
      oldEndNode = oldChildren[--oldEndIndex] as VNode
      newEndNode = newChildren[--newEndIndex] as VNode

    } else if (oldStartNode.key === newEndNode.key) {
      // 先更新节点
      patch(oldEndNode, newStartNode, container)
      // 移动DOM，将旧头部节点位置移动到旧尾部节点后
      container.insertBefore(oldStartNode.el, oldEndNode.el.nextSibling)

    } else if (oldEndNode.key === newStartNode.key) {
      // 先更新节点
      patch(oldEndNode, newStartNode, container)
      // 移动DOM，将旧尾部节点位置移动到旧头部节点前
      container.insertBefore(oldStartNode.el, oldEndNode.el)

      // 移动完成后更新索引
      oldEndNode = oldChildren[--oldEndIndex] as VNode
      newStartNode = newChildren[++newStartIndex] as VNode

    }
  }
}
```

## 非理想状态

![](https://pic.imgdb.cn/item/66ca0688d9c307b7e9b74d49.png)

当我们尝试按照双端 Diff 算法的思路进行第一轮比较时，会发现无法命中四个步骤中的任何一步。既然两个头部和两个尾部的四个节点中都没有可复用的节点，那么我们就尝试看看非头部、非尾部的节点能否复用。做法是用新的一组子节点中的头部节点去旧的一组子节点中寻找。找到后，将其移动当前旧的一组子节点的头部节点所对应的真实 DOM 节点之前。

![](https://pic.imgdb.cn/item/66ca088ad9c307b7e9b9393c.png)

代码如下：

```typescript
// 遍历旧子节点组，找到与新头部节点相同的子节点的索引
if (typeof oldChildren !== 'string') {
    const indexInOld = oldChildren.findIndex(child => child.key === newStartNode.key)

    // 大于0则说明找到对应节点，将其移动到头部
    if (indexInOld > 0) {
      const vnodeToMove = oldChildren[indexInOld]
      // 更新
      patch(vnodeToMove, newStartNode, container)
      // 移动到旧头部节点oldStartNode之前
      container.insertBefore(vnodeToMove.el, oldStartNode.el)
      // 设置indexInOld处的节点为undefined，更新索引
      oldChildren[indexInOld].key = undefined
      // 更新newStartIndex到下一个位置
      newStartNode = newChildren[++newStartIndex] as VNode

    }

}
```

完成后，新旧两组子节点以及真实 DOM 节点的状态如图，此时，真实 DOM 的顺序为：p-2、p-1、p-3、p-4。接着，双端 Diff 算法会继续进行：

![](https://pic.imgdb.cn/item/66ca0acfd9c307b7e9bb9391.png)

当我们遇到`undefined`节点时，说明该节点已经被处理过了，因此不需要再处理它了，直接跳过即可：

```typescript
...
else if (!oldStartNode.key) {
  oldStartNode = oldChildren[++oldStartIndex] as VNode
} else if (!oldEndNode.key) {
  oldEndNode = oldChildren[--oldEndIndex] as VNode
}
...
```

四个步骤重合了，进行最后一轮的比较。最后状态如图：

![](https://pic.imgdb.cn/item/66ca0be9d9c307b7e9bcab80.png)

## 添加新元素

当新子节点组中有旧子节点组不含有的新节点时，我们在旧的一组子节点找不到可复用的节点。

对于处于新子节点组头部的新节点且其他节点顺序与旧子节点组不相同的情况，我们只需将它挂载到当前头部节点之前即可。

![](https://pic.imgdb.cn/item/66ca0e78d9c307b7e9bf015f.png)

而对于其他节点顺序与旧子节点组相同的情况，我们先运行双端diff算法，得到的结果如下：

![](https://pic.imgdb.cn/item/66ca0f11d9c307b7e9bf8e30.png)

当这一轮更新完毕后，由于变量` oldStartIdx `的值大于` oldEndIdx `的值，满足更新停止的条件，因此更新停止。但节点 p-4 在整个更新过程中被遗漏了，没有得到任何处理。我们添加额外的处理，`while`循环结束后增加了一个` if `条件语句，检查四个索引值的情况。

```typescript
// 满足条件则说明遗漏新节点，需要挂载
if (oldEndIndex < oldStartIndex && newStartIndex < newEndIndex) {
  for (let i = newStartIndex; i < newEndIndex; i++) {
    patch(undefined, newChildren[i] as VNode, container, oldStartNode.el)
  }
}
```

## 删除旧节点

![](https://pic.imgdb.cn/item/66ca1060d9c307b7e9c0b34f.png)

在新的一组子节点中 p-2 节点已经不存在了。为了搞清楚应该如何处理节点被移除的情况，我们还是按照双端 Diff 算法的思路执行更新，执行结果如下：

![](https://pic.imgdb.cn/item/66ca1085d9c307b7e9c0d2fd.png)

此时变量` newStartIdx `的值大于变量` newEndIdx `的值，满足更新停止的条件，于是更新结束。与添加新元素同理，我们添加`if`条件处理：

```typescript
else if (newEndIndex < newStartIndex && oldStartIndex <= oldEndIndex) {
  // 满足条件则说明存在不需要的节点，需要卸载
  for (let i = oldStartIndex; i < newEndIndex; i++) {
    unmount(oldChildren[i] as VNode)
  }
}
```

至此我们完成了双端diff算法。

> 双端diff算法完整代码：
>
> [CainHappyfish/vue-mvvm-domo at double-end-diff-algorithm (github.com)](https://github.com/CainHappyfish/vue-mvvm-domo/tree/double-end-diff-algorithm)

# 快速diff算法

不同于简单 Diff 算法和双端 Diff 算法，快速 Diff 算法包含预处理步骤，这其实是借鉴了纯文本 Diff 算法的思路。在纯文本 Diff 算法中，存在对两段文本进行预处理的过程。这也称为快捷路径。如果两段文本全等，那么就无须进入核心  Diff 算法的步骤了。除此之外，预处理过程还会处理两段文本相同的前缀和后缀。假设有如下两段文本：

```text
TEXT1: I use vue for app development
TEXT2: I use react for app development
```

这两段文本的头部和尾部分别有一段相同的内容，对于内容相同的问题，是不需要进行核心 Diff 操作的。真正需要进行 Diff 操作的部分是：

```
TEXT1: vue
TEXT2: react
```

这么做的好处是，在特定情况下我们能够轻松地判断文本的插入和删除：

```
TEXT1： I like you
TEXT2： I like you too
```

预处理后的内容为

```
TEXT1： 
TEXT2： too
```

经过预处理后，TEXT1 的内容为空。这说明 TEXT2 在 TEXT1 的基础上增加了字符串 too。相反，我们还可以将这两段文本的位置互换，再次预处理后：

```typescript
TEXT1： too
TEXT2：
```

由此可知，TEXT2 是在 TEXT1 的基础上删除了字符串 too，快速 Diff 算法借鉴了纯文本 Diff 算法中预处理的步骤。

![](https://pic.imgdb.cn/item/66ca9355d9c307b7e95cc94d.png)

两组子节点具有相同的前置节点 p-1，以及相同的后置节点 p-2 和 p-3，对于相同的前置节点和后置节点，由于它们在新旧两组子节点中的相对位置不变，所以我们无须移动它们，但仍然需要在它们之间打补丁。

```typescript
function diff(oldNode: VNode, newNode: VNode, container: Container) {
  const oldChildren = oldNode.children
  const newChildren = newNode.children

  // 处理相同前置节点，索引j指向新旧两组子节点的开头
  let startIndex = 0
  let oldVNode = oldChildren[j] as VNode
  let newVNode = newChildren[j] as VNode

  // while循环向后遍历，直到不同key值的节点
  while (oldVNode.key === newVNode.key) {
    // 先更新
    patch(oldVNode, newVNode, container)
    // 更新索引j，让其递增
    startIndex++
    oldVNode = oldChildren[j] as VNode
    newVNode = newChildren[j] as VNode
  }



}

```

这一步前置节点更新完成后，目前状态如下：

![](https://pic.imgdb.cn/item/66ca967fd9c307b7e96202f8.png)

这里需要注意的是，当 while 循环终止时，索引 j 的值为 1。接下来，我们需要处理相同的后置节点。由于新旧两组子节点的数量可能不同，所以我们需要两个索引` newEnd `和` oldEnd`，分别指向新旧两组子节点中的最后一个节点。

![](https://pic.imgdb.cn/item/66ca96ded9c307b7e96257fb.png)

同样的，再开启一个 while 循环，并从后向前遍历这两组子节点，直到遇到 key 值不同的节点为止：

```typescript
function diff(oldNode: VNode, newNode: VNode, container: Container) {
  ...
  
  // 处理相同的后置节点，newEndIndex指向新子节点组的尾部，oldEndIndex指向旧子节点组的尾部
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1
  
  oldVNode = oldChildren[oldEndIndex] as VNode
  newVNode = newChildren[newEndIndex] as VNode
  
  // while循环向前遍历，直到不同key值的节点
  while(oldVNode.key === newVNode.key) {
    // 更新
    patch(oldVNode, newVNode, container)
    // 递减索引
    oldVNode = oldChildren[--oldEndIndex] as VNode
    newVNode = newChildren[--newEndIndex] as VNode
  }
  

}
```

后置节点更新完成后，状态如下：

![](https://pic.imgdb.cn/item/66ca9963d9c307b7e964875e.png)

## 添加新元素

当相同的前置节点和后置节点被处理完毕后，旧的一组子节点已经全部被处理了，而在新的一组子节点中，还遗留了一个未被处理的节点 p-4。其实不难发现，节点 p-4 是一个新增节点。此时`j <= newEnd && oldEnd < j`，说明在预处理过后，在新的一组子节点中，仍然有未被处理的节点，而这些遗留的节点将被视作新增节点。

![](https://pic.imgdb.cn/item/66ca9a98d9c307b7e965837e.png)

在新的一组子节点中，索引值处于` j `和` newEnd `之间的任何节点都需要作为新的子节点进行挂载。这就要求我们必须找到正确的锚点元素。我们可以发现，节点 p-2 对应的真实 DOM 节点就是挂载操作的锚点元素。（这里用旧子节点组`j`处的元素当锚点应该也是可以的）

```typescript
/* 处理新增节点 */
if (startIndex > oldEndIndex && startIndex <= newEndIndex) {
    // 获取锚点
    const anchorIndex = newEndIndex + 1
    const anchor = anchorIndex < newEndIndex ? newChildren[anchorIndex].el : null
    // 挂载每个新增节点
    for (let i = startIndex; i <= newEndIndex ; i++) {
      patch(undefined, newChildren[i] as VNode, container, anchor)
    }
}
```

## 删除旧节点

![](https://pic.imgdb.cn/item/66ca9e38d9c307b7e968c33c.png)

进行预处理，处理后的状态如图：

![](https://pic.imgdb.cn/item/66ca9e60d9c307b7e968f172.png)

当相同的前置节点和后置节点全部被处理完毕后，新的一组子节点已经全部被处理完毕了，而旧的一组子节点中遗留了一个节点 p-2 。这说明，应该卸载节点 p-2 。实际上，遗留的节点可能有多个。

![](https://pic.imgdb.cn/item/66ca9f05d9c307b7e96ab976.png)

索引` j `和索引` oldEnd `之间的任何节点都应该被卸载，与新增元素实现类似：

```typescript
else if (startIndex > newEndIndex && startIndex <= oldEndIndex) {
    /* 删除节点 */
    // 删除不需要的节点
    for (let i = startIndex; i <= oldEndIndex ; i++) {
      unmount(oldChildren[i] as VNode)
    }
}
```

## 移动DOM节点

![ ](https://pic.imgdb.cn/item/66caca24d9c307b7e99fca33.png)

与旧的一组子节点相比，新的一组子节点多出了一个新节点 p-7，少了一个节点 p-6。经过预处理后，无论是新的一组子节点，还是旧一组子节点，都有部分节点未经处理。接下来我们的任务就是，判断哪些节点需要移动，以及应该如何移动。在这种非理想的情况下，当相同的前置节点和后置节点被处理完毕后，索引` j`、`newEnd`和` oldEnd `不满足下面两个条件中的任何一个：

- `j > oldEnd && j <= newEnd`
- `j > newEnd && j <= oldEnd`

我们需要构造一个数组` source`，它的长度等于新的一组子节点在经过预处理之后剩余未处理节点的数量，并且` source `中每个元素的初始值都是 -1：

![](https://pic.imgdb.cn/item/66cb34a1d9c307b7e93140e2.png)`source`数组将用来存储新的一组子节点中的节点在旧的一组子节点中的位置索引，后面将会使用它计算出一个最长递增子序列，并用于辅助完成 DOM 移动的操作。`source`数组存储的是新子节点在旧的一组子节点中的位置索引，旧子节点组中没有新节点，于是保留原来的-1：

![](https://pic.imgdb.cn/item/66cbf7ffd9c307b7e906938b.png)

```typescript
else {
    // 构造source数组记录未处理的节点数
    const source = new Array(newEndIndex - startIndex + 1)
    source.fill(-1)

    // 遍历旧子节点组
    for (let i = startIndex; i <= oldEndIndex; i++) {
      const oldVNode = oldChildren[i] as VNode
      // 遍历新子节点组
      for (let j = startIndex ; j <= newEndIndex ; i++) {
        const newVNode = newChildren[j] as VNode
        // 找到可复用节点
        if (oldVNode.key === newVNode.key) {
          // 更新
          patch(oldVNode, newVNode, container)
          // 填充source
          source[j - startIndex] = i
        }
      }
    }

}
```

上述代码的时间复杂度为平方级别，处理较多节点时会带来性能问题，出于优化的目的，我们可以为新的一组子节点构建一张索引表，用来存储节点的 key 和节点位置索引之间的映射。

![](https://pic.imgdb.cn/item/66cc2dacd9c307b7e9464c87.png)

```typescript
// 构建索引表
const keyIndex = {}
for (let i = startIndex; i <= newEndIndex; i++) {
  const index = (newChildren[i] as VNode).key as string
  keyIndex[index] = i
}

// 遍历旧子节点组
for (let i = startIndex; i <= oldEndIndex; i++) {
  const oldVNode = oldChildren[i] as VNode
  // 通过索引表快速找到有相同key的新子节点
  if (oldVNode.key) {
    const j = keyIndex[oldVNode.key as string]

    if (typeof j !== 'undefined') {
      newVNode = newChildren[j] as VNode
      // 更新
      patch(oldVNode, newVNode, container)
      // 填充source
      source[j - startIndex] = i
    } else {
      // 未找到则删除节点
      unmount(oldVNode)
    }
  } else {
    console.error("key doesn't exist.")
  }

}
```

上述流程执行完毕后，`source`数组已经填充完毕了，接下来我们判断节点是否需要移动，方法与简单diff算法类似。除此之外，我们还需要一个数量标识，代表已经更新过的节点数量。我们知道，已经更新过的节点数量应该小于新的一组子节点中需要更新的节点数量。一旦前者超过后者，则说明有多余的节点，我们应该将它们卸载：

```typescript
// 构造source数组记录未处理的节点数
const count = newEndIndex - startIndex + 1
const source = new Array(count)
source.fill(-1)
// 是否需要移动
let moved = false
// 当前最大索引值
let lastIndex = 0

// 构建索引表
const keyIndex = {}
for (let i = startIndex; i <= newEndIndex; i++) {
  const index = (newChildren[i] as VNode).key as string
  keyIndex[index] = i
}

// 记录更新过的节点数
let patched = 0
// 遍历旧子节点组
for (let i = startIndex; i <= oldEndIndex; i++) {
  const oldVNode = oldChildren[i] as VNode
  // 通过索引表快速找到有相同key的新子节点
  if (oldVNode.key && patched <= count) {
    const j = keyIndex[oldVNode.key]

    if (typeof j !== 'undefined') {
      newVNode = newChildren[j] as VNode
      // 更新
      patch(oldVNode, newVNode, container)
      patched++
      // 填充source
      source[j - startIndex] = i

      // 判断是否需要移动
      if (j < lastIndex) {
        moved = true
      } else {
        lastIndex = j
      }
    } else {
      // 未找到则删除节点
      unmount(oldVNode)
    }
  } else {
    unmount(oldVNode)

    if (oldVNode.key) console.error("key doesn't exist.")
  }
}
```

那具体应该如何移动节点呢，我们根据` source `数组计算出一个最长递增子序列，用于 DOM 移动操作，下面是Vue的实现，采用了二分查找，返回最长递增子序列在` source `数组中对应的索引值：

```typescript
function getSequence(arr: Array<any>) {
  const predecessorIndices = arr.slice(); // 用于记录序列中每个元素的索引值，比如[3,11,24]对应[0,1,2]
  const sequenceIndices = [0]; // 用于存储最长递增子序列的元素索引
  let i: number, j: number, left: number, right: number, middle: number;
  const length = arr.length;

  // 遍历数组中的每个元素
  for (i = 0; i < length; i++) {
    const currentElement = arr[i];

    if (currentElement !== 0) {
      j = sequenceIndices[sequenceIndices.length - 1];

      // 如果当前元素大于序列中的最后一个元素
      if (arr[j] < currentElement) {
        predecessorIndices[i] = j; // 记录前一个元素的索引
        sequenceIndices.push(i); // 将当前元素的索引添加到序列中
        continue;
      }

      // 使用二分查找确定当前元素在序列中的插入位置
      left = 0;
      right = sequenceIndices.length - 1;
      while (left < right) {
        middle = ((left + right) / 2) | 0;
        if (arr[sequenceIndices[middle]] < currentElement) {
          left = middle + 1;
        } else {
          right = middle;
        }
      }

      // 如果需要，替换序列中的元素
      if (currentElement < arr[sequenceIndices[left]]) {
        if (left > 0) {
          predecessorIndices[i] = sequenceIndices[left - 1];
        }
        sequenceIndices[left] = i;
      }
    }
  }

  // 根据前驱索引重建最终递增子序列
  left = sequenceIndices.length;
  right = sequenceIndices[left - 1];
  while (left-- > 0) {
    sequenceIndices[left] = right;
    right = predecessorIndices[right];
  }

  return sequenceIndices;
}
```

有了最长递增子序列的索引信息后，下一步要重新对节点进行编号。最长递增子序列 seq 拥有一个非常重要的意义。以上例来说，子序列` seq `的值为 [0, 1]，它的含义是：在新的一组子节点中，重新编号后索引值为 0 和 1 的这两个节点在更新前后顺序没有发生变化。为了完成节点的移动，我们还需要创建两个索引值` i `和` s `，分别用于指向新的一组子节点中的最后一个节点和最长递增子序列中的最后一个元素：

![](https://pic.imgdb.cn/item/66cc4ab0d9c307b7e96df621.png)

逐个访问新的一组子节点中的节点，如果节点的索引` i `不等于` seq[s] `的值，则说明该节点对应的真实 DOM 需要移动，否则说明当前访问的节点不需要移动：

```typescript
 for (let i = newEnd; i >= 0 ; i--) {
        // 均为新节点，挂载
        // 在新子节点组中的绝对位置索引，并获取对应的节点
        const pos = i + startIndex
        const newVNode = newChildren[pos] as VNode
        // 该节点的下一个节点的位置索引
        const nextPos = pos + 1
        // 获取锚点
        const anchor = nextPos < newChildren.length
        ? (newChildren[nextPos] as VNode).el
        : null
        if (source[i] === -1) {
          // 挂载
          patch(undefined, newVNode, container, anchor)
        }
        if (i !== seq[seqEnd]) {
          // 如果节点的索引 i 不等于 seq[seqEnd] 的值，说明该节点需要移动
        } else {
          // 否则不需要移动， seqEnd指向下一个位置
          seqEnd--
        }
      }
```

循环执行一次后，结果如下：

![](https://pic.imgdb.cn/item/66cc45e8d9c307b7e9665d44.png)

接下来我们发现节点 p-2 需要移动：

```typescript
 for (let i = newEnd; i >= 0 ; i--) {
    // 均为新节点，挂载
    // 在新子节点组中的绝对位置索引，并获取对应的节点
    const pos = i + startIndex
    const newVNode = newChildren[pos] as VNode
    // 该节点的下一个节点的位置索引
    const nextPos = pos + 1
    // 获取锚点
    const anchor = nextPos < newChildren.length
    ? (newChildren[nextPos] as VNode).el
    : null
    if (source[i] === -1) {
      // 挂载
      patch(undefined, newVNode, container, anchor)
    }
    if (i !== seq[seqEnd]) {
      // 如果节点的索引 i 不等于 seq[seqEnd] 的值，说明该节点需要移动
      container.insertBefore(newVNode.el, anchor)
    } else {
      // 否则不需要移动， seqEnd指向下一个位置
      seqEnd--
    }
}
```

该轮循环结束，移动完成，当前状态如下：

![](https://pic.imgdb.cn/item/66cc555fd9c307b7e97b9265.png)此时我们不难发现 p-3 和 p-4 都不需要移动，且不是新的节点，在更新完成之后，循环将会停止，更新完成。

# 总结

这部分我们实现了MVVM的渲染器功能。渲染器的作用是把虚拟 DOM 渲染为特定平台上的真实元素，这里需要注意`render`和`renderer`的区别。虚拟 DOM 通常用英文 virtual DOM 来表达，有时会简写成` vdom `或` vnode`。渲染器会执行挂载和更新，对于新的元素，渲染器会将它挂载到容器内；对于新旧` vnode `都存在的情况，渲染器则会执行打补丁操作，即对比新旧` vnode`，只更新变化的内容。为了方便，我们目前只实现了在浏览器环境下的渲染器功能，在其他环境只需要将对应的操作换成该环境支持的方法即可。

接下来就是如何挂载子节点了。我们设计了`patch`更新函数，当发生更新时，会判断更新后的节点需要挂载、更新或卸载。存在新节点需要挂载，此时调用`mountElement`函数；当旧节点的内容需要更新时，则调用`patchElement`函数，该函数会更新元素的属性，并递归更新子节点；遇到新旧节点类型不同，则需要卸载旧节点再挂载新节点，此时需要调用`unmount`函数。

对于`mountElement`函数，我们需要将虚拟节点`vnode`的内容挂载到对应元素的属性和事件上，对于子节点，如果子节点是字符串，则说明是文本节点，直接将文本内容赋给`textContent`即可；对于子节点是数组，说明该节点存在DOM树，则递归调用`mountElement`，遍历所有子节点。

接下来就是`patchProps`函数了。`patchProps`用于挂载和更新 DOM 属性信息，我们需要注意`HTML attrs`和`DOM props`之间的一些差别，`HTML`标签有很多属性，其中有些属性是通用的，例如 id、class 等，而有些属性是特定元素才有的，例如`form`元素的`action`属性。不是所有`HTML Attributes`与`DOM Properties`之间都是像`id`那样直接映射的关系，`HTML Attributes `的作用是设置与之对应的`DOM Properties`的**初始值**。一旦值改变，那么`DOM Properties`始终存储着当前值，而通过`getAttribute`函数得到的仍然是初始值。一个`HTML Attributes`可能关联多个` DOM Properties`。遇到某些特定属性如`disabled`时，需要手动处理他们的值。

对于`class`和`style`属性，可能出现三种情况：

- 字符串值
- 对象
- 数组（字符串值+对象）

我们需要在设置元素的 class 之前将值归一化为统一的字符串形式。我们将在后续的编译器部分使用到该函数`normalize`。

接着看如何处理事件绑定。事件可以视作一种特殊的属性，因此我们可以约定，在`vnode.props`对象中，凡是以字符串`on`开头的属性都视作事件。将事件添加到 DOM 元素上只需要在`patchProps`中调用` addEventListener`函数来绑定事件即可。我们绑定一个伪造的事件处理函数`invoker`，然后把真正的事件处理函数设置为` invoker.value`属性的值。这样当更新事件的时候，我们将不再需要调用`removeEventListener`函数来移除上一次绑定的事件，只需要更新`invoker.value`的值。我们还需要在同一个时刻缓存多个事件处理函数，所以我们需要用一个对象来存储所有的事件处理函数，否则将会出现事件覆盖的现象。这个对象的键值是事件名称，而值则是对应的事件处理函数。而对于同一事件的不同处理函数，我们用数组来存取。

我们还要注意事件冒泡，不经处理，更新操作将会发生在事件冒泡之前。当一个事件触发时，目标元素上还没有绑定相关的事件处理函数，我们可以根据这个特点来解决问题：**屏蔽所有绑定时间晚于事件触发时间的事件处理函数的执行**。

卸载操作发生在更新阶段，更新指的是，在初次挂载完成之后，后续渲染会触发更新。首次挂载完成后，后续渲染时如果传递了 null 作为新` vnode`，则意味着什么都不渲染，这时我们需要卸载之前渲染的内容。这里我们不能直接使用`innerHTML = ''`来清空容器，这样做无法调用生命周期钩子和自定义指令，也不会移除绑定事件。我们应该根据`vnode`对象获取与其相关联的真实 DOM 元素，然后使用原生 DOM 操作方法将该 DOM 元素移除。

一个`vnode`的子节点可能没有子节点，也可能是文本/注释节点或一组子节点，那么当渲染器执行更新时，新旧子节点都分别是三种情况之一。更新时需要根据不同情况分别处理。注释节点与文本节点不同于普通标签节点，它们不具有标签名称，我们需要像人为创造一些唯一的标识。

对于`Fragment`类型的`vnode`的来说，它的`children`存储的内容就是模板中所有根节点。`Fragment`本身并不会渲染
任何 DOM 元素。所以，只需要渲染一个 Fragment 的所有子节点即可。

接下来就是`diff`算法了。首先我们需要了解DOM的复用：只要两个虚拟节点的`type`属性值和`key`属性值都相同，那么我们就认为它们是相同的，即可以进行 DOM 的复用。接下来处理节点移动问题。每一次寻找可复用的节点时，都会记录该可复用节点在旧的一组子节点中的位置索引。把这些位置索引值按照先后顺序排列，如果顺序递增，则不需要移动任何节点，否则需要移动真实 DOM 。我们在旧` children `中寻找具有相同 key 值节点的过程中记录遇到的最大索引值，如果在后续寻找的过程中，存在索引值比当前遇到的最大索引值还要小的节点，则意味着该节点需要移动。

对于新节点，我们需要观察我们需要观察节点在新的一组子节点中的位置，获取新子节点组中新节点的前一个节点对应的DOM位置，并移动到该位置后即可。对于多余的节点，当基本的更新结束时，我们需要遍历旧的一组子节点，然后去新的一组子节点中寻找具有相同 key 值的节点。如果找不到，则说明应该删除该节点。

以上是简单diff算法，主要介绍了diff算法的最基本思想。而双端 Diff 算法是一种同时对新旧两组子节点的两个端点进行比较的算法。因此，我们需要四个索引值，分别指向新旧两组子节点的端点。每一轮比较都分为四个步骤，在过程中通过特定条件判断是否需要添加或删除节点：

- 比较旧子节点组的第一个节点和新子节点组的第一个子节点是否相同，相同复用，不相同不做处理
- 比较旧子节点组的最后一个节点和新子节点组的最后一个子节点是否相同，相同复用，不相同不做处理
- 比较旧子节点组的第一个节点和新子节点组的最后一个子节点是否相同，相同复用，不相同不做处理
- 比较新子节点组的第一个节点和旧子节点组的最后一个子节点是否相同，相同复用，不相同不做处理

对于非理性状态的节点组，我们用新的一组子节点中的头部节点去旧的一组子节点中寻找。找到后，将其移动当前旧的一组子节点的头部节点所对应的真实 DOM 节点之前。

![](https://pic.imgdb.cn/item/66ca9963d9c307b7e964875e.png)

在Vue中，采用了快速diff算法，包含预处理步骤。如果节点相同，则不需进入核心 Diff 算法的步骤。除此之外，预处理过程还会处理新旧两组子节点相同的前缀节点和后缀节点。对于相同的前置节点和后置节点，由于它们在新旧两组子节点中的相对位置不变，所以我们无须移动它们，但仍然需要在它们之间打补丁。当满足`j <= newEnd && oldEnd < j`，则需要添加新节点；当满足`startIndex > newEndIndex && startIndex <= oldEndIndex`，则需要删除多余节点。

对于需要移动DOM的子节点组，我们需要构造一个数组` source`，它的长度等于新的一组子节点在经过预处理之后剩余未处理节点的数量，并且`source`中每个元素的初始值都是 -1。为了提高性能，我们为新的一组子节点构建一张索引表，用来存储节点的 key 和节点位置索引之间的映射。已经更新过的节点数量应该小于新的一组子节点中需要更新的节点数量。一旦前者超过后者，则说明有多余的节点，我们应该将它们卸载。移动元素的方法和上面简单diff算法相同。


