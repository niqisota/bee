const url = $request.url;
const method = $request.method;
const notifyTitle = "bilibili-json";
if (!$response.body) {
  // 有undefined的情况
  console.log(`$response.body为undefined:${url}`);
  $done({});
}
if (method !== "GET") {
  console.log(notifyTitle, "method错误:", method);
}
let body = JSON.parse($response.body);


const blockWords = ['刘备', '三国', '西游记', '环球', '综艺', '娱乐杂谈', '电影预告', '人力', '篮球', '足球', '体育',  '影视剪辑', '音乐综合', 'mv', '三体', '罗辑', 'b站', '鬼畜', '赶海', '春晚', '小品', '相声', '三代鹿人', '电影最top', '暴雪', '敬汉', '王师傅', 'lexburner', '大肠']

function isBlock(text) {
  return text && blockWords.findIndex(w => text.toLowerCase().replace(/\s+/g, '').includes(w)) > -1
}

const nx = {
  万: 10_000,
  亿: 100_000_000
}

function isBlockView(num) {
  for (const key of Object.keys(nx)) {
    if (String(num).includes(key)) {
      num = Number(num.replace(key, '')) * nx[key]
      break;
    }
  }

  return Number(num) < 100000
}

function fixPos(arr) {
  for (let i = 0; i < arr.length; i++) {
    // 修复pos
    arr[i].pos = i + 1;
  }
}

if (!body.data) {
  console.log(url);
  console.log(`body:${$response.body}`);
  console.log(notifyTitle, url, "data字段错误");
} else {
  if (url.includes("x/v2/splash")) {
    console.log('开屏页' + (url.includes("splash/show") ? 'show' : 'list'));
    if (!body.data.show) {
      // 有时候返回的数据没有show字段
      console.log('数据无show字段');
    } else {
      delete body.data.show;
      console.log('成功');
    }
  } else if (url.includes("resource/show/tab/v2")) {
    console.log('tab修改');
    // 顶部右上角
    if (!body.data.top) {
      console.log(`body:${$response.body}`);
      console.log(notifyTitle, 'tab', "top字段错误");
    } else {
      body.data.top = body.data.top.filter(item => {
        if (item.name === '游戏中心') {
          console.log('去除右上角游戏中心');
          return false;
        }
        return true;
      });
      fixPos(body.data.top);
    }
    // 底部tab栏
    if (!body.data.bottom) {
      console.log(`body:${$response.body}`);
      console.log(notifyTitle, 'tab', "bottom字段错误");
    } else {
      body.data.bottom = body.data.bottom.filter(item => {
        if (item.name === '发布') {
          console.log('去除发布');
          return false;
        } else if (item.name === '会员购') {
          console.log('去除会员购');
          return false;
        }
        return true;
      });
      fixPos(body.data.bottom);
    }
  } else if (url.includes("x/v2/feed/index")) {
    console.log('推荐页');
    if (!body.data.items?.length) {
      console.log(`body:${$response.body}`);
      console.log(notifyTitle, '推荐页', "items字段错误");
    } else {
      body.data.items = body.data.items.filter(i => {
        const { card_type: cardType, card_goto: cardGoto } = i;

        if (cardType && cardGoto) {
          if (cardType === 'banner_v8' && cardGoto === 'banner') {
            if (!i.banner_item) {
              console.log(`body:${$response.body}`);
              console.log(notifyTitle, '推荐页', "banner_item错误");
            } else {
              for (const v of i.banner_item) {
                if (!v.type) {
                  console.log(`body:${$response.body}`);
                  console.log(notifyTitle, '推荐页', "type错误");
                } else {
                  if (v.type === 'ad') {
                    console.log('banner广告');
                    return false;
                  }
                }
              }
            }
          } else if (cardType === 'cm_v2' && ['ad_web_s', 'ad_av', 'ad_web_gif', 'ad_player', 'ad_inline_3d'].includes(cardGoto)) {
            // ad_player大视频广告 ad_web_gif大gif广告 ad_web_s普通小广告 ad_av创作推广广告 ad_inline_3d 上方大的视频3d广告
            console.log(`${cardGoto}广告去除)`);
            return false;
          } else if (cardType === 'small_cover_v10' && cardGoto === 'game') {
            console.log('游戏广告去除');
            return false;
          } else if (cardType === 'cm_double_v9' && cardGoto === 'ad_inline_av') {
            console.log('创作推广-大视频广告');
            return false;
          }
        } else {
          console.log(`body:${$response.body}`);
          console.log(notifyTitle, '推荐页', "无card_type/card_goto");
        }

        const blocked = isBlockView(i.cover_left_text_1) || isBlock(i.title) || isBlock(i.talk_back) || isBlock(i.args?.up_name) || isBlock(i.args?.rname) || isBlock(i.args?.tname)
    
        if (blocked) {
          console.log(`❌ blocked ${i.title}`)
        } else {
          console.log(`✅ ${i.title}: ${i.cover_left_text_1}`)
        }

        return !blocked
      });
    }
  } else {
    console.log(notifyTitle, "路径匹配错误:", url);
  }
}

body = JSON.stringify(body);

$done({
  body
});
