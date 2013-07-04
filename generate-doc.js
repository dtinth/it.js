

var fs = require('fs')
var _ = require('underscore')
var It = require('./')

function isComment(line) {
  return line.substr(0, 2) === '//'
}

function stripComment(line) {
  return line.replace(/^\/\/\s?/, '')
}

function comment(block) {
  return 'console.log(' + JSON.stringify(_.map(block.lines, stripComment).join('\n') + '\n') + ');'
}

function code(block) {
  var prints = block.source.match(/console\.log|send\('greet/) && !block.source.match(/function Person/) // quick and dirty!!
  return 'console.log(' + JSON.stringify(['```javascript'].concat(block.lines).concat(['```']).join('\n') + '\n') + ');' +
    (prints ? 'console.log("\\n```");' : '') +
    block.lines.join('\n') + '\n' +
    (prints ? 'console.log("```\\n");' : '')
}

function Block(source) {
  this.source = source
  this.lines = source.split(/\n/)
  this.type = _.every(this.lines, isComment) ? comment : code
}
Block.prototype.getCode = function() {
  return this.type(this)
}

var source = fs.readFileSync('example.js', 'utf-8')
var chunks = _.filter(source.split(/\n\s*\n/), It.send('replace', /\s*/, ''))
var blocks = _.map(chunks, It.instantiate(Block))

eval(_.map(blocks, It.send('getCode')).join('\n'))

