


var It = (function() {

  var slice = [].slice,
      own = {}.hasOwnProperty

  function It(x) {
    return x
  }

  function decorate(instance) {
    for (var property in It.fn) {
      if (own.call(It.fn, property)) {
        instance[property] = It.fn[property]
      }
    }
    return instance
  }

  function compose(a, b) {
    return function composedFunction(x) {
      return a(b.call(this, x))
    }
  }

  It.fn = {
    compose: function(accessor) {
      return decorate(compose(accessor, this))
    },
    get: function(property) {
      return this.compose(function(object) {
        return object[property]
      })
    },
    set: function(property, value) {
      return this.compose(function(object) {
        object[property] = value
        return object
      })
    },
    del: function(property, value) {
      return this.compose(function(object) {
        delete object[property]
        return object
      })
    },
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
    fapply: function(args) {
      return this.compose(function(fn) {
        return fn.apply(null, args)
      })
    },
    fcall: function() {
      var args = slice.call(arguments)
      return this.fapply(args)
    },
    or: function(defaultValue) {
      return this.compose(function(value) {
        return value || defaultValue
      })
    },
    maybe: function(func) {
      return this.compose(function(value) {
        return value && func(value)
      })
    },
    not: function(func) {
      if (!func) func = It
      return this.compose(function(value) {
        return !func(value)
      })
    },
    instantiate: function(Constructor) {
      return this.compose(function(value) {
        return new Constructor(value)
      })
    },
    tap: function(func) {
      return this.compose(function(value) {
        func(value)
        return value
      })
    }
  }

  It.fn.put = It.fn.set
  It.fn.invoke = It.fn.send

  It.compare = function(accessor) {
    function comparator(a, b) {
      a = accessor(a)
      b = accessor(b)
      if (a < b) return -1
      if (a > b) return 1
      return 0
    }
    comparator.reverse = function(a, b) {
      return -comparator(a, b)
    }
    return comparator
  }

  It.self = decorate(function() {
    return this
  })

  It.decorate = decorate

  return decorate(It)

}())

if (typeof module != 'undefined') {
  module.exports = It
}





