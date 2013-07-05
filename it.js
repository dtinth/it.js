

var It = (function() {


  var slice = [].slice,
      own = {}.hasOwnProperty,
      map = [].map,
      filter = [].filter,
      reduce = [].reduce,
      run = function(){}.call


  // the identity function
  function It(x) {
    return x
  }


  // the context accessor function
  It.self = function() {
    return this
  }


  // utility functions
  // -----------------

  // extend: copy properties from src to dest, and return dest
  function extend(dest, src) {
    for (var property in src) {
      if (own.call(src, property)) {
        dest[property] = src[property]
      }
    }
    return dest
  }

  // rpartial: right-partial a function
  function rpartial(fun, args) {
    return function() {
      return fun.apply(this, slice.call(arguments).concat(args))
    }
  }

  // rpartial2: a faster implementation
  function rpartial2(fun, arg2) {
    return function(arg1) {
      return fun.call(this, arg1, arg2)
    }
  }

  // compose: returns a function h(x) = g(f(x))
  function compose(f, g) {
    return function composedFunction(x) {
      return g.call(this, f.call(this, x))
    }
  }

  // create: create a new object with prototype
  function create(prototype) {
    var C = function() {}
    C.prototype = prototype
    return new C()
  }


  // functions framework
  // -------------------
  // we want to be as flexible as possible.
  // it should be very easy to add more operations.

  // use It.extend to add new functionalities
  It.fn = { }
  It.extend = function(functions) {
    extend(It, functions)
    extend(It.fn, functions)
    extend(It.self, functions)
  }


  // functions
  // ---------

  // This is the single most important function.
  // With this, `It` objects can be chained, on and on.
  // It takes a function, and composes itself against that function.
  // It then decorates the composed function with the It methods.
  It.extend({
    compose: (function() {
      var decorate = rpartial2(extend, It.fn)
      return function(accessor) {
        return decorate(compose(this, accessor))
      }
    }())
  })


  // operation: Returns a function that represents an operation.
  function operation(func) {
    
    // optimize for binary operations
    if (func.length == 2) {
      return function binaryOperationFunction(rhs) {
        return this.compose(rpartial2(func, rhs))
      }
    }

    // for operations with multiple parameters
    return function operationFunction() {
      return this.compose(rpartial(func, slice.call(arguments)))
    }

  }
  

  // primitive stuff: get set del
  It.extend({
    get: operation(function(it, property) { return it[property] }),
    set: operation(function(it, property, value) { it[property] = value; return it }),
    del: operation(function(it, property) { delete it[property]; return it }),
  })


  // function calling: post, send, fapply, fcall
  It.extend({
    post: function(methodName, args) {
      var arg = args[0]
      if (typeof methodName == 'function') {
        var func = methodName
        return this.compose(
          args.length === 0 ? function(object) { return func.call(object) } :
          args.length === 1 ? function(object) { return func.call(object, arg) } :
          function(object) { return func.apply(object, args) }
        )
      }
      return this.compose(
        args.length === 0 ? function(object) { return object[methodName]() } :
        args.length === 1 ? function(object) { return object[methodName](arg) } :
        function(object) { return object[methodName].apply(object, args) }
      )
    },
    send: function(methodName) {
      var args = slice.call(arguments, 1)
      return this.post(methodName, args)
    },
    fapply: operation(function(it, args) { return it.apply(null, args) }),
    fcall: function() { return this.fapply(slice.call(arguments)) }
  })


  // more awesome stuff: or, maybe, not
  It.extend({
    or:           operation(function(it, defaultValue) { return it || defaultValue }),
    instantiate:  operation(function(it, Klass) { return new Klass(it) }),
    tap:          operation(function(it, fun) { fun(it); return it }),
  })


  // higher order function stuff.
  // these function generally accept other functions to be run on
  // if you pass a string, it is assumed to be It.get(that string)
  function functional(op) {
    return function(fun) {
      if (!fun) fun = It
      if (typeof fun === 'string') fun = It.get(fun)
      return op.call(this, fun)
    }
  }

  It.extend({
    not:    functional(operation(function(it, fun) { return !fun(it) })),
    splat:  functional(operation(function(it, fun) { return map.call(it, fun) })),
    select: functional(operation(function(it, fun) { return filter.call(it, fun) })),
    reduce: functional(operation(function(it, fun) { return reduce.call(it, fun) })),
    maybe:  functional(operation(function(it, fun) { return it && fun(it) })),
  })


  // aliases
  It.extend({
    put:     It.fn.set,
    invoke:  It.fn.send,
    pluck:   It.fn.splat,
    filter:  It.fn.select
  })


  // let's have some operators
  It.op = {}
  function binary(op, fun) {
    return function binaryOperatorFunction(a, b) {
      if (arguments.length > 1) return fun(a, b)
      return op.call(this, a)
    }
  }
  function operator(op) {
    /* jshint evil:true */ // no! eval is not always evil.
    var fun = new Function('a', 'b', 'return a ' + op + ' b')
    var object = {}
    object[op] = binary(operation(fun), fun)
    It.op[op] = fun
    It.extend(object)
  }
  It.splat(operator)(['===', '==', '!==', '!=', '>', '>=', '<', '<=', '+', '-', '*', '/'])

  return It

}())

if (typeof module != 'undefined') {
  module.exports = It
}





