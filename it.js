


var It = (function() {


  var slice = [].slice,
      own = {}.hasOwnProperty,
      map = [].map


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

  It.fn = { }
  It.extend = function(functions) {
    extend(It, functions)
    extend(It.fn, functions)
    extend(It.self, functions)
  }


  // functions
  // ---------

  // first, we want to be able to chain these things together
  var decorate = rpartial(extend, [It.fn])

  It.extend({
    compose: function(accessor) {
      return decorate(compose(this, accessor))
    }
  })

  // operation: return a function that represent binary operation
  function operation(func) {
    return function binaryOperationFunction() {
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
    or: operation(function(it, defaultValue) { return it || defaultValue }),
    maybe: operation(function(it, fun) { return it && fun(it) }),
    instantiate: operation(function(it, Klass) { return new Klass(it) }),
    tap: operation(function(it, fun) { fun(it); return it }),
  })


  // higher order function stuff, let's have a wrapper that defaults to It
  function functional(op) {
    return function(fun) {
      return op.call(this, fun || It)
    }
  }

  It.extend({
    not: functional(operation(function(it, fun) { return !fun(it) })),
    splat: functional(operation(function(it, fun) { return map.call(it, fun) })),
    pluck: function(property) { return this.splat(It.get(property)) }
  })


  // aliases
  It.extend({
    put:     It.fn.set,
    invoke:  It.fn.send
  })

  return It

}())

if (typeof module != 'undefined') {
  module.exports = It
}





