download fully resolved [sustainability data](https://www.npmjs.com/package/sustainability-schema)

```javascript
var getSustainability = require('get-sustainability')
var assert = require('assert')

getSustainability({
  uri: 'https://raw.githubusercontent.com/kemitchell/get-sustainability.js/master/sustainability.json'
}, function (error, data) {
  assert.ifError(error)
  assert.strictEqual(
    data.project,
    'https://github.com/kemitchell/get-sustainability.js'
  )
  assert.strictEqual(
    data.contributors[0].name,
    'Kyle E. Mitchell'
  )
})
```
