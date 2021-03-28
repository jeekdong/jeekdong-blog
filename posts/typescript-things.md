---
title: 'TypeScript 那些事'
date: '2021-01-07'
---

## 前言

![top_languages](https://files.jeekdong.cn/manual/20210323215628.png)

Github近几年编程语言趋势榜，TypeScript增长快速

近年来，TypeScript在前端社区中的发展迅速，越来越多的开源项目投身TypeScript中，不管项目中是否使用TypeScript，了解TypeScript已经是前端必会的技能点了。作为长期习惯了动态类型语言的前端开发者，初上手TypeScript或多或少都会遇到一些问题

本文不会从所有基础讲解TS相关概念（最好你已经有一些TS的基础知识，[官方文档](https://www.typescriptlang.org/docs/handbook/intro.html)），主要探讨一些在平时实践中可能遇到的问题和一些高级用法

## TS是什么

- JavaScript的超集
- 编译期行为
- 不引入额外开销，不改变运行时行为
- 始终与 ECMAScript 语言标准一致 (stage 3语法)

TypeScript = Type + (ECMA)Script ，在TS语言早期有一些扩展运行时代码语义的语法（如：enum、namespace等）这些都未被标准ECMAScript语法所支持，与使用TypeScript 不侵入运行时的宗旨不符，一般不建议使用

## 为什么用

- 可维护性（良好的标注和类型，几乎相当于文档，增加了代码维护性）
- 确保运行时质量，减少代码错误（编译或编辑时及时的代码提示减少写出错误代码的概率）
- 提升开发效率

提升开发效率，可能很多人会有不同的意见，觉得写了TS反而是负担。但实际没有TS时，假如别人写了非常复杂的通用组件，缺乏文档的情况下，你需要对照代码查看所需传入的属性(props)和类型，组件修改了属性，往往需要运行时才能发现报错，都会降低开发效率增加开发负担

## 令人困扰的使用现状

在项目中开始使用TypeScript很简单，可是越来越多的人开始抱怨使用的各种问题

- 代码代码提示并不智能，似乎只能显式的定义类型，才能有代码提示。
- 各种各样的类型报错苦不堪言，本以为听信网上说 `TypeScript` 可以提高代码可维护性，结果却发现徒增了不少开发负担。
- 显式地定义所有的类型似乎能应付大部分常见，但遇到有些复杂的情况却发现无能为力，只能含恨写下若干的 `as any` 默默等待代码 `review` 时的公开处刑

接下来我们从基础类型开始了解TypeScript

## type or interface

初上手时，最令人困惑的是，`type`和`interface`，二者功能相近

具体什么时候用`interface`呢，什么时候用`type`呢

**相同点：**

- 都可以描述一个对象或者函数

    ```tsx
    interface User {
      name: string
      age: number
    }

    interface SetUser {
      (name: string, age: number): void;
    }

    type User = {
      name: string
      age: number
    };

    type SetUser = (name: string, age: number) => void;
    ```

- 拓展（extends）与交叉类型（Intersection Types）

    interface 可以 extends， 但 type 是不允许 extends 和 implement 的，但是 type却可以通过交叉类型 实现 interface 的 extend 行为，**并且两者并不是相互独立的，也就是说 interface 可以 extends type, type 也可以 与 interface 类型 交叉**

    ```tsx
    // interface extends type
    type Name = { 
      name: string; 
    }
    interface User extends Name { 
      age: number; 
    }

    // type & interface
    interface Name { 
      name: string; 
    }
    type User = Name & { 
      age: number; 
    }
    ```

**不同点：**

- type 可以而 interface 不行
    - type 可以声明基本类型别名，联合类型，元组等类型

        ```tsx
        // 基本类型别名
        type Name = string

        // 联合类型
        interface Dog {
            wong();
        }
        interface Cat {
            miao();
        }

        type Pet = Dog | Cat

        // 具体定义数组每个位置的类型（元祖）
        type PetList = [Dog, Pet]
        ```

    - type 语句中还可以使用 typeof 获取实例的 类型进行赋值
    - 更加复杂的类型操作

        ```tsx
        type Tuple = [number, string];
        const a: Tuple = [2, 'sir'];
        type Size = 'small' | 'default' | 'big' | number;
        const b: Size = 24;
        ```

- interface可以而type不行
    - 自动聚合

        ```tsx
        interface User {
          name: string
          age: number
        }

        interface User {
          sex: string
        }

        /*
        User 接口为 {
          name: string
          age: number
          sex: string 
        }
        */
        ```

    - ~~扩展函数的属性~~

        ```tsx
        // 这里不对
        // interface FuncWithAttachment {
        //     (param: string): boolean;
        //     someProperty: number;
        // }

        // const testFunc: FuncWithAttachment = ...;
        // // 有类型提醒
        // const result = testFunc('mike');
        // // 有类型提醒
        // testFunc.someProperty = 3;
        ```

**怎么用：**

从语义上来说，type为类型别名，并不会实际产生新的类型

[官方](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-aliases)推荐能用interface实现尽量用interface实现，在interface无法实现时，再考虑type

## 基本类型

number、boolean、string、function、array、tuple、enum、

null、undefined、any、void、never、object、

字面量（true，false，1，2，‘a’）等

这里主要探讨几个TS中特殊的类型

### `void`

跟any有点相反，不代表任何类型，只有null和undefined可以赋值给它们

### `never`

- 表示绝对不会发生的类型，any也不能赋值给它
- never 是 | 运算的[幺元(单位元)](https://zh.wikipedia.org/wiki/%E5%96%AE%E4%BD%8D%E5%85%83)，即 x | never = x。这个特性在类型编程中有很好的运用方式，比如`Exclude<Result, string>`，作用是从类型T中剔除U中的属性。涉及了一些泛型和关键字，后文也会讲到，大致理解思路就是，通过将不需要属性先变为never再取联合类型就只剩下需要的了

    ```tsx
    type Exclude<T, U> = T extends U ? never : T;
    ```

- 一个never应用的例子：[来源](https://www.zhihu.com/question/354601204/answer/888551021)

    通过`never`来确保 handleValue 函数的switch把所有类型变量都遍历了

    ```tsx
    interface Foo {
      type: 'foo'
    }

    interface Bar {
      type: 'bar'
    }

    type All = Foo | Bar

    function handleValue(val: All) {
      switch (val.type) {
        case 'foo':
          // 这里 val 被收窄为 Foo
          break
        case 'bar':
          // val 在这里是 Bar
          break
        default:
          // val 在这里是 never
          const exhaustiveCheck: never = val
          break
      }
    }
    ```

### `**unknown**`

- `unknown` 字面理解和 `any` 很像，任何类型都可赋值给它，但有一点，`unknown` 类型不能赋值给除了 `unknown` 或 `any` 的其他任何类型，**使用前必需显式进行指定类型**，或是在有条件判断情况下能够隐式地进行类型推断的情况。
- 交叉类型(`&`)不起作用，联合类型(`|`)起绝对作用，跟`never`正好相反
- `unknown` 用于变量类型不确定，但肯定可以确定的情形下，比如下面这个示例中，入参总归会有个值，根据这个值的类型进行不同的处理，这里使用 `unknown` 替代 `any` 则会更加类型安全

    ```tsx
    function prettyPrint(x: unknown): string {
      if (Array.isArray(x)) {
        return "[" + x.map(prettyPrint).join(", ") + "]"
      }
      if (typeof x === "string") {
        return `"${x}"`
      }
      if (typeof x === "number") {
        return String(x)
      } 
      return "etc."
    }
    ```

### **如何声明对象?**

声明一个确定属性的对象或许是容易的，使用type/interface即可，如果声明一个不确定的对象呢？

我们可能会这么写：

```tsx
const iNeedObject1 = (a: object) => {
  console.log(a)
}
const iNeedObject2 = (a: Object) => {
  console.log(a)
}
const iNeedObject3 = (a: {}) => {
  console.log(a)
}
```

实际调用我们发现除了第一个正确校验了非对象参数，其他居然都通过了，这结果似乎和我们预期的结果不太一样，那我们好好看看这几个基础类型有什么不同

```jsx
iNeedObject1('1') // 😄 正确提示了错误: Argument of type 'string' is not assignable to parameter of type 'object'.(2345)
iNeedObject2('1') // 🤔 未报错
iNeedObject3('1') // 🤔 未报错
```

**object**

- obejct是一个代表非原生类型的类型，即任何不是number、string、boolean、bigint、symbol、null或undefined的类型
- 可以使用在 Object 类型上定义的所有属性和方法，这些属性和方法可通过 JavaScript 的原型链隐式地使用，但是不会有编辑器的提示

```tsx
const iNeedObject = (a: object) => {
  console.log(a)
}

iNeedObject({a:1}) // OK
iNeedObject('a') // 报错：类型“string”的参数不能赋给类型“object”的参数
```

**Object**

- 类型是所有 `Object` 类的实例的类型
- 在TS中通过接口定义了Object.prototype 原型对象上的属性，因此你调用原型上的方法你会获得编辑器的提示
- Object 包括原始值，我们知道JS引擎中会自动隐式进行装箱和拆箱，这样我们在基本类型中也能调用属性和方法，因此也会包含Object类型中所定义的结构，装箱之后的类型自然也是属于Object类型
- 使用Object声明的对象，与原型属性类型不能冲突

**空对象类型{}**

- 它描述了一个没有成员的对象。当你试图访问这样一个对象的任意属性时，TypeScript 会产生一个编译时错误
- 仍然可以使用在 Object 类型上定义的所有属性和方法，这些属性和方法可通过 JavaScript 的原型链隐式地使用
- 同样包括原始值

上面三种声明对象的方式都无法访问对象的属性，如果我们需要声明一个包含任意属性的对象呢？比如下面这个例子

```jsx
function filterEmptyValue (obj: object) {
  let filteredObj = { ...obj }
  Object.keys(filteredObj).forEach((key: string) => {
    // ❌ 类型为 "string" 的表达式不能用于索引类型 "{}"
    if (filteredObj[key] === '') {
      delete filteredObj[key]
    }
  })
  return filteredObj
}
```

### 索引类型

解决上面的问题，答案就是使用索引类型

```tsx
// 可索引的类型
interface LooseObj {
  [key: string]: any
}
```

`Typescript`支持两种索引签名:字符串和数字。 可以同时使用两种类型的索引,但是数字索引的返回值必须是字符串索引返回值类型的子类型。 这是因为当使用 number 来索引时,JavaScript会将它转换成 string 然后再去索引对象

### 额外属性检查(excess property check)

首先看一个例子

```jsx
interface Type1Item {
  a: number;
}

interface Type2Item {
  a: number;
  b: number;
}

let vtype1: Type1Item = {a: 1}
let vtype2: Type2Item = {a: 1, b: 2}

vtype1 = {a: 1, b: 2} // 报错，不能将类型“{ a: number; b: number; }”分配给类型“Type1Item”。对象文字可以只指定已知属性，并且“b”不在类型“Type1Item”中。
vtype1 = vtype2 // OK 
```

我们发现直接字面量赋值的方式会报错，通过变量二次传递赋值却可以。这是两个问题，我们分开来看

- 为什么`vtype1 = vtype2` 可以赋值？因为`Type2Item` 是 `Type1Item`的子类型（后文会讲到满足什么条件属于子类型），所以可以把`Type2Item`类型的值赋值给`Type1Item`
- 为什么直接字面量赋值的方式会报错？因为TypeScript内对于对象的赋值会进行`额外属性检查(excess property check)`，会报错，tsconfig.json 中配置 `"suppressExcessPropertyErrors": true` 可以关闭多余属性的检测

## 类型兼容性

### 可赋值性 `assignable`

其实兼容性就是可赋值性换一种角度的说法。

当一个变量`x: TA`可以赋值给另一个变量`y: TB`时，我们可以说类型`TB`兼容`TA`

```tsx
let animal: Animal
let dog: Dog

animal = dog // ✅ ok
dog = animal // ❌ error! animal 实例上缺少属性 'bark'
```

子类型是可以赋值给父类型的,也就是 `父类型变量 = 子类型变量` 是安全的，因为子类型上涵盖了父类型所拥有的的一切属性

但是子类型和可赋值性并不是完全对等的，比如我们之前说过，`null`和`undefined`可以赋值给`void`，但`void`不代表任何类型，显然`null`和`undefined`不是`void`的子类型

### 子类型

前面讲到了子类型和父类型，那TS中符合什么条件什么是子类型？

先看一个很常见的例子

```tsx
interface Animal {
  age: number
}

interface Dog extends Animal {
  bark(): void
}
// Animal 是 Dog 的父类，Dog是Animal的子类型，子类型的属性比父类型更多，更具体

type AB = 'a' | 'b'
type A = 'a'

type T1 = A extends AB ? true : false // T1 类型为true
// 在这里 A 内容更少是 AB的 子类型
```

- 在类型系统中，属性更多的类型是子类型。
- 在集合论中，属性更少的集合是子集。

换成更具体的说法：

在后面我们会讲到TS有两种复合类型，set 和 map。set是指一个无序的、无重复元素的集合。而map则和JS中的对象一样，是一些没有重复键的键值对。

```tsx
// set
type Size = 'small' | 'default' | 'big' | 'large';
// map
interface IA {
    a: string
    b: number
}
```

- 在map复合类型中，属性更多的类型是子类型。
- 在set复合类型中，类型更具体包含更少的的集合是子类型

另外TypeScript 的子类型是基于 `结构子类型` 的，只要结构可以兼容，就是子类型。（Duck Type）

```tsx
class Point {
  x: number
}

class Point2 {
  x: number
}

function getPointX(point: Point) {
  return point.x
}

let point2 = new Point2()

getPointX(point2) // ✅ OK
// getPointX接受Point类型变量，但实际拥有同样属性的Point2类型变量也是OK的
```

### 函数子类型

函数子类型的判断更为复杂，[详细内容](https://jkchao.github.io/typescript-book-chinese/tips/covarianceAndContravariance.html)

简单来说函数子类型相比函数父类型，子函数参数要是父函数参数的父类型(或父函数参数类型)，子函数返回类型是父函数返回类型的子类型(或父函数返回类型)

同时我们称：**一个函数类型中，返回值类型是协变的，而参数类型是逆变的**

## 泛型

### 为什么需要泛型

```tsx
function getId(id: number) {
    return id
}

// 只能用在id为number类型的时候
function getId(id: number) {
    return id
}
// 丢失了id的类型，不能获取类型的提示和约束
function getId(id: any) {
    return id
}

// 收窄了类型，但是只能调用number和string公有的属性
function getId(id: number | string) {
    return id
}
getId('12').length // error Property 'length' does not exist on type 'number'
```

使用泛型声明既保证了在成员之间提供有意义的约束，又保持类型的灵活性

```tsx
// 像参数一样接受一个类型，T可以称为类型变量
// T 可以用任何有效名称代替，习惯上用Type第一个字母代替
function getId<T>(id: T) {
    return id
}
```

### 和函数相似

![like_function](https://files.jeekdong.cn/manual/20210323215523.png)

定义

![like_function2](https://files.jeekdong.cn/manual/20210323215755.png)

使用

## 泛型类型

### 泛型函数

- `<T>(): ReturnType`

    ```tsx
    // 通过 <T> 传递类型参数，下面示例约束参数和返回值类型一致
    function identity<T>(arg: T): T {
    	return arg;
    }

    // 泛型好比 JS 中的函数，使用时需传入类型
    let foo = identity<string>('TS');
    // 由于TS 会自动推断类型，可省略类型传参
    let bar = identity('TS');

    // 然而不能使用箭头泛型函数：
    const foo = <T>(x: T) => T; // Error: T 标签没有关闭
    **解决办法**：在泛型参数里使用 extends 来提示编译器，这是个泛型：
    const foo = <T extends {}>(x: T) => x;
    ```

### 泛型接口

- `interface TypeName<T> {}`

    ```tsx
    // 使用 interface 描述上面函数
    interface GenericInterface1 {
    	<T>(arg: T): T;
    }
    // 可将泛型参数当作整个接口的参数
    interface GenericInterface2<T> {
    	(arg: T): T;
    }

    let baz: GenericInterface2<string> = identity;
    ```

### 泛型类

- `class className<T> {}`

    ```tsx
    // 泛型类与泛型接口差不多，`<>`跟在类名后面
    class GenericClass<T> {
    	zeroValue: T;
    	add: (x: T, y: T) => T;
    }
    let myGenericNumber = new GenericNumber<number>();
    myGenericNumber.zeroValue = 0;
    myGenericNumber.add = function(x, y) {
    	return x + y;
    };
    ```

## 类型编程

### 相关操作符

**typeof**

- 与JavaScript中的`typeof`不同（重名了~），在 TypeScript 中，`typeof` 操作符可以用来获取一个变量声明或对象的类型

    ```tsx
    let foo: number = 3;
    type bar = typeof foo; // 相当于 type bar = number
    ```

- 它是从 **实际运行代码** 通向 **类型系统** 的单行道。理论上，任何运行时的符号名想要为类型系统所用，都要加上 typeof。但是class 比较特殊不需要加，因为 ts 的 class 出现得比 js 早，现有的为兼容性解决方案

**keyof**

- `keyof`操作符可以用于获取某种类型的所有键，其返回类型是联合类型

    ```tsx
    interface Person {
      name: string;
      age: number;
    }

    type K1 = keyof Person; // "name" | "age"
    ```

- 索引类型 && 索引签名
    - 如果类型 T 带有字符串索引签名，那么 keyof T 为 string | number 类型。 （当使用数值索引时，JavaScript 在执行索引操作时，会先把数值索引先转换为字符串索引）
    - 如果类型 T 带有数字索引签名，那么 keyof T 为 number 类型。

    ```tsx
    interface B { [index: string]: string; }

    type foo = keyof B;
    // type foo = string | number
    type bar = B['string'];
    // type bar = string
    ```

**in（映射类型）**

- in 用来遍历枚举类型

    ```tsx
    type Keys = "a" | "b" | "c"

    type Obj =  {
      [p in Keys]: any
    } // -> { a: any, b: any, c: any }
    ```

借助上面的关键字，我们已经可以实现一些TypeScript自带的工具类型

我们要实现一个`Partial<T>`，将某个类型里的属性全部改为可选项

```tsx
type Partial<T> = {
  [P in keyof T]?: T[P];
};
// 首先通过 keyof T 拿到 T 的所有属性名
// 然后使用 in 进行遍历，将值赋给 P，最后通过 T[P] 取得相应的属性值
// 中间的 ? 号，用于将所有属性变为可选
```

除了`Partial`，TS中还有`Required`，`Readonly`等工具类型，它们都是只接受一个传入类型，生成的类型中`key`都来自于`keyof`传入的类型，`value`都是传入类型的`value`的变种，称为**同态变换**

### extends

`extends`本意为“拓展”。在TypeScript中，`extends`既可当作一个动词来扩展已有类型；也可当作一个形容词来对类型进行条件限定（例如用在泛型中），或者做条件类型。

```tsx
// **扩**展
type A = {
    a: number
}

interface AB extends A {
    b: string
}
// 与上一种等价
type TAB = A & {
    b: string
}
// 条件限定
function func1<T extends {name: string}> (param: T) {
  console.log(param.name)
}
func1({}) // ❌ Error
func1({name: '123'}) // ✅ OK
```

**条件类型**

- 简单的类型匹配

    可以理解为一个三元表达式，如果X可以分配(赋值)给Y

    ```tsx
    type Equal<X, Y> = X extends Y ? true : false;

    type Num = Equal<1, 1>; // true
    type Str = Equal<'a', 'a'>; // true
    type Boo = Equal<true, false>; // false

    type isNum<T> = T extends number ? number : string

    type Num = isNum<1>   // number;
    type Str = isNum<'1'> // string;
    ```

- 判断联合类型
    - 可以做出判断时

        ```tsx
        type A = 'x';
        type B = 'x' | 'y';

        type Y = A extends B ? true : false; // true
        ```

    - 无法做出判断时

        假设我们传入不确定的值，例如一个联合类型 'x' | 'y' 会怎么样呢？判断逻辑可能是 true，也可能是 false。此时它就把两个结果的值都返回给我们。我们得到了一个 **联合类型** 包含所有返回值

        官方的解释是：**此时做了 推迟解析条件类型 的处理。**

        ```tsx
        type AB<T> = T extends 'x' ? 'a' : 'b'

        type All = AB<'x' | 'y'>; 
        // 非确定条件，可能是 'x' 或 'y'
        // 得到 type All = 'a' | 'b';
        ```

- 推迟解析的额外效果

    ```tsx
    type Other = "a" | "b";
    type Merge<T> = T extends "x" ? T : Other; // T 等于匹配的类型，然后加上 Other 联合类型一起返回

    type Values = Merge<"x" | "y">;
    // 得到 type Values = "x" | "a" | "b";

    type Other = "a" | "b";
    type Merge<T> = T extends "x" ? Other : T; // T 等于除匹配类型的额外所有类型（官方叫候选类型）

    type Values = Merge<"x" | "y">;
    // 得到 type Values = "a" | "b" | 'y';

    // 基于never的单位元特性，实现Exclude类型
    type Exclude<T, U> = T extends U ? never : T;
    type Values = Exclude<"x" | "y" | "z", "x">;
    // 得到 type Values = "y" | "z"
    ```

### infer（有条件类型中的类型推断）

类型推断 infer 是作为 extends 条件类型的子语句使用，同时在 TS2.8 推出

**格式：**

- 使用 infer 声明一个类型变量，在 条件类型判定为 true 时生效

    ```tsx
    // 下面的 infer U 语句就是声明一个类型变量 U（它可以是任意字母或单词）
    // 变量 U 会解析 T 类型
    type ExtractSelf<T> = T extends (infer U) ? U : T;

    type T1 = ExtractSelf<string>;        // string
    type T2 = ExtractSelf<() => void>;    // () => void
    type T3 = ExtractSelf<Date[]>;        // Date[]
    type T4 = ExtractSelf<{ a: string }>; // { a: string }
    ```

- 推断的规则

    ```tsx
    // 推断数组类型
    type ExtractArrayItemType<T> = T extends (infer U)[] ? U : T;

    // 条件判断都为 false，返回 T
    type T1 = ExtractArrayItemType<string>;         // string
    type T2 = ExtractArrayItemType<() => number>;   // () => number
    type T4 = ExtractArrayItemType<{ a: string }>;  // { a: string }

    // 条件判断为 true，返回 U
    type T3 = ExtractArrayItemType<Date[]>;     // Date

    ```

    通过解析 `T` 的格式，判断 `(infer U)[]`可被分配值 `Date[]`，因此条件类型为 `true` 。然后根据变量 `U` 所在的位置，推断 `U` 等于 `Date`

    ```tsx
    // typescript 内置ReturnType的实现
    // 用于提取函数类型的返回值类型
    type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

    // 条件判断为 true，返回 U
    type T1 = ReturnType<() => number>;   // number
    ```

- 推断联合或交叉类型

    在协变位置上，同一个类型变量的多个候选类型会被推断为联合类型

    ```tsx
    type ExtractAllType<T> = T extends { x: infer U, y: infer U } ? U : T;

    type T1 = ExtractAllType<{ x: string, y: number }>; // string | number

    // 优化,可以获取对象值的所有类型
    type ExtractAllType<T> = T extends { [k: string]: infer U } ? U : T;

    type T1 = ExtractAllType<{ x: string, y: number, z: boolean }>; // string | number | boolean
    ```

    在逆变(抗变)位置上，同一个类型变量的多个候选类型会被推断为交叉类型

    ```tsx
    type Bar<T> = T extends { a: (x: infer U) => void, b: (x: infer U) => void } ? U : never;
    type T20 = Bar<{ a: (x: string) => void, b: (x: string) => void }>;  // string
    type T21 = Bar<{ a: (x: string) => void, b: (x: number) => void }>;  // string & number
    ```

- 多个调用签名

    当推断具有多个调用签名（例如函数重载类型）的类型时，用最后的签名进行推断

    ```tsx
    declare function foo(x: string): number;
    declare function foo(x: number): string;
    declare function foo(x: string | number): string | number;

    type 1 = ReturnType<typeof foo>;  // string | number
    ```

- 一些应用

    ```tsx
    // tuple 转 union ，如：[string, number] -> string | number
    // 第一种
    type ElementOf<T> = T extends (infer U)[] ? U : never;
    type TTuple = [string, number];
    type ToUnion = ElementOf<TTuple>; // string | number

    // 第二种
    // from https://stackoverflow.com/questions/44480644/string-union-to-string-array/45486495#45486495
    type TTuple = [string, number];
    // 此处的number可以看做一种索引
    type Res = TTuple[number]; // string | number
    ```

### as const

TypeScript3.4引入的新功能，可以理解为一种特殊的断言

表示该表达式中的字面量类型不应粗化（例如，不要从 'hello' 到string）

- **没有扩展的字面类型**

    我们知道使用关键字`const`声明的变量，因为变量不会被重新分配，所以类型就是本身

    ```tsx
    const x = 'x'; // x has the type 'x'
    ```

    如果我们使用关键字`let`声明变量，类型会被进行宽推断

    ```tsx
    let x = 'x'; // x has the type string
    ```

    使用 `as const` 可以防止变量粗化(被宽推断)

    ```tsx
    let y = 'x' as const; // y has type 'x'`
    ```

- **对象字面量获取只读属性**

    使用关键字`const`声明对象字面量，依然会发生类型的宽推断，主要原因是`const`限制了字面量不能重新赋值，但是字面量的属性依然可以

    ```tsx
    const action = { type: 'INCREMENT', } // has type { type: string }
    ```

    使用`as const`断言，推断的类型已经在每个属性中附加了 `readonly` 修饰符

    ```tsx
    const action = { type: 'INCREMENT', } as const
    // const action: {
    //    readonly type: "INCREMENT";
    //}
    ```

- 数组字面量成为只读元组

    ```tsx
    const action = <const>{
      type: 'SET_HOURS',
      payload: [8, 12, 5, 8]
    }

    // {
    //  readonly type: "SET_HOURS";
    //  readonly payload: readonly [8, 12, 5, 8];
    // }

    action.payload.push(12);  // error - Property 'push' does not exist on type 'readonly [8, 12, 5, 8]'.
    ```

- 应用

    自定义Hooks的返回。如果需要返回数组，使用`[const` assertions](https://devblogs.microsoft.com/typescript/announcing-typescript-3-4/#const-assertions) 防止`TypeScript`进行宽推断，默认推断为联合类型数组，实际我们需要不同位置对应不同类型。

    ```tsx
    export function useLoading() {
      const [isLoading, setState] = React.useState(false);
      const load = (aPromise: Promise<any>) => {
        setState(true);
        return aPromise.finally(() => setState(false));
      };
      return [isLoading, load] as const; // infers [boolean, typeof load] instead of (boolean | typeof load)[]
    }

    // 使用普通的断言也可以实现
    export function useLoading() {
      const [isLoading, setState] = React.useState(false);
      const load = (aPromise: Promise<any>) => {
        setState(true);
        return aPromise.finally(() => setState(false));
      };
      return [isLoading, load] as [
        boolean,
        (aPromise: Promise<any>) => Promise<any>
      ];
    }
    ```

### 迭代

前面我们讲到 泛型相当于函数，extends 作为条件类型，使用in迭代，那有没有递归呢？当然是有的

```tsx
// 原生的Readonly只会限制一层写入操作，我们可以利用递归来实现深层次的Readonly
type DeepReadony<T> = {
    readonly [P in keyof T]: DeepReadony<T[P]>
}

interface SomeObject {
  a: {
    b: {
      c: number;
    };
  };
}

const obj: Readonly<SomeObject> = { a: { b: { c: 2 } } };
obj.a.b.c = 3;    // TS不会报错

const obj2: DeepReadony<SomeObject> = { a: { b: { c: 2 } } };
obj2.a.b.c = 3;    // Cannot assign to 'c' because it is a read-only property.
```

## 复合类型

TypeScript的复合类型可以分为两类：set 和 map。set是指一个无序的、无重复元素的集合。而map则和JS中的对象一样，是一些没有重复键的键值对。

```tsx
// set
type Size = 'small' | 'default' | 'big' | 'large';
// map
interface IA {
    a: string
    b: number
}
```

### 复合类型间的转换

```tsx
// map => set
type IAKeys = keyof IA;    // 'a' | 'b'
type IAValues = IA[keyof IA];    // string | number

// set => map
type SizeMap = {
    [k in Size]: number
}
// 等价于
type SizeMap2 = {
    small: number
    default: number
    big: number
    large: number
}
```

## 一个类型编程的例子

需要获取一个类型中所有value为指定类型的key。例如，已知某个React组件的props类型，我需要“知道”（编程意义上）哪些参数是function类型

```tsx
interface SomeProps {
    a: string
    b: number
    c: (e: MouseEvent) => void
    d: (e: TouchEvent) => void
}
// 如何得到 'c' | 'd' ？
```

```tsx
type GetKeyByValueType<T, Condition> = {
    [K in keyof T]: T[K] extends Condition ? K : never
} [keyof T];

type FunctionPropNames =  GetKeyByValueType<SomeProps, Function>;    // 'c' | 'd'
```

## 类型保护

类型保护允许你使用更小范围下的对象类型。

### typeof

```tsx
function doSome(x: number | string) {
  if (typeof x === 'string') {
    // 在这个块中，TypeScript 知道 `x` 的类型必须是 `string`
    console.log(x.subtr(1)); // Error: 'subtr' 方法并没有存在于 `string` 上
    console.log(x.substr(1)); // ok
  }

  x.substr(1); // Error: 无法保证 `x` 是 `string` 类型
}
```

### instanceof

```tsx
class Foo {
  foo = 123;
}

class Bar {
  bar = 123;
}

function doStuff(arg: Foo | Bar) {
  if (arg instanceof Foo) {
    console.log(arg.foo); // ok
    console.log(arg.bar); // Error
  } else {
    // 这个块中，一定是 'Bar'
    console.log(arg.foo); // Error
    console.log(arg.bar); // ok
  }
}

doStuff(new Foo());
doStuff(new Bar());
```

### in

in 操作符可以安全的检查一个对象上是否存在一个属性，它通常也被做为类型保护使用：

```tsx
interface A {
  x: number;
}

interface B {
  y: string;
}

function doStuff(q: A | B) {
  if ('x' in q) {
    // q: A
  } else {
    // q: B
  }
}
```

### 字面量类型保护

```tsx
type Foo = {
  kind: 'foo'; // 字面量类型
  foo: number;
};

type Bar = {
  kind: 'bar'; // 字面量类型
  bar: number;
};

function doStuff(arg: Foo | Bar) {
  if (arg.kind === 'foo') {
    console.log(arg.foo); // ok
    console.log(arg.bar); // Error
  } else {
    // 一定是 Bar
    console.log(arg.foo); // Error
    console.log(arg.bar); // ok
  }
}
```

### 自定义类型保护的类型谓词

```tsx
interface Foo {
  foo: number;
  common: string;
}

interface Bar {
  bar: number;
  common: string;
}

// 用户自己定义的类型保护！
function isFoo(arg: any): arg is Foo {
  return arg.foo !== undefined;
}

// 用户自己定义的类型保护使用用例：
function doStuff(arg: Foo | Bar) {
  if (isFoo(arg)) {
    console.log(arg.foo); // ok
    console.log(arg.bar); // Error
  } else {
    console.log(arg.foo); // Error
    console.log(arg.bar); // ok
  }
}

doStuff({ foo: 123, common: '123' });
doStuff({ bar: 123, common: '123' });
```

## 流动的类型

我们知道TS会自动进行类型的推导，往往是即基于一个流动的类型

如果我们能正确理解类型的流动，可能就能理解很多时候为什么TS的推导不符合我们预期

- 类型间的流动

    ```tsx
    type RawType = { a: string, b: number };

    // 这里就拿到了上述类型的引用
    type InferType = RawType; // { a: string, b: number };
    ```

- 随着数据的传递而传递的类型

    ```tsx
    let num: number = 100;
    let num2  = num;

    type Num2Type = typeof num2; // number
    ```

- 流动中的过滤

    ```tsx
    type Size = 'small' | 'big' | 'default'

    // 'small' | 'default'
    type NotBigSize = Exclude<Size, 'big'>
    ```

- 流动中的分流

    ```tsx
    class Foo {
      foo = 123;
    }

    class Bar {
      bar = 123;
    }

    function doStuff(arg: Foo | Bar) {
      if (arg instanceof Foo) {
        console.log(arg.foo); // ok
        console.log(arg.bar); // Error
      } else {
        // 这个块中，一定是 'Bar'
        console.log(arg.foo); // Error
        console.log(arg.bar); // ok
      }
    }
    ```

### 一个改进的例子

```tsx
const colorValue = {
    'blue': 1,
    'red': 2,
    'green': 3
}

function handleColorValue(value: 1 | 2| 3) {
    return value 
}

Object.keys(colorValue).map(item => {
    //  No index signature with a parameter of type 'string' was found
    // on type '{ blue: number; red: number; green: number; }'.(7053)
    return handleColorValue(colorValue[item])
})
```

画出其中类型的流动图示如下

![type_flow](https://files.jeekdong.cn/manual/20210323215827.png)

经过函数的调用之后，我们发现 `colorValue` 的 `key` 值由 `'blue' | 'red' | 'green'` 转化为 `string` 这时候再去取值便会报错，

改进的思路有很多，可以使用 `interface` 重新声明 `Object.keys` 函数，使其接受泛型，返回正确的 `key`值，也可以直接使用类型断言。

对于`handleColorValue` 只接受 `1 | 2 | 3` 类型的问题， 声明`colorValue`时使用 `as const` 即可

### 一点点建议

- 减少不必要的显式类型定义，尽可能多地使用类型推导，让类型自然的流动。
- 尽可能少地使用 any 或 as any，注意这里并不是说不能用，而是你判断出目前情况下使用 any 是最优解。如果确定要使用 any 作为类型，优先考虑一下是否可以使用 unknown 类型替代，any会导致类型的丢失
- 尽可能少地使用 as xxx

## 一点技巧

### 借助interface自动合并扩展npm库声明

```tsx
import 'umi-request'

declare module 'umi-request' {
  interface RequestOptionsInit {
    codeErrorHandler?: (data: any) => boolean
  }
}
```

### ! 非空断言操作符

先看一个例子，这里我们直接传入`getElementById`返回的结果提示`null`不能赋值给`HTMLElement`

```tsx
function iNeedElement(el: HTMLElement) {
  return el
}

iNeedElement(document.getElementById('root')) 
// ❌Error
// 类型“HTMLElement | null”的参数不能赋给类型“HTMLElement”的参数。

// getElementById的声明
getElementById(elementId: string): HTMLElement | null;

// 即使我们确保调用的时候传入的值一定非空，也必须先判断类型再调用
let el = document.getElementById('root')
el && iNeedElement(el)
```

因为`getElementById`的函数声明写明了返回值可能为`null` 

即使我们确保调用的时候传入的值一定非空，也需要先判断类型，显得非常麻烦

`!`后缀操作符，用于断言操作对象是非 null 和非 undefined 类型

```tsx
type NumGenerator = () => number;

function myFunc(numGenerator: NumGenerator | undefined) {
  // Object is possibly 'undefined'.(2532)
  // Cannot invoke an object which is possibly 'undefined'.(2722)
  const num1 = numGenerator(); // Error
  const num2 = numGenerator!(); //OK
}
```

```tsx
let x!: number;
initialize();
console.log(2 * x); // Ok

function initialize() {
  x = 10;
}
```

### ?. **可选链**运算符

如果遇到 null 或 undefined 就可以立即停止某些表达式的运行

但需要注意的是，`?.` 与 `&&` 运算符行为略有不同，&& 专门用于检测 falsy 值，比如空字符串、0、NaN、null 和 false 等。**而 ?. 只会验证对象是否为 null 或 undefined**，对于 0 或空字符串来说，并不会出现 “短路

- 可选元素访问

    ```tsx
    function tryGetArrayElement<T>(arr?: T[], index: number = 0) {
      return arr?.[index];
    }
    ```

- 可选链与函数调用

    ```tsx
    let result = obj.customMethod?.();
    ```

### ?? 空值合并运算符

当左侧操作数为 null 或 undefined 时，其返回右侧的操作数，否则返回左侧的操作数

与逻辑或 || 运算符不同，逻辑或会在左操作数为 falsy 值时返回右侧操作数

```tsx
const foo = null ?? 'default string';
console.log(foo); // 输出："default string"

const baz = 0 ?? 42;
console.log(baz); // 输出：0
```

- 短路运算
- 不能与 && 或 || 操作符共用，但当使用括号来显式表明优先级时是可行的

    ```tsx
    (null || undefined ) ?? "foo"; // 返回 "foo"
    ```

## Refs

1. [TypeScript体系调研报告](https://juejin.cn/post/6844903497205448711)
2. [typescript 中的 interface 和 type 到底有什么区别？ · Issue #7 · SunshowerC/blog](https://github.com/SunshowerC/blog/issues/7)
3. [TypeScript 高级技巧](https://juejin.cn/post/6844903863791648782)
4. [白话typescript中的【extends】和【infer】](https://juejin.cn/post/6844904146877808653)
5. [TypeScript 的 extends 条件类型](https://juejin.cn/post/6844904066485583885)
6. [TypeScript unknown 类型](https://www.cnblogs.com/Wayou/p/typescript_unknown_type.html)
7. [一文读懂 TS 中 Object, object, {} 类型之间的区别](http://www.semlinker.com/ts-object-type/)
8. [协变与逆变 | 深入理解 TypeScript](https://jkchao.github.io/typescript-book-chinese/tips/covarianceAndContravariance.html#%E4%B8%80%E4%B8%AA%E6%9C%89%E8%B6%A3%E7%9A%84%E9%97%AE%E9%A2%98)
9. [Typescript 2.8](https://www.tslang.cn/docs/release-notes/typescript-2.8.html)
10. [TypeScript中高级应用与最佳实践](https://juejin.cn/post/6844903904140853255)
11. [杀手级的TypeScript功能：const断言](https://juejin.cn/post/6844903848939634696)
12. [你不知道的 TypeScript 泛型（万字长文，建议收藏）](https://lucifer.ren/blog/2020/06/16/ts-generics/)
13. [你可能不知道的 TypeScript 高级技巧](https://juejin.cn/post/6844904037922373639)
14. [深入 TypeScript 中的子类型、逆变、协变，进阶 Vue3 源码前必须搞懂的。](https://juejin.cn/post/6855517117778198542)
15. [【万字长文】深入理解 TypeScript 高级用法](https://zhuanlan.zhihu.com/p/136254808)