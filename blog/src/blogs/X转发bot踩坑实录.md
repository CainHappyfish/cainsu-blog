---
title: "X转发bot踩坑实录"
date: "2025-10-16"
category: "小玩具"
tags: ["qqBot", "X"]
summary: "nsy 推文转发 bot 制作过程中踩的小坑"
author: "破酥"
readTime: "60min"
cover: https://pic1.imgdb.cn/item/68effa7ec5157e1a88761cb6.jpg
---

# 获取推文

要制作一个 X 转发工具 bot，首先我们先要去[X Developers](https://developer.x.com/en/portal/products)申请一个应用：

![](https://pic1.imgdb.cn/item/68ef8391c5157e1a88752c96.png)

在图上圈出来的位置生成你的配置信息：

```
X_API_KEY = 
X_API_SECRET = 
X_BEARER_TOKEN = 
X_ACCESS_TOKEN = 
X_ACCESS_TOKEN_SECRET = 
```

然后我们创建一个 python 文件，安装 tweepy 后，有如下核心代码：

```python
from nt import error
import tweepy
from x_config import get_x_config
from typing import List, Optional
from x_config import get_x_config

# 你的Twitter API密钥和访问令牌
consumer_key = get_x_config().api_key
consumer_secret = get_x_config().api_secret
access_token = get_x_config().access_token
access_token_secret = get_x_config().access_token_secret

# 认证
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)

# 创建API对象
api = tweepy.API(auth)

def check_x_api_config():
    """检查X API配置"""
    x_config = get_x_config()
    if x_config and x_config.is_configured():
        print("✅ X API 配置正常")
        return True
    else:
        print("❌ X API 配置缺失，请检查.env文件中的以下变量:")
        print("   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET, X_BEARER_TOKEN")
        return False
    
def fetch_x_content(targets: List[str], count = 1): 
    """获取X用户的最新内容"""
    x_config = get_x_config()
    if not x_config.is_configured():
        raise ValueError("X API 配置未完成")
    
    print(f"监控账号: {', '.join(targets)}")
    
    for target in targets:
        try:
            tweets = api.user_timeline(screen_name=target, count=count, tweet_mode='extended')
            print(f"@{target}: {tweets[0].full_text}")
        except error as e:
            print(f"获取@{target}的推文时出错: {e}")
    
```

然后，不出意外就要出意外了，一运行：

```
tweepy.errors.Forbidden: 403 Forbidden
453 - You currently have access to a subset of X API V2 endpoints and limited v1.1 endpoints (e.g. media post, oauth) only. If you need access to this endpoint, you may need a different access level. You can learn more here: https://developer.x.com/en/portal/product
```

然后再这么一查：

![](https://pic1.imgdb.cn/item/68ef8588c5157e1a88752d56.png)

我们直接使用 tweepy api 调用的是 v1.1 的版本，而现在的 X 采用的是 2.0 的版本，这里我们需要重新换用别的方法来调用 X API。v2.0 的调用方式如下，这里最好用 beare_token：

```python
client = tweepy.Client(
    bearer_token=bearer_token,
    consumer_key=consumer_key,
    consumer_secret=consumer_secret,
    access_token=access_token,
    access_token_secret=access_token_secret
)
```

要获取用户推文，则可以调用`get_users_tweets`方法：

```python
# 基础用法
tweets = client.get_users_tweets(
    id="用户ID",
    max_results=20,
    tweet_fields=['text', 'created_at', 'public_metrics']
)

# 排除转推和回复
tweets = client.get_users_tweets(
    id="用户ID", 
    exclude=['retweets', 'replies'],
    max_results=50
)
```

这里需要注意一点，如果你用的 free 版本且有多个用户需要获取，需要控制一下每个用户的获取间隔，否则容易报 429 Too Many Requests。

查了一下 api 的访问限制为 15min 一次，所以如果想要同时搞多个账号，且一个月拿不出500美刀的话，建议一个token对应一个女声优。

# NapcatBot 接入 QQ

文档：[NapCat | NapCatQQ](https://napcat.napneko.icu/guide/install)

python sdk 文档：[NcatBot 文档 | NcatBot 文档](https://docs.ncatbot.xyz/)

下载客户端：[Releases · NapNeko/NapCatQQ-Desktop](https://github.com/NapNeko/NapCatQQ-Desktop/releases)

在 Windows 操作的话，新建一个 bot 文件夹，创建一个 main.py，然后安装 napcat：

```
pip install ncatbot -U -i https://mirrors.aliyun.com/pypi/simple
```

其他情况的安装可以具体看看文档。安装完后，把以下代码复制到main.py中：

```python
# ========= 导入必要模块 ==========
from ncatbot.core import BotClient, PrivateMessage

# ========== 创建 BotClient ==========
bot = BotClient()

# ========= 注册回调函数 ==========
@bot.private_event()
async def on_private_message(msg: PrivateMessage):
    if msg.raw_message == "测试":
        await bot.api.post_private_msg(msg.user_id, text="NcatBot 测试成功喵~")

# ========== 启动 BotClient==========
bot.run()
```

执行这个文件，就会自动开始安装项目，只需要在弹出的cmd窗口中进行对应的操作就行，具体可以看[Windows 安装 | NcatBot 文档](https://docs.ncatbot.xyz/guide/wininsta/)，这里不做过多叙述。

我这里采用的是插件化开发来实现功能定制，可以参考[插件模式最小示例 | NcatBot 文档](https://docs.ncatbot.xyz/guide/minexample/)，这里也贴一下我的代码：

```python
from ncatbot.plugin_system import NcatBotPlugin
from ncatbot.plugin_system import command_registry
from ncatbot.plugin_system import filter_registry
from ncatbot.core.event import BaseMessageEvent, PrivateMessageEvent, GroupMessageEvent
from ncatbot.core.event.message_segment import Image
testImage = Image("https://pic1.imgdb.cn/item/68effa7ec5157e1a88761cb6.jpg")
# seg.to_dict() == {"type": "image", "data": {"file": "https://pic1.imgdb.cn/item/68efafefc5157e1a8875734b.jpg"}}
# 可选：data.type == "flash" 表示闪照

class HelloPlugin(NcatBotPlugin):
    name = "HelloPlugin"
    version = "1.0.0"

    async def on_load(self):
        # 可留空，保持轻量
        pass

    @command_registry.command("hello")
    async def hello_cmd(self, event: GroupMessageEvent):
        await self.api.post_group_msg(event.group_id, f"你好！这里是破酥写的一个简单的nsycBot，你可以通过/help查看可用的指令哦", image=testImage)
        
    @command_registry.command("help")
    async def monitor_x_accounts_cmd(self, event: GroupMessageEvent):
        await self.api.post_group_msg(event.group_id, f"可用的指令有：\n/hello - 打招呼\n/help - 查看帮助\n/x_monitor - 在本群推送nsyc的最新推文\n/stop_monitor - 在本群停止推送nsyc的推文\n/set_targets - 设置要监控的nsy账号(TODO)")
    
    @filter_registry.private_filter
    async def on_private_msg(self, event: PrivateMessageEvent):
        await event.reply("你发送了一条私聊消息！请在群里使用哦")
        
```

这里遇到一个很神秘的问题，我这里写了两个插件，但是只能执行一个插件的命令，这里需要注意命令只能全小写+下划线，目前我试下来是这样的，也可能是我不知道哪里写撇了。

![](https://pic1.imgdb.cn/item/68efd80fc5157e1a88760ca2.png)

整了几下后，能正常获得推文的内容，但是在转换图片时会报错：

```
[01:18:02.281] ERROR    [Thread-25 (runner)|MainProcess] API logger.py:error:134 | NapCatAPIError: read ECONNRESET
[01:18:02.281] ERROR    [Thread-25 (runner)|MainProcess] ncatbot.plugin_system.builtin_plugin.unified_registry.plugin logger.py:error:134 | 执行函数 test_pic_cmd 时发生错误: read ECONNRESET

# 改用TUN模式后报错超时
```

这里我们可以先把图片下载到本地，再用本地的图片转发即可。

## Bug?

存疑：

Ncapbot 代码中使用了不存在的方法：

![](https://pic1.imgdb.cn/item/68f08eccc5157e1a88787b45.png)

这样会导致清理资源时报错
[2025-10-16 02:23:30,997.997] ERROR    [MainThread|MainProcess] Adapter (logger.py:error:134) | 清理资源时出错: 'Queue' object has no attribute 'done'

另一个报错：
```
Traceback (most recent call last):
  File "D:\winBot\.venv\Lib\site-packages\ncatbot\utils\thread_pool.py", line 132, in _worker_loop
    result = asyncio.run(func(*args, **kwargs))
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\python\Lib\asyncio\runners.py", line 194, in run
    return runner.run(main)
           ^^^^^^^^^^^^^^^^
  File "D:\python\Lib\asyncio\runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\python\Lib\asyncio\base_events.py", line 685, in run_until_complete
    return future.result()
           ^^^^^^^^^^^^^^^
  File "D:\winBot\.venv\Lib\site-packages\ncatbot\core\client.py", line 141, in wrapper
    await handler(event)
  File "D:\winBot\.venv\Lib\site-packages\ncatbot\core\client.py", line 98, in wrapper
    await self.event_bus.publish(NcatBotEvent(event_name, event))
  File "D:\winBot\.venv\Lib\site-packages\ncatbot\plugin_system\event\event_bus.py", line 260, in publish
    result = result_queue.get(timeout=timeout)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\python\Lib\queue.py", line 179, in get
    raise Empty
_queue.Empty
```

这里看框架代码，超时处理捕获不合理，不会处理Empty导致程序阻塞。

# NcapBot + Koishi

由于博主是个前端er，python实在看不懂啦，这里换用 koishi 进行插件的开发。安装基础 node ，我这里是 ubuntu：

```bash
sudo apt update
sudo apt install nodejs
```

安装 docker：

```
#安装前先卸载操作系统默认安装的docker，
sudo apt-get remove docker docker-engine docker.io containerd runc

#安装必要支持
sudo apt install apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release

#添加 Docker 官方 GPG key （可能国内现在访问会存在问题）
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 阿里源（推荐使用阿里的gpg KEY）
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg



#添加 apt 源:
#Docker官方源
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null


#阿里apt源
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null


#更新源
sudo apt update
sudo apt-get update

#安装最新版本的Docker
sudo apt install docker-ce docker-ce-cli containerd.io
#等待安装完成

#查看Docker版本
sudo docker version

#查看Docker运行状态
sudo systemctl status docker
```

执行官方脚本，我是 ssh 服务器安装的，建议把 --tui 打开选择可视化安装：

```bash
curl -o \
napcat.sh \
https://nclatest.znin.net/NapNeko/NapCat-Installer/main/script/install.sh \
&& sudo bash napcat.sh \
--tui
```

安装完成后，可以在控制台中看到对应的启动指令，执行即可，后续的操作与 windows 的操作相同，可以在http://127.0.0.1:6099/webui?token=\<your token>中打开 webui 界面进行配置。

```
xvfb-run -a <path>/Napcat/opt/QQ/qq --no-sandbox
```

如果要在后台运行的话，官方使用的是 screen 方法：

```
screen -dmS napcat bash -c "xvfb-run -a /root/Napcat/opt/QQ/qq --no-sandbox"

# 停止
screen -S napcat -X quit

# 我用的这个，因为需要扫码登陆，上面的方法不会弹出控制台信息
# 创建一个名为 napcat 的 screen 会话
screen -S napcat

# 在 screen 会话中运行命令
xvfb-run -a <path>/Napcat/opt/QQ/qq --no-sandbox

# 按 Ctrl+A 然后按 D 来分离会话
# 重新连接会话：screen -r napcat

```

也可以使用 tmux：

```
# 创建一个名为 napcat 的 tmux 会话
tmux new-session -d -s napcat 'xvfb-run -a <path>/Napcat/opt/QQ/qq --no-sandbox'

# 查看会话：tmux list-sessions
# 重新连接会话：tmux attach-session -t napcat
```

生产环境可以用 systemd：

```
sudo nano /etc/systemd/system/napcat.service
```

添加内容：

```
[Unit]
Description=NapCat QQ Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=<path>/Napcat
ExecStart=/usr/bin/xvfb-run -a <path>/Napcat/opt/QQ/qq --no-sandbox
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

然后启动：

```
sudo systemctl daemon-reload
sudo systemctl enable napcat.service
sudo systemctl start napcat.service

# 可选
# 查看进程
ps aux | grep qq

# 如果使用 systemd 服务
sudo systemctl status napcat.service

# 查看日志
sudo journalctl -u napcat.service -f
```

扫码授权成功后，回到 Web 控制台页面，在“基础信息”板块你就能看到你的 QQ 账号信息，说明 NapCat 已成功连接。登录成功后回到NapCat控制台，点击左侧的网络配置，再点击左上角的添加配置，新建一个Websocket服务器，格式如下图：

![](https://pic1.imgdb.cn/item/68f321fac5157e1a88805801.png)

PS 如果要开放外网的话，请改为0.0.0.0

密钥可以自己设一个，后面 koishi 要用。

## Koishi

由于我是在服务器上装的，所以需要[docker](https://koishi.chat/zh-CN/manual/starter/docker.html#启动容器)，也可以用官方提供的[创建模板项目 | Koishi](https://koishi.chat/zh-CN/manual/starter/boilerplate.html)（这里需要 node >= 18）。启动后访问http://127.0.0.1:5140/就可以看到控制台了。当前默认给我们下载好了各个平台的适配器：

![](https://pic1.imgdb.cn/item/68f25a0dc5157e1a887e9349.png)

对于qq来说这些是用在官方机器人上的，对我们这个场景并不是很适用，我们下载adapter-onebot，点击 adapter-onebot 的修改，然后点击配置，就可以看到具体的配置内容：

![](https://pic1.imgdb.cn/item/68f25f01c5157e1a887e965d.png)

在这个页面中，我们需要填写以下四个关键字段：

- **selfId**（机器人账号）：填写你在 NapCat 中登录的 QQ 号；
- **token**：填写你在 NapCat 面板中添加网络配置时设置的 Token（注意，不是用于登录控制台的 WebUI Token）；
- **protocol**：选择 `ws`（WebSocket 协议）；
- **endpoint**：填写 NapCat 容器的地址加上端口 `3001`，例如：`http://xxx.xxx.xxx.xxx:3001`

发送一些 koishi 命令试一下：

![](https://pic1.imgdb.cn/item/68f260c5c5157e1a887e9cf5.png)

## 指令系统

当然，我们不希望像 status 这样的指令被一般人使用，这里我们就要设置权限了。我们在设置中打开 basic / inspect 插件，用于获取一些信息，在任意平台输入 inspect，可以拿到平台名、消息 ID、频道 ID、群组 ID、用户 ID、自身 ID。

![](https://pic1.imgdb.cn/item/68f262d7c5157e1a887ea33f.png)

拿到之后，我们再启用 console / auth 和 basic / admin 插件，用于管理权限。进入「插件配置」界面，并点击 auth 插件。这里我们会看到有一个「管理员设置」：

![](https://koishi.chat/manual/console/plugin-login.dark.webp)

填写你自己准备好的密码，然后点击「启用插件」。此时会弹出一个登录框，选择「用户密码登录」，填写你刚刚配置好的用户名 (如果你没改就是默认值 `admin`) 和密码，点击「登录」即可进入个人页面。

![](https://koishi.chat/manual/console/login-password.dark.webp)

Koishi 支持账号绑定，即一个 Koishi 账号可以同时对应多个平台用户。完成绑定后，你无论在哪个平台上与机器人交互，数据都会被共享。登录控制台后，任何用户都可以在个人页面中绑定平台账号。在对应平台使用 inspect 指令获取相关信息后，点击「平台账号绑定」右侧的「添加」按钮，并使用你要绑定的账号完成一遍类似平台账号登录的流程，就大功告成了。

![](https://koishi.chat/manual/console/profile.dark.webp)

当然也可以通过指令来实现，[bind](https://koishi.chat/zh-CN/plugins/common/bind.html) 插件通过指令也实现了账号绑定。使用要绑定的平台账号向机器人发送 `bind`，这里由于我们使用 onebot 进行了一层转发，就不能用了。其他相关可以看[账号登录与绑定 | Koishi](https://koishi.chat/zh-CN/manual/usage/platform.html)。

Koishi 内部有一套默认的权限系统，它为每个用户赋予了一个权限等级，遵循以下的 **核心规则**：

- 数据库中没有的用户默认拥有 0 级权限
- 高权限者能够执行一切低权限者的操作

在此基础上，我们还扩充出了这样的一套 **设计准则**：

- 0 级：不存在的用户
- 1 级：所有用户，只能够接触有限的功能
- 2 级：高级用户，能够接触几乎一切机器人的功能
- 3 级：管理员，能够直接操作机器人事务
- 4 级：高级管理员，能够管理其他账号

通过上面的操作我们可以将管理员账号绑定到自己的qq上，这样我们就拥有一个 5 级权限的管理员账号。安装 admin 插件。该插件提供了名为 `authorize` 的指令，可以设置其他用户的权限等级。任何用户只能对权限等级低于自己的用户进行操作，且操作后的权限等级同样必须低于自己。相关操作可以看[权限管理 | Koishi](https://koishi.chat/zh-CN/manual/usage/customize.html#权限管理)。

完成后，我们可以在左侧的指令管理中设置对应的权限了。

## 服务器部署

如果是要暴露 koishi 服务，首先我们需要安装 nginx：

```
sudo apt install -y curl gnupg2 ca-certificates lsb-release
sudo apt install -y nginx
```

启动：

```
sudo systemctl start nginx
```

确保Nginx在系统启动时自动启动，可以执行以下命令：

```
sudo systemctl enable nginx
```

打开 nginx 配置文件，输入：

```
# http://nginx.org/en/docs/http/websocket.html
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

server {
  # server_name, port, ssl 等设置

  location / {
    # 这里的 8080 对应 Koishi 实例的端口
    proxy_pass http://127.0.0.1:8080/;
    proxy_redirect off;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }
}
```

Koishi 应用默认情况下只能在本机访问。接下来我们配置服务器地址使得别人也能访问我们的控制台。

Koishi 的服务器功能是由预装插件 [@koishijs/plugin-server](https://koishi.chat/zh-CN/plugins/develop/server.html) 提供的。

前往「插件配置」页面，找到 server 插件，并将 `host` 修改为 `0.0.0.0`，随后点击右上角的「重载配置」。等待插件重启之后，你就可以使用 `IP:端口` 的方式，在局域网内任意设备的浏览器上访问到 Koishi 控制台了。

如果你将 Koishi 应用暴露在公网上，并配置了相应的域名解析记录，你还需要将 `selfUrl` 修改为能访问到 Koishi 实例的地址。

PS 千万注意配置安全组，博主本人忘了这茬整了半天（

![](https://pic1.imgdb.cn/item/68f26e30c5157e1a887ebe5c.png)

## 插件开发

在应用目录运行下面的命令以创建一个新的插件工作区：

```
npm run setup [name] -- [-c] [-m] [-G]
```

- **name:** 插件的包名，缺省时将进行提问
- **-c, --console:** 创建一个带控制台扩展的插件
- **-m, --monorepo:** 创建 monorepo 的插件
- **-G, --no-git:** 跳过 git 初始化

创建后，需要到项目目录执行一次 build ，再从插件市场添加一个插件才会显示自己的插件。我写了这样的代码：

```typescript
import { Context, Schema } from 'koishi'

export const name = 'nsyx'

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  // write your plugin here
  console.log("hellow word")
  ctx.on('message', (session) => {
    if (session.content === '好想看nsy...')
      session.send('nsyc 真的是')
  })
}
```

启用插件后，控制台输出 helloworld。这样我们就写好了一个简单的插件，剩下的就是进行愉快的开发啦。

> 服务器代理：[nelvko/clash-for-linux-install: 😼 优雅地使用基于 clash/mihomo 的代理环境](https://github.com/nelvko/clash-for-linux-install?tab=readme-ov-file)

### 数据库使用

使用koishi自带的数据库时，需要带上 inject 用于声明额外的依赖插件：

```typescript
export const inject = ['database']
```

同时需要扩展 koishi 的数据库表名：

```typescript
// 扩展Koishi的数据库表定义
declare module 'koishi' {
  interface Tables {
    tweets: StoredTweet
  }
}
```

接下来在 apply 中声明表结构：

```typescript
// 扩展数据库表结构
  ctx.model.extend('tweets', {
    id: 'unsigned',
    account: 'string',
    tweet_id: 'string',
    created_at: 'timestamp',
    content: 'text',
    media_urls: 'text',
    stored_at: 'timestamp'
  }, {
    primary: 'id',
    autoInc: true,
    unique: ['tweet_id'] // 确保推文ID唯一
  })
```

具体的数据库操作可以看官方文档，这里就不做过多叙述。

### 一些坑

- 最好不要通过指令来修改配置内容。
- 发送本地图片时要用绝对路径，否则会报错

## 总服务器部署

```bash
# 创建一个名为 napcat 的 screen 会话
screen -S napcat

# 在 screen 会话中运行命令
xvfb-run -a <path>/Napcat/opt/QQ/qq --no-sandbox

# 按 Ctrl+A 然后按 D 来分离会话
# 重新连接会话：screen -r napcat

# koishi
cd <koishi_path> && tmux new-session -d -s koishi 'npm start'

# 查看日志，最后一个参数是条数
tmux capture-pane -t koishi -p | tail -20 

# 终止
screen -S napcat -X quit
tmux kill-session -t koishi 
```

