var express = require('express')
var jsonpath = require('jsonpath')
var getRawBody = require('raw-body')
var dcopy = require('deep-copy')
var app = express()

function split (body, path) {
  var elements = jsonpath.query(body, path)
  var messagesToReturn = []

  if (Array.isArray(elements[0])) {
    elements[0].forEach(function (item, i, arr) {
      var dummy = dcopy(body)
      jsonpath.apply(dummy, path, function (value) {
        return item
      })
      messagesToReturn.push(dcopy(dummy))
    })

    return messagesToReturn
  }

  return body
}

app.use(function (req, res, next) {
  getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1mb',
    encoding: 'utf-8'
  }, function (err, string) {
    if (err) return next(err)
    req.text = string
    next()
  })
})

app.post('/:arrayPath', function (req, res) {
  var reqJSON
  reqJSON = JSON.parse(req.text)
  res.json(split(reqJSON, req.params.arrayPath))
})

app.listen(8082, function () {
  console.log('Splitter listening on port 8082!')
})
