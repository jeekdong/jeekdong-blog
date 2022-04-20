import Head from 'next/head'


/**
 * cn 首页
 */
export default function Cn() {
  return (
    <>
      <Head>
        <title>
          日常的琐碎记录
        </title>
      </Head>
      <div 
        style={{
          backgroundColor: 'blanchedalmond',
          marginTop: '-30px'
        }}
        className="h-screen w-full relative"
      >
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px'
          }}
        >
          <img 
            style={{
              width: '100%',
              borderRadius: '10px',
              marginBottom: '10px',
              display: 'inline-block'
            }}
            src="https://files.jeekdong.cn/manual/202204180014163.jpg" 
            alt="la-ni" 
          />
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontStyle: 'italic',
              fontFamily: 'Courier New, Courier, monospace',
              color: ' #514e4e'
            }}
          >
            “关于我的律法”
            “我的律法不是黄金，而是星星，月亮和寒冷的夜晚”
            “我想让这律法远离这片土地”
            “即使生命和灵魂和律法始终联结在一起，律法也只需要远远地守望就好”
            “最好是令生灵们无法清楚地看到，感知，信仰或触碰那律法”
            “那就是为什么我要带着我的律法远离这个地方”
          </pre>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            textAlign: 'center',
            width: '100%'
          }}
        >
          ICP：
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">浙ICP备20016976号-3</a>
        </div>
      </div>
    </>
  )
}
