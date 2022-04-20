// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>日常的琐碎记录</title>
  </head>
  <style>
    * {
      margin: 0;
      padding: 0;
    }
    body, html {
      height: 100vh;
      width: 100vw;
      background-color: gainsboro;
    }
    div {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    img {
      width: 50vw;
      border-radius: 10px;
      margin-bottom: 10px;
    }
    pre {
      font-size: 1rem;
      font-family: 'Courier New', Courier, monospace;
      color: #333;
      font-style: italic;
    }
    span {
      position: absolute;
      bottom: 20px;
      display: inline-block;
      width: 100%;
      text-align: center;
    }
  </style>
  <body>
    <div
    >
      <img 
        src="https://files.jeekdong.cn/manual/202204180014163.jpg" 
        alt="lani"
      >
    <pre>
  “关于我的律法”
  “我的律法不是黄金，而是星星，月亮和寒冷的夜晚”
  “我想让这律法远离这片土地”
  “即使生命和灵魂和律法始终联结在一起，律法也只需要远远地守望就好”
  “最好是令生灵们无法清楚地看到，感知，信仰或触碰那律法”
  “那就是为什么我要带着我的律法远离这个地方”
  </pre>
    </div>
    <span>
      ICP：
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">浙ICP备20016976号-3</a>
  </body>
  </html>
  `)
}
