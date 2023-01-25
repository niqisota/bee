if (!$response.body) {
  console.log(`$response.body is undefined: ${$request.url}`)
  $done({})
}

let body = JSON.parse($response.body)
const blockWords = ['三体', '罗辑', 'b站', '鬼畜', '赶海', '春晚', '小品', '相声', '三代鹿人', '电影最top', '大肠']

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

  return Number(num) < 10_000
}

console.log(`bilibili before filter: ${body.data.items.length}`)

body.data.items = body.data.items.filter(row => {
  const blocked = isBlockView(row.cover_left_text_1) || isBlock(row.title) || isBlock(row.talk_back) || isBlock(row.args?.up_name) || isBlock(row.args?.rname) || isBlock(row.args?.tname)
  
  if (blocked) {
    console.log(`❌ blocked ${row.title}`)
  } else {
    console.log(`✅ ${row.title}: ${row.cover_left_text_1}`)
  }
  
  return !blocked
})

body.data.config = {
  "column": 2,
  "autoplay_card": 11,
  "feed_clean_abtest": 1,
  "home_transfer_test": 0,
  "auto_refresh_time": 60,
  "show_inline_danmaku": 0,
  "toast": {},
  "single_autoplay_flag": 1,
  "is_back_to_homepage": true,
  "enable_rcmd_guide": true,
  "inline_sound": 2,
  "auto_refresh_time_by_appear": 69,
  "auto_refresh_time_by_active": 69,
  "trigger_loadmore_left_line_num": 1,
  "history_cache_size": 0,
  "visible_area": 80,
  "card_density_exp": 1
}

console.log(`bilibili after filter: ${body.data.items.length}`)

$done({
  body: JSON.stringify(body)
})
