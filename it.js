


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

  function derive(a, b) {
    return function derivedFunction(x) {
      return a(b(x))
    }
  }

  It.fn = {
    derive: function(accessor) {
      return decorate(derive(accessor, this))
    },
    get: function(property) {
      return this.derive(function(object) {
        return object[property]
      })
    },
    set: function(property, value) {
      return this.derive(function(object) {
        object[property] = value
        return object
      })
    },
    send: function(methodName) {
      var args = slice.call(arguments, 1)
      var arg = args[0]
      return this.derive(
        args.length === 0 ? function(object) { return object[methodName]() } :
        args.length === 1 ? function(object) { return object[methodName](arg) } :
        function(object) { return object[methodName].apply(object, args) }
      )
    },
    maybe: function(func) {
      return this.derive(function(value) {
        return value && func(value)
      })
    },
    instantiate: function(Constructor) {
      return this.derive(function(value) {
        return new Constructor(value)
      })
    },
    tap: function(func) {
      return this.derive(function(value) {
        func(value)
        return value
      })
    }
  }

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

  return decorate(It)

}())

if (typeof module != 'undefined') {
  module.exports = It
}





