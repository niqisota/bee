if (!$response.body) {
  console.log(`$response.body is undefined: ${$request.url}`)
  $done({})
}

let body = JSON.parse($response.body)
const blockWords = ['三体', 'b站']

function isBlock(text = '') {
  return blockWords.findIndex(w => text.toLowerCase().replace(/\s+/g, '').includes(w)) > -1
}

body.data.items = body.data.items.filter(row => {
  return !(isBlock(row.title) || isBlock(row.talk_back) || (row.args && (isBlock(row.args.up_name) || isBlock(row.args.rname) || isBlock(row.args.tname))))
})

$done(JSON.stringify(body))
