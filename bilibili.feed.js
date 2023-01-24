if (!$response.body) {
  console.log(`$response.body is undefined: ${$request.url}`)
  $done({})
}

let body = JSON.parse($response.body)
const blockWords = ['三体', 'b站', '鬼畜']

function isBlock(text) {
  return text && blockWords.findIndex(w => text.toLowerCase().replace(/\s+/g, '').includes(w)) > -1
}

console.log(`bilibili before filter: ${body.data.items.length}`)

body.data.items = body.data.items.filter(row => {
  const blocked = isBlock(row.title) || isBlock(row.talk_back) || isBlock(row.args?.up_name) || isBlock(row.args?.rname) || isBlock(row.args?.tname)
  
  if (blocked) {
    console.log(`blocked ${row.title}`)
  }
  
  return !blocked
})

console.log(`bilibili after filter: ${body.data.items.length}`)

$done({
  body: JSON.stringify(body)
})
