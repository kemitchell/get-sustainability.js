download fully resolved [sustainability data](https://www.npmjs.com/package/sustainability-schema)

```javascript
var getSustainability = require('get-sustainability')
var assert = require('assert')

getSustainability({
  uri: 'https://raw.githubusercontent.com/kemitchell/get-sustainability.js/master/sustainability.json'
}, function (error, project) {
  assert.ifError(error)
  assert.strictEqual(
    project.contributors[0].name,
    'Kyle E. Mitchell'
  )
})
```
