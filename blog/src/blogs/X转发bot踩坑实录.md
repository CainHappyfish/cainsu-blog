---
title: "X转发bot踩坑实录"
date: "2025-10-16"
category: "小玩具"
tags: ["qqBot", "X"]
summary: "nsy 推文转发 bot 制作过程中踩的小坑"
author: "破酥"
readTime: "60min"
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

# NoneBot 接入 QQ

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