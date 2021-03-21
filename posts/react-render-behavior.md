---
title: '【深度】React渲染行为指南'
date: '2020-03-19'
---

## What is "Rendering"?

渲染是React要求你的组件根据当前的 `props` 和 `state` 组合，描述他们希望自己的UI部分现在是什么样子的过程。

### Rendering Process Overview

在渲染过程中，React将从组件树的根部开始，向下循环，以找到所有被标记为需要更新的组件。对于每个标记的组件，**React将调用`classComponentInstance.render()`（对于类组件）或 `FunctionComponent()`（对于函数组件），并保存渲染输出**

组件的渲染输出通常用JSX语法编写，然后在JS被编译并准备部署时转换为`React.createElement()`调用（React v17之后更改了JSX转换，不需要在使用JSX的地方强制导入React了）。createElement返回React element，这些元素是描述UI预期结构的普通JS对象。例如：

```jsx
// This JSX syntax:
return <SomeComponent a={42} b="testing">Text here</SomeComponent>

// is converted to this call:
return React.createElement(SomeComponent, {a: 42, b: "testing"}, "Text Here")

// and that becomes this element object:
{type: SomeComponent, props: {a: 42, b: "testing"}, children: ["Text Here"]}
```

在收集了整个组件树的渲染输出后，React会对新的**对象树**进行diff（经常被称为 "virtual DOM"），并收集所有需要应用的变化列表，以使真实的DOM看起来像当前所需的输出。这个差异和计算过程被称为 "`**Reconciliation**`"。

然后，React将所有计算出的变化以一个同步的顺序应用到DOM中（`commit`）

## Render and Commit Phases

React 中渲染分为两个阶段啊

- **Render 阶段**：渲染组件和计算变化的所有工作。
- **Commit 阶段**：将这些更改应用到DOM的过程

React在提交阶段更新了DOM后，它会相应地更新所有refs，以指向请求的DOM节点和组件实例。然后，它同步运行 componentDidMount 和 componentDidUpdate 类生命周期方法，以及 useLayoutEffect 钩子

然后，React会设置一个短暂的超时时间，当超时时间过后，就会运行所有的useEffect钩子。这一步也被称为 "Passive Effects "阶段。

[React Lifecycle Methods diagram](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)

React 声明周期执行顺序示意图

> 在React即将推出的 "Concurrent Mode "中，它能够暂停渲染阶段的工作，让浏览器处理事件。React将视情况恢复、扔掉或稍后重新计算该工作。一旦完成渲染传递，React仍将一步步同步运行commit phase。

我们需要理解的一个关键部分是"rendering "与 "更新DOM "不是一回事，一个组件可能会被rendering，而不会因此发生任何可见的变化。当React渲染一个组件时：

1. 组件可能会返回和上次一样的渲染输出，所以不需要做任何改变
2. 在Concurrent Mode下，React可能最终会多次渲染一个组件，但如果其他更新使当前正在进行的工作无效，则每次都会扔掉渲染输出

## How Does React Handle Renders?

### Queuing Renders（队列渲染）

在初始渲染完成后，**有几种不同的方法来告诉React排队重新渲染**。

- Class components:
    - this.setState()
    - This.forceUpdate()
- Function components
    - useState setters
    - useReducer dispatches
- 其他
    - 再次调用ReactDOM.render(<App>)（相当于在根组件上调用forceUpdate()）。

### Standard Render Behavior

首先要记住非常重要的一点

**React的默认行为是，当父组件渲染时，React会递归渲染其内部的所有子组件！这就是React的默认行为**

- 举个例子：假设我们有一个A > B > C > D的组件树，并且我们已经在页面上显示了它们。用户点击B中的一个按钮，使一个计数器递增。
    1. 我们在B中调用`setState()`，这将使B的重新渲染加入队列
    2. React从树的顶部开始渲染传递，React看到A没有被标记为需要更新，就跳过了
    3. React看到B被标记为需要更新，于是进行渲染。B像上次一样返回<C />
    4. C原本没有被标记为需要更新。但是，因为它的父级B渲染了，所以React现在向下移动，把C也渲染了。C再次返回<D />。D也没有被标记为需要渲染，但是因为它的父体C渲染了，所以React向下移动，也渲染了D

从这个例子我们可以看到：

1. 默认情况下，渲染一个组件会导致其内部的所有组件也被渲染!
2. 正常的渲染中，React并不关心 " Props 是否发生了变化"-它将无条件地渲染子组件，只是因为父组件渲染了！

现在，很可能 组件树 中的大部分组件都会返回与上次完全相同的渲染输出，因此React不需要对DOM做任何改变。但是，React仍然要做 render components 和 diff output 工作。这两项工作都需要时间和精力

但是：`rendering`并不是一件坏事-这是React知道是否需要真正对DOM进行任何修改的方法!

### Rules of React Rendering

- **React渲染的主要规则之一：渲染必须是 "pure"，无副作用的。**

    这可能会很棘手和令人困惑，因为许多副作用并不明显，也不会导致任何破坏。例如，严格来说，一个 `console.log()` 语句是一个副作用，但它实际上不会破坏任何东西。改变 `props`绝  对是一个副作用，而且它可能不会破坏任何东西。在渲染过程中进行AJAX调用也绝对是一个副作用，而且根据请求的类型，肯定会导致意外的应用行为。

一篇非常好的React文章：[**The Rules of React**](https://gist.github.com/sebmarkbage/75f0838967cd003cd7f9ab938eb1958f)

总结一下关键点：

- 渲染逻辑不能：
    1. 不能直接改变现有的变量和对象
    2. 不能像Math.random()或Date.now()那样创建随机值
    3. 无法进行网络请求
    4. 不能 queue state updates
- 渲染逻辑可以：
    - 改变 新创建的对象
    - 抛出错误
    - 缓存数据

## Component Metadata and Fibers

React存储了一个内部数据结构，用来跟踪应用中存在的所有当前组件实例。这个数据结构的核心部分是一个叫做 "**fiber** "的对象，它包含了元数据字段，包含

- 在组件树的这一点上，应该呈现的组件类型是什么？
- 当前与该组件相关的 props 和 state
- 指向父级、兄弟姐妹和子级组件的指针
- React用来跟踪渲染过程的其他内部元数据。

[戳这里看React 源码 Fiber 定义](https://github.com/facebook/react/blob/v17.0.0/packages/react-reconciler/src/ReactFiber.new.js#L47-L174)

Fiber 中存储的组件 props 和 state 实际就是你在组件中访问到的。（具体到实现上，类组件在执行前会执行 `componentInstance.props = newProps`）从这个角度看，组件就是 React fiber 对象的一个门面

同理 React Hooks 也是如此，React将一个组件的所有 Hooks 都存储为附加在该组件的fiber对象上的链接列表(linked list)，当React渲染一个函数组件时，它会从fiber中获取那个链接列表中对应的 `hook`（比如useReducer的 `state` 和 `dispatch`）

当父组件第一次渲染一个给定的子组件时，React会创建一个fiber对象来跟踪该组件的 "实例"。对于类组件来说，它从字面上调用`const instance = new YourComponentType(props)`并将实际的组件实例保存到fiber对象上。对于函数组件，React只是将`YourComponentType(props)`作为一个函数来调用。

## Component Types and Reconciliation

正如 "`Reconciliation` "文档页面中所描述的那样，React试图在重新渲染过程中提高效率，尽可能地重用现有的组件树和DOM结构。如果你要求React在树的同一位置渲染同一类型的组件或HTML节点，React会重用它，**如果合适的话只需应用更新，而不是从头开始重新创建**。这意味着，只要你一直要求React在同一个地方渲染该组件类型，React就会保持组件实例。对于类组件来说，它实际上确实**使用了你组件的同一个实际实例**。一个函数组件并没有像类那样真正的 "实例"，但我们可以认为<MyFunctionComponent />代表的是 这个正在这里显示并kept alive 的组件"实例"

那么，React是如何知道何时、怎样输出真正发生变化的呢？

1. React的渲染逻辑首先会**根据元素的类型字段进行比较，使用===引用比较**。如果某个位置的元素已经改变为不同的类型，比如从<div>变成了<span>，或者从<ComponentA>变成了<ComponentB>，React会假设整个树都发生了变化，从而加快比较过程。因此，React将销毁该整个现有的组件树部分，包括所有DOM节点，并使用新的组件实例从头开始重新创建。

这意味着，你绝对**不能在渲染时创建新的组件类型**! 每当你创建一个新的组件类型时，它都是一个不同的引用，这将导致React重复摧毁和重新创建子组件树。

```jsx
// 不要这么做
function ParentComponent() {
  // This creates a new `ChildComponent` reference every time!
  function ChildComponent() {}
  
  return <ChildComponent />
}

// 这样分开写
// This only creates one component type reference
function ChildComponent() {}
  
function ParentComponent() {

  return <ChildComponent />
}
```

## Keys and Reconciliation

React识别组件 "实例 "的另一种方式是通过`**key**`伪`prop`。key是React的一个指令，永远不会传递给实际的组件。React将`**key**`视为一个唯一的标识符，它可以用来区分组件类型的特定实例

- 我们使用`**key**`的主要地方是**渲染列表**，如果你渲染的数据可能会以某种方式改变，例如重新排序、添加或删除列表项，那么键在这里就显得尤为重要。特别重要的是，如果可能的话，**键应该是数据中的某种唯一ID**-只有在万不得已的情况下，才使用数组索引作为键。
- 除了列表之外，`**key**`对于**组件实例标识也很有用**。你可以在任何时候给任何React组件添加一个`**key**`来表明它的身份，改变这个`**key**`会导致React销毁旧的组件实例和DOM，并创建新的。一个常见的用例是列表+详细信息的表单组合，其中表单显示当前选定的列表项的数据。渲染<DetailForm key={[selectedItem.id](http://selecteditem.id/)}>将导致React在选定项目发生变化时销毁并重新创建表单，从而避免表单内部状态陈旧的问题

## Render Batching and Timing

默认情况下，每次调用`setState()`都会导致React启动一个新的 `render pass`，同步执行，然后返回。然而，React也会自动应用一种优化，即渲染批处理。渲染批处理是指对`setState()`的多次调用导致一个`render pass`被排队并执行，通常会有轻微的延迟。

React文档中提到 **"状态更新可能是异步的"（并不是真正的异步）**，这就是指这种渲染批处理行为。

React会自动对**React事件处理程序中发生的状态更新进行批处理**。由于React事件处理程序在一个典型的React应用中占了非常大的一部分代码，这意味着在一个给定的应用中，大部分的状态更新实际上是被批处理的。

[**源码点这里！**](https://github.com/facebook/react/blob/master/packages/react-dom/src/events/DOMPluginEventSystem.js#L633)

[**eventUpdate源码点这里！**](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1103)

React通过将事件处理程序包装在一个称为`unstable_batchedUpdates`的内部函数中，实现了事件处理程序的渲染批处理。React会在`unstable_batchedUpdates`运行时跟踪所有排队的状态更新，然后在之后的一次渲染中应用它们。对于事件处理程序来说，这很好用，因为React已经准确地知道一个给定事件需要调用哪些处理程序。

从概念上讲，你可以把React内部的工作想象成这样的伪代码：

```jsx
// PSEUDOCODE Not real, but kinda-sorta gives the idea
function internalHandleEvent(e) {
  const userProvidedEventHandler = findEventHandler(e);
  
  let batchedUpdates = [];
  
  unstable_batchedUpdates( () => {
    // any updates queued inside of here will be pushed into batchedUpdates
    userProvidedEventHandler(e);
  });
  
  renderWithQueuedStateUpdates(batchedUpdates);
}
```

然而，这意味着在**实际调用更新队列之外排队的任何状态更新将不会被一起批处理**。

```jsx
const [counter, setCounter] = useState(0);

const onClick = async () => {
  setCounter(0);
  setCounter(1);
  
  const data = await fetchSomeData();
  
  setCounter(2);
  setCounter(3);
}
```

这将执行三次渲染 (render pass)。第一次渲染 将把 setCounter(0) 和 setCounter(1) 批量在一起，因为它们都发生在原始事件处理程序调用堆栈(call stack)中，所以它们都发生在 unstable_batchedUpdates() 调用中。

但是，对setCounter(2)的调用是发生在一个 `await` 之后。这意味着原来的同步调用栈已经完成了，而函数的后半部分则在一个晚一点完全独立的事件循环调用栈中运行。正因为如此，React会作为setCounter(2)调用里面的最后一步，同步执行整个render pass，完成渲染后，然后从setCounter(2)返回。setCounter(3)也会发生同样的事情，因为它也是在原来的事件处理程序之外运行，即在批处理之外

在提交阶段的生命周期方法里面还有一些额外的边缘情况：componentDidMount、componentDidUpdate和useLayoutEffect。这些方法的存在主要是为了让你在渲染之后，但在浏览器还没有来得及绘制之前，执行额外的逻辑。例如：

- 第一次使用一些部分但不完整的数据来渲染一个组件。
- 在提交阶段的生命周期中，使用 refs 来测量页面中实际 DOM 节点的实际大小。
- 根据这些测量结果在组件中设置一些状态。
- 立即用更新的数据重新渲染

在这些场景中，我们根本不想让用户看到最初的 "部分 "渲染的UI-我们只想让 "最终 "的UI显示出来

最后执行队列中的 `useEffect` 回调

值得注意的是，`unstable_batchedUpdates` API是公开导出的，需要注意的是

- 根据名称，它被标记为 "不稳定"，并不是React API官方支持的一部分
- 另一方面，React团队曾表示，**它是“不稳定”的API中最稳定的**，Facebook一半的代码都依赖这个功能
- 与其他核心React API不同，它是由react包导出的，`unstable_batchedUpdates`是 reconciler 专用的API，不是react包的一部分。相反，它实际上是由 `react-dom` 和 `react-native` 导出的

在React即将推出的并发模式中，React将始终进行批量更新，所有时间，任何地方

## Render Behavior Edge Cases

React在开发中会对`<StrictMode>`标签里面的组件进行双重渲染。这意味着**你的渲染逻辑运行的次数与提交的渲染传递次数是不一样的**，你不能在渲染时依靠 console.log()语句来统计已经发生的渲染次数。相反，可以使用`React DevTools Profiler`来捕获跟踪并统计整体的提交渲染次数，或者在useEffect钩子或componentDidMount/Update生命周期里面添加日志记录。这样一来，只有当React真正完成了一个渲染传递并提交了它时，日志才会被打印出来。

在正常情况下，**你永远不应该在实际渲染逻辑中更新state**。换句话说，创建一个点击回调，在点击发生时调用setSomeState()是可以的，但你不应该在实际渲染行为中调用setSomeState()。

然而，有一个例外。**函数组件可以在渲染时直接调用setSomeState()，只要它是有条件地完成的**，而不是每次这个组件渲染时都要执行。这相当于类组件中的getDerivedStateFromProps。如果一个函数组件在渲染的时候更新state，React会立即应用状态更新，并同步重新渲染这一个组件，然后再继续执行。如果该组件无限地一直更新state并强迫React重新渲染，React将在设定的重试次数后打破循环并抛出错误（目前是50次尝试）。这个技术可以用来根据props的变化立即强制更新状态值，而不需要重新渲染+调用useEffect里面的setSomeState()。

## Improving Rendering Performance

虽然渲染是React工作的正常预期，但这种渲染工作有时也确实是 "浪费 "精力的。如果一个组件的渲染输出没有变化，DOM中的那部分内容也不需要更新，那么这个组件的渲染工作就真的有点浪费时间了

React组件的**渲染输出应该始终完全基于当前的`props`和当前的组件`state`**。因此，如果我们提前知道一个组件的`props`和`state`没有变化，我们也应该知道渲染输出会是一样的，这个组件不需要任何变化，我们可以放心地跳过渲染的工作。

一般来说，当试图提高软件性能时，有两种基本的方法.

1. 更快地完成同样的工作
2. 做更少的工作。

优化React渲染主要是通过在适当的时候跳过渲染组件来做更少的工作

### Component Render Optimization Techniques

React提供了三个主要的API，让我们有可能跳过渲染一个组件

1. `React.Component.shouldComponentUpdate` 

    一个可选的类组件生命周期方法，将在渲染过程的早期被调用。如果它返回false，React将跳过渲染组件。它可能包含任何你想用来计算该布尔结果的逻辑，但最常见的方法是检查组件的`props` 和 `state` 是否自上次以来发生了变化，如果没有变化则返回false

2. `React.PureComponent`

    由于那种`props`和`state`的比较是实现shouldComponentUpdate的最常见的方式，PureComponent基类默认实现了这种行为，可以用Component+shouldComponentUpdate来代替

3. `React.memo()`

    一个内置的 "高阶组件 "类型。它接受组件类型作为参数，并返回一个新的包装器组件。包装器组件的默认行为是检查是否有任何`props`发生了变化，如果没有，则防止重新渲染。函数组件和类组件都可以使用`React.memo()`进行包装。(可以传入一个自定义比较回调，但无论如何它确实只能比较新旧`props`，所以自定义比较回调的主要用例是只比较特定的`props`字段)

所有这些方法都使用一种叫做 "**`shallow equality`** "的比较技术。这意味着检查两个不同对象中的每一个单独的字段，并查看对象中是否有任何内容是不同的值。换句话说，obj1.a === obj2.a && obj1.b === obj2.b &&.........这通常是一个快速的过程，因为对于JS引擎来说，===的比较是非常简单的。所以，这三种方法做的相当于`const shouldRender = !showEqual(newProps, prevProps)`

还有一种不太为人所知的技术：如果**一个React组件在其渲染输出中返回的元素引用与上次完全相同，React将跳过重新渲染该特定children**。至少有几种方法可以实现这个技术

- 如果你在输出中包含了`props.children`，如果这个组件进行了状态更新，那么这个元素就是相同的
- 如果你用`useMemo()`包装一些元素，这些元素将保持不变，直到依赖关系发生变化为止
- **例如**

    ```jsx
    // The `props.children` content won't re-render if we update state
    function SomeProvider({children}) {
      const [counter, setCounter] = useState(0);

      return (
        <div>
          <button onClick={() => setCounter(counter + 1)}>Count: {counter}</button>
          <OtherChildComponent />
          {children}
        </div>
      )
    }

    function OptimizedParent() {
      const [counter1, setCounter1] = useState(0);
      const [counter2, setCounter2] = useState(0);

      const memoizedElement = useMemo(() => {
        // This element stays the same reference if counter 2 is updated,
        // so it won't re-render unless counter 1 changes
        return <ExpensiveChildComponent />
      }, [counter1]) ;

      return (
        <div>
          <button onClick={() => setCounter1(counter1 + 1)}>Counter 1: {counter1}</button>      
          <button onClick={() => setCounter1(counter2 + 1)}>Counter 2: {counter2}</button>
          {memoizedElement}
        </div>
      )
    }
    ```

对于所有这些技术来说，跳过渲染一个组件意味着React也将跳过渲染该整个子树，因为它实际上是把一个停止符挂起来，以停止默认的 "递归地渲染子树 "行为

### How New Props References Affect Render Optimizations

我们已经看到，默认情况下，React会重新渲染所有嵌套组件，即使它们的`props`没有改变。这也意味着，**将全新引用地址的 `props` 传递给子组件并不重要，因为无论你是否传递相同的`props`，它都会渲染**。

所以，下面这样的例子是完全可以的。

```jsx
function ParentComponent() {
    const onClick = () => {
      console.log("Button clicked")
    }
    
    const data = {a: 1, b: 2}
    
    return <NormalChildComponent onClick={onClick} data={data} />
}
```

每次`ParentComponent`渲染时，它将创建一个新的`onClick`函数引用和一个新的`data`对象引用，然后将它们作为`props`传递给`NormalChildComponent`。(请注意，不管我们是使用函数关键字还是作为箭头函数定义`onClick`，都没有关系-无论哪种方式都是一个新的函数引用)。

这也意味着没有必要通过将 "host components"（如<div>或<button>）包裹在React.memo()中来优化它们的渲染。在这些基本组件下面没有子组件，所以渲染过程无论如何都会停止在那里。

然而，如果子组件试图通过**检查`props`是否发生了变化来优化渲染，那么传递新的引用`props`将导致子组件渲染**。如果新的`props`引用实际上是新的数据，这是好的。然而，如果父组件只是传递了一个回调函数呢？

```jsx
const MemoizedChildComponent = React.memo(ChildComponent)

function ParentComponent() {
    const onClick = () => {
      console.log("Button clicked")
    }
    
    const data = {a: 1, b: 2}
    
    return <MemoizedChildComponent onClick={onClick} data={data} />
}
```

现在，每次`ParentComponent`渲染时，这些新的引用都会导致`MemoizedChildComponent`看到它的`props`值已经改变为新的引用，它将继续重新渲染......尽管`onClick`函数和数据对象每次都是相同的东西（重新渲染是一回事，如果你把这个每次引用都会变化的函数当做 `hooks` 依赖数组，那太棒了，你写了一个无限循环的程序）

分析上面这个例子我们可以发现

- `MemoizedChildComponent`总是会重新渲染 即使我们想跳过大部分时间的渲染工作
- 它所做的新旧`props`对比工作是白费力气的

类似地，请注意渲染`<MemoizedChild><OtherComponent></MemoizedChild>`也会强制子组件总是渲染，因为`props.children`总是一个新的引用

### Optimizing Props References

类组件不必担心意外地创建新的回调函数引用，因为它们可以拥有总是相同引用的实例方法。然而，它们可能需要为单独的子列表项生成唯一的回调，或者在匿名函数中捕获一个值并将其传递给子项。这些都会导致新的引用，在渲染时创建新的对象作为 `child props` 也是如此。React并没有内置任何东西来帮助优化这些情况

对于函数组件，React确实提供了两个 `hooks` 来帮助你重用相同的引用：`useMemo` 来处理任何类型的一般数据，比如创建对象或进行复杂的计算，`useCallback` 专门用于创建回调函数。

### Memoize Everything?

如上所述，你不必在你作为`props`传递下来的每一个函数或对象都使用`useMemo`和`useCallback`-只有当它会给子组件的行为带来差异时才会这样做。(**话虽如此，`useEffect`的依赖数组比较确实增加了另一个场景**，在这个场景中，子组件可能希望收到一致的`props`引用，这确实使事情变得更加复杂。)

另一个经常出现的问题是 "**为什么React不在默认情况下用React.memo()包裹一切？**"

**Dan Abramov**曾多次指出，[memo化确实还是会产生比较`props`的成本](https://twitter.com/dan_abramov/status/1095661142477811717)，而且有很多情况下，memo化检查永远无法防止重渲染，因为组件总是会收到新的props。

- 作为一个例子，[请看Dan的这个Twitter帖子](https://twitter.com/dan_abramov/status/1083897065263034368)。

    简单来说`memo`是有成本，大多数的`memo`都是无意义的，自然没有必要默认`memo`

但是社区任然存在很多争议，终归就是没有什么好的证据表明各自的观点

- 扩展阅读：[When should you NOT use React.memo?](https://github.com/facebook/react/issues/14463)

    **当你有 props.children 的时候，memo总是不会其效果**

### Immutability and Rerendering

**React中的状态更新应该始终保持`immutably`**。有两个主要原因

- 根据你突变的内容和位置，可能会导致组件在你预期的时间内无法render。
- 它造成了数据更新的时间和原因的混乱。

我们来看几个具体的例子

正如我们之前所说的，`React.memo` / `PureComponent` / `shouldComponentUpdate`都依赖于当前`props` 与之前`props`的浅比较。所以，我们的期望是，我们可以通过做`props.someValue !== prevProps.someValue`来知道一个`props`是否是一个新值。

如果你**突变（mutate）**了，那么`someValue`就是相同的引用，而这些组件将假定没有任何变化

请注意，这是专门当我们试图通过避免不必要的重新渲染来优化性能的时候。如果`props`没有改变，那么渲染就是 "不必要的 "或 "浪费的"。如果你**突变**了，组件可能会错误地认为什么都没变，然后你就会想为什么组件没有重新渲染

另一个问题是`useState`和`useReducer`hook。每次我调用`setCounter()`或`dispatch()`时，React都会将其加入渲染队列。然而，React要求任何`hook`的状态更新必须传递/返回一个新的引用作为新的状态值，无论是新的对象/数组引用，还是新的基础类型（string/number/等）

React会在渲染阶段应用所有的状态更新。当React试图从`hook`中应用状态更新时，它会检查新的值是否是同一个引用。React将始终完成更新队列的渲染。但是，如果该值与之前的引用相同，并且没有其他理由继续渲染（例如父组件已经渲染），React就会扔掉该组件的渲染结果，并完全退出渲染阶段。

所以，如果我对一个数组进行这样的突变。

```jsx
const [todos, setTodos] = useState(someTodosArray);

const onClick = () => {
  todos[3].completed = true;
  setTodos(todos);
}
```

那么该组件将无法重新渲染

从技术上讲，只有最外侧的引用必须是不可改变的更新。如果我们把这个例子改成：

```jsx
const onClick = () => {
  const newTodos = todos.slice();
  newTodos[3].completed = true;
  setTodos(newTodos);
}
```

那么我们已经创建了一个新的数组引用并将其传递进来，组件将重新渲染。

请注意，类组件`this.setState()`与函数组件`useState`和`useReducer` hook在突变和重渲染方面的行为有明显的不同。`this.setState()`根本不关心你是否突变-它总是完成重渲染。所以，这将重新渲染

```jsx
const {todos} = this.state;
todos[3].completed = true;
this.setState({todos});
```

而事实上，传入一个空对象，如`this.setState({})`也会如此。

除了所有实际的渲染行为之外，突变还为标准的React单向数据流引入了混乱。突变会导致其他代码看到不同的值，而预期是它们根本没有改变。这使得我们更难知道什么时候和为什么给定的一块状态实际上应该更新，或者变化来自哪里。

React以及React生态系统的其他部分，都假定了不可改变的更新。任何时候你突变，你都会有bug的风险。不要这样做。

### Measuring React Component Rendering Performance

使用`React DevTools Profiler`来查看每次提交中哪些组件在渲染。找出那些渲染出乎意料的组件，使用`DevTools`找出它们渲染的原因，并进行修复（也许可以通过将它们包装在`React.memo()`中，或者让父组件对其传递下来的`props`进行`memo`）

另外，请记住，React在开发构建中的运行速度要慢得多。你可以在开发模式下对你的应用进行剖析，看看哪些组件在渲染，以及为什么渲染，并做一些组件之间渲染所需相对时间的对比（"组件B在这次提交中的渲染时间是组件A的3倍"）。但是，千万不要用React开发构建来测量绝对的渲染时间-只能用生产构建来测量绝对时间! (否则Dan Abramov会因为你使用了不准确的数字而来骂你)。需要注意的是，生产环境的下使用`React DevTools Profiler` 需要使用特殊构建版本的react

## Context and Rendering Behavior

React的Context API是一种机制，它可以让一个用户提供的值提供给组件的子组件，给定的<MyContext.Provider>内的任何组件都可以从该context实例中读取该值，而不必通过每个组件显式地将该值作为`props`传递

Context不是一个 "状态管理 "工具。你必须自己管理传递到`Context`中的值。这通常是通过在React组件状态中保存数据，并根据这些数据构建 `Context value` 来完成的

### Context Basics

一个 Context Provider 接收一个单一的 value prop，比如 `<MyContext.Provider value={42}>`

子组件可以通过`context consumer` 提供渲染props来 获取 `context value`，比如:`<MyContext.Consumer>{ (value) => <div>{value}</div>}</MyContext.Consumer>`

或在函数组件中调用useContext钩子`const value = useContext(MyContext)`

### Updating Context Values

React 检查到 `context provider` 提供了一个新值并且是个新的引用，那么React就知道该值发生了变化，消耗该上下文的组件需要更新

请注意，向 `context provider` 传递一个新的对象会导致其更新

```jsx
function GrandchildComponent() {
    const value = useContext(MyContext);
    return <div>{value.a}</div>
}

function ChildComponent() {
    return <GrandchildComponent />
}

function ParentComponent() {
    const [a, setA] = useState(0);
    const [b, setB] = useState("text");

    const contextValue = {a, b};

    return (
      <MyContext.Provider value={contextValue}>
        <ChildComponent />
      </MyContext.Provider>
    )
}
```

在这个例子中，每次`ParentComponent`渲染时，React会注意到`MyContext.Provider`被赋予了一个新的值，并在继续向下循环时寻找消耗`MyContext`的组件。当一个`Context Provider`有了新的值，每一个消耗该`context`的嵌套组件都会被强制重新渲染。

### State Updates, Context, and Re-Renders

现在是时候把其中的一些碎片拼凑起来了。我们知道。

- 调用setState()会加入该组件的渲染队列
- React默认递归地渲染嵌套组件
- context provider 被渲染它们的组件赋予了一个值
- 来自于该父组件的状态的value

这意味着在默认情况下，任何`Context Provider`提供者的**父组件的状态更新都会导致其所有的子孙组件无论如何都会重新渲染，而不管它们是否读取了上下文值**！

如果我们回头看一下刚才的Parent/Child/Grandchild的例子，我们可以看到`GrandchildComponent`会重新渲染，但不是因为上下文更新，而是因为`ChildComponent`渲染了! 在这个例子中，没有什么试图优化掉 "不必要 "的渲染，所以React默认在任何时候`ParentComponent`渲染`ChildComponent`和`GrandchildComponent`。如果父组件在`MyContext.Provider`中放入一个新的上下文值，`GrandchildComponent`会在渲染时看到新的值并使用它，但上下文更新并没有导致`GrandchildComponent`渲染-无论如何都会发生。

### Context Updates and Render Optimizations

让我们修改一下这个例子

```jsx
function GreatGrandchildComponent() {
  return <div>Hi</div>
}

function GrandchildComponent() {
    const value = useContext(MyContext);
    return (
      <div>
        {value.a}
        <GreatGrandchildComponent />
      </div>
	)
}

function ChildComponent() {
    return <GrandchildComponent />
}

const MemoizedChildComponent = React.memo(ChildComponent);

function ParentComponent() {
    const [a, setA] = useState(0);
    const [b, setB] = useState("text");

    const contextValue = {a, b};

    return (
      <MyContext.Provider value={contextValue}>
        <MemoizedChildComponent />
      </MyContext.Provider>
    )
}
```

现在，如果我们调用setA(42)

- `ParentComponent`将`render`
- 一个新的`contextValue`引用被创建
- React看到`MyContext.Provider`有了一个新的`context value`，因此`MyContext`的任何消费者都需要更新
- React会尝试渲染`MemoizedChildComponent`，但看到它被`React.memo()`封装了。根本没有传递任何`props`，所以`props`实际上并没有改变。React会完全跳过渲染`ChildComponent`
- 不过，`MyContext.Provider`有一个更新，所以再往下可能会有组件需要知道这个情况
- React继续向下，到达`GrandchildComponent`。它看到`MyContext`被`GrandchildComponent`读取，因此它应该重新渲染，因为有一个新的`context value`。React继续重渲染`GrandchildComponent`，特别是因为`context`的变化
- 因为`GrandchildComponent`确实渲染了，React就会继续前进，也会渲染它里面的任何东西。所以，React也会重新渲染`GreatGrandchildComponent`

总之，正如 [Sophie Alpert](https://twitter.com/sophiebits/status/1228942768543686656) 说的：**在你的Context Provider下面的React组件可能应该使用React.memo**

这样一来，父组件中的状态更新就不会强制每个组件重新渲染，只是读取`context`的部分。(你也可以让`ParentComponent`渲染`<MyContext.Provider>{props.children}</MyContext.Provider>`，利用 "相同元素引用 "技术避免子组件重新渲染，然后再从一级向上渲染`<ParentComponent><ChildComponent></ParentComponent>`，得到基本相同的结果，这其实就是把 `ChildComponent` 移到了父组件层级来避免重复渲染)

但请注意，一旦`GrandchildComponent`基于下一个 `context value` 进行渲染，React就直接回到了递归重新渲染一切的默认行为。所以，`GreatGrandchildComponent`被渲染了，下面的其他任何东西也会被渲染

## React-Redux and Rendering Behavior

各种形式的 "context VS REDUX?!!!"似乎是我现在在React社区看到的被问得最多的一个问题。(这个问题首先是一个错误的二分法，因为Redux和Context是不同的工具，做着不同的事情)。

话说回来，当这个问题出现的时候，人们反复指出的一个问题就是 "React-Redux只重渲染真正需要渲染的组件，所以这就比context好"。

这话有点道理，但答案要比这细微得多。

### React-Redux Subscriptions

我看到很多人都在重复 "React-Redux里面使用上下文 "这句话。严格来说也是对的，但是React-Redux使用context来传递Redux存储实例，而不是当前状态值。这意味着我们总是随着时间的推移将相同的上下文值传递到我们的<ReactReduxContext.Provider>中

请记住，每当一个动作被派发时，Redux存储就会运行其所有的订阅者通知回调。需要使用Redux的UI层总是订阅Redux存储，在其订阅者回调中读取最新的状态，差异值，如果相关数据发生了变化，则强制重新渲染。订阅回调过程完全发生在React之外，只有当React-Redux知道特定的React组件所需要的数据发生了变化（基于mapState或useSelector的返回值）时，React才会介入。

这就导致了一套与上下文截然不同的性能特征。是的，很可能会有更少的组件一直在渲染，但React-Redux每次更新存储状态时，总是要为整个组件树运行mapState/useSelector函数。大多数时候，运行这些选择器的成本比React再做一次渲染的成本还要低，所以通常是净胜，但这是必须要做的工作。然而，如果这些选择器正在进行昂贵的转换，或者在不该返回新值的时候意外地返回新值，那就会拖慢事情的进程。

### Differences between connect and useSelector

connect是一个高阶组件。你传入自己的组件，connect会返回一个包装器组件，它完成所有的工作，包括订阅store、运行你的mapState和mapDispatch，以及将组合props传给你自己的组件。

connect包装器组件的作用一直等同于PureComponent/React.memo()，但强调的重点略有不同：只有当它传递给你的组件的组合props发生变化时，connect才会让你自己的组件渲染。通常情况下，最终的组合道具是{...ownProps，...stateProps，...dispatchProps}的组合，所以任何来自父组件的新props引用确实会使你的组件render，这和PureComponent或React.memo()一样。除了父级props，从mapState返回的任何新的引用也会导致你的组件渲染。由于你可以自定义 ownProps/stateProps/dispatchProps 的合并方式，所以也可以改变这种行为）。

另一方面，useSelector是一个hook，在你自己的函数组件内部被调用。正因为如此，当父组件渲染时，useSelector没有办法阻止你的组件渲染！

这就是`connect`和`useSelector`最大的差异，使用`connect`的话组件基本上等于`PureComponent`可以停止因为上层重新渲染导致必须要跟着重新渲染的问题。由于大部分的React-Redux应用程式会大量使用connect，意味着其实它们已经降低了渲染次数。

如果您只使用函数组件和useSelector。那么每当store变更时，比起connect的方式，很大的机会会重新渲染整个组件树

如果因为这样而产生性能的问题，那么解决办法就是使用`React.memo`来防止因为上层组件造成多余的重新渲染

## Summary

- React默认总是递归地渲染组件，所以当一个父组件渲染时，它的子组件也会渲染
- 渲染本身并没有问题-React就是这样知道需要对DOM进行哪些改动的
- 但是，渲染是需要时间的，在UI输出没有变化的情况下，"浪费的渲染 "也会增加
- 大多数情况下，传授回调函数和对象等新的引用是可以的
- 如果 props 没有变化，React.memo() 等API可以跳过不必要的渲染
- 但如果你总是把新的引用作为 props 传下来，React.memo() 就永远无法跳过渲染，所以你可能需要将这些值进行 memoize 处理
- Context主要是让深层的组件可以存取数据，而避免逐层传递props的问题
- Context.Provider的value比对是基于引用地址来判断是否需要更新
- 一个新的 context value 确实会迫使所有嵌套的消费者进行重新渲染
- 但大部分的情况造成重新渲染的其实是React的默认行为，就是上层组件更新导致的
- 所以你可能想在 `React.memo()` 中包裹 `context provider` 的子组件，或者使用`{props.children}`，这样当你更新 `context value` 的时候，整个树就不会一直渲染了
- 子组件如果有读取`Context value`，React会确保其正确的执行渲染
- React-Redux通过订阅store的方式来判断是否需要更新，而不是将state存在Context
- 订阅机制会在每次store更新时运作
- React-Redux 确保了只有在组件使用的 数据 发生变化才会重新渲染组件
- connect的行为跟React.memo很接近，因此大量使用connect可以最小化渲染次数
- useSelector是一个钩子，所以它不能阻止父组件引起的渲染。一个到处都有useSelector的应用可能应该在一些组件中添加React.memo()，以帮助避免组件一直层叠渲染

## Final Thoughts

虽然情况是很复杂的不能单纯说- Context 会造成所有东西重新渲染，Redux 不会，所以应该使用Redux。虽然我希望大家使用Redux 但我同时也希望大家可以清楚的明白这些运作机制，然后自己判断该使用什么。

由于大家老是在问“什么时候我该使用Context？什么使用我该使用Redux？那就让我们进一步汇整一些建议

- 使用Context
    - 您只是简单要传递 data 并且这些 data 不会频繁的变动
    - 如果有些状态或函数可能贯穿整个应用程式，而且深层的元件也需要存取
    - 您只想使用内建的功能
- 使用Redux
    - 应用程式有大量的状态需要处理
    - 状态很频繁的变更
    - 状态变更的逻辑很复杂
    - 多人维护的项目，项目具有中等或大型的代码库

请注意上面提到的都不是硬性的规则，只是简单的建议。请花点时间根据遭遇的问题，环境自行思考选择。希望这篇说明可以帮助您对于React 渲染的行为有更全面的理解

## Further Information

- **General**
    - [Dave Ceddia: A Visual Guide to References in JavaScript](https://daveceddia.com/javascript-references/)
- **React Render Behavior**
    - [React docs: Reconciliation](https://reactjs.org/docs/reconciliation.html)
    - [React lifecycle methods diagram](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)
    - [React hooks lifecycle diagram](https://github.com/donavon/hook-flow)
    - [React issues: bailing out of context and hooks](https://github.com/facebook/react/issues/14110)
    - [React issues: why `setState` is async](https://github.com/facebook/react/issues/11527#issuecomment-360199710)
    - [Seb Markbage: "Context is good for low-frequency updates, not Flux-like state propagation"](https://github.com/facebook/react/issues/14110#issuecomment-448074060)
    - [Ryan Florence: React, Inline Functions, and Performance](https://cdb.reacttraining.com/react-inline-functions-and-performance-bdff784f5578)
    - [James K Nelson: React context and performance](https://frontarm.com/james-k-nelson/react-context-performance/)
- **Optimizing Render Performance**
    - [React docs: Optimizing Performance](https://reactjs.org/docs/optimizing-performance.html)
    - [Kent C Dodds: Fix the slow render before you fix the re-render](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)
    - [Kent C Dodds: When to `useMemo` and `useCallback`](https://kentcdodds.com/blog/usememo-and-usecallback)
    - [Kent C Dodds: One simple trick to optimize React re-renders](https://kentcdodds.com/blog/optimize-react-re-renders)
    - [React issues: When should you NOT use React.memo?](https://github.com/facebook/react/issues/14463)
- **Profiling React Components**
    - [React docs: Introducing the React DevTools Profiler](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)
    - [React DevTools profiler interactive tutorial](https://react-devtools-tutorial.now.sh/)
    - [Kent C Dodds: Profile a React App for Performance](https://kentcdodds.com/blog/profile-a-react-app-for-performance)
    - [Shawn Wang: Using the React DevTools Profiler to Diagnose React App Performance Issues](https://www.netlify.com/blog/2018/08/29/using-the-react-devtools-profiler-to-diagnose-react-app-performance-issues/)
    - [Use the React Profiler for Performance](https://scotch.io/tutorials/use-the-react-profiler-for-performance)
- **React-Redux Performance**
    - [Practical Redux, Part 6: Connected Lists and Performance](https://blog.isquaredsoftware.com/2017/01/practical-redux-part-6-connected-lists-forms-and-performance/)
    - [Idiomatic Redux: The History and Implementation of React-Redux](https://blog.isquaredsoftware.com/2018/11/react-redux-history-implementation/)
    - [React-Redux docs: `mapState` Usage Guide - Performance](https://react-redux.js.org/using-react-redux/connect-mapstate#mapstatetoprops-and-performance)
    - [High-Performance Redux](http://somebody32.github.io/high-performance-redux/)
    - [React-Redux links: React/Redux Performance](https://github.com/markerikson/react-redux-links/blob/master/react-performance.md)