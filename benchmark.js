
var Benchmark = require('benchmark')
var It = require('./')


function run(desc, benchmark) {
  console.log(desc)
  benchmark
    .on('cycle', function(event) {
      console.log(String(event.target));
    })
    .run({ maxTime: 3 })
  console.log('')
}


var string = 'this is a string'
var upcase = It.send('toUpperCase')
var manualUpcase = function(it) { return it.toUpperCase() }

run('upcase - simple string uppercase', new Benchmark.Suite()
  .add('upcase: normal',                       function() { string.toUpperCase() })
  .add('upcase: manually created function',    function() { manualUpcase(string) })
  .add('upcase: generated function',           function() { upcase(string) })
  .add('upcase: generate function on the fly', function() { It.send('toUpperCase')(string) })
)



var object = { a: { b: { c: function() { return this } } } }
var chain = It.get('a').get('b').send('c')
var manualChain = function(it) { return it.a.b.c() }

run('chain - a lot of chained calls', new Benchmark.Suite()
  .add('chain: normal',                       function() { object.a.b.c() })
  .add('chain: manually created function',    function() { manualChain(object) })
  .add('chain: generated function',           function() { chain(object) })
  .add('chain: generate function on the fly', function() { It.get('a').get('b').send('c')(object) })
)









