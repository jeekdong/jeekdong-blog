---
title: '小程序Sentry接入'
date: '2020-01-01'
---

# Sentry接入

## 背景

小程序官方是有提供运行时错误报警查询，但是上传时未`开启 ES6 转 ES5`或`代码压缩` 是没有`sourcemap`的。错误上报没有上下文信息。有时甚至很难判断错误发生的页面，光看到错误报警，却很难解决问题

## 接入

`sentry` `sdk`选择的丁香园开源的`sentry-miniapp`

在小程序入口 `app.tsx` 配置

```tsx
import * as Sentry from "sentry-miniapp"

const {
  Integrations: { GlobalHandlers }
} = Sentry

// 初始化 Sentry
Sentry.init({
  dsn: "https://232dd7890c324f8e92a846a3784a63e5@sentry.yuedu.163.com/1000061",
  integrations: [new GlobalHandlers()]
})
// 全局添加tag信息，区分小程序环境，通过tag方式，方便后期在sentry平台筛选
Sentry.setTag('env', process.env.TARO_ENV)
```

此时会拦截并上报所有未被`catch`的错误，

除了这些，我们还可以在部分逻辑中手动上报错误，从而添加更多的上下文信息，如下

```jsx
// 代表临时添加额外信息
Sentry.withScope(function(scope) {
  scope.setExtra('requestUrl', requestParams.url)
  scope.setExtra('data', res)
  // 手动上报错误
  Sentry.captureException(new Error('request error'))
})
```

## 过滤

`qq`小程序上报的错误当中有非常多的底层`webview`执行错误，没有参考价值并且干扰查看重要的错误信息

```jsx
beforeSend(event) {
  if(
    /jsEnginScriptError|webviewScriptError|Java exception|@native/g.test(event.message ? event.message : '')
  ) {
    return null
  }
  return event
},
```

### 扩展

`Sentry`中过滤错误的方式(减少错误噪声)

- 将仅来自于自己代码列入白名单

    ```jsx
    Raven.config('your-dsn', {
        whitelistUrls: [
            'www.example.com/static/js', // your code
            'ajax.googleapis.com'        // code served from Google CDN
        ]
    }).install();
    ```

- 入站过滤器(inbound data filters)
  
    - 在`sentry`项目配置中可以选择过滤错误来源（老版本浏览器，第三方扩展程序，爬虫），也可以自定义过滤指定 `ip` 来源的错误
- 忽略一些无法解决的错误
    - 可以再`sentry`管理平台中手动忽略错误
    - 可以使用`ignoreErrors`。不过要注意的是，对于相同的基本错误，浏览器可能会产生不同的错误消息，需要填写合适的正则以覆盖所有情况

        ```jsx
        Raven.config('your-dsn', {
            ignoreErrors: [
                'Can\'t execute code from freed script',
                /SecurityError\: DOM Exception 18$/
            ]
        }).install();
        ```

- 使用`beforeSend`过滤某些错误

    ```jsx
    Sentry.init({
      beforeSend(event) {
        // Modify the event here
        if(event.user){
          // Don't send user's email address
          delete event.user.email;
        }
        return event;
      }
    });
    ```

- 通过`merge`和`搜索器`的过滤来快速筛选错误
  
    - 搜索器

