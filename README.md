it.js
==

`it.js` is a library to make it easier to create accessor/iterator functions,
for use with things like `_.map`, `_.filter`, `_.sortBy`, `_.each`, and so on...
It complements nicely with [Underscore.js](http://documentcloud.github.io/underscore/)
(but it does not depend on, and can be used without underscore).

This library is inspired by:

* [Combinator Recipes for Working With Objects in JavaScript](https://github.com/raganwald/homoiconic/blob/master/2012/12/combinators_1.md) by Reginald Braithwaite
* [Q](https://github.com/kriskowal/q) by kriskowal
* [underscore.js](http://underscorejs.org/) by DocumentCloud
* [LiveScript](http://livescript.net/) for stuff like (+), (+ 1), (.test()), (.foo)

tldr
----

In short, this library allows you to write this:

```javascript
It.send('toLowerCase')
```

instead of this:

```javascript
function(name) { return name.toLowerCase() }
```


And this:

```javascript
It.instantiate(Status)
```

instead of this:

```javascript
function(json) { return new Status(json) }
```


They are chainable, so you can also write things like this:

```javascript
It.get('first').get('length')
```

instead of this:

```javascript
function(person) { return person.first.length }
```

And a lot more functionalities (see the quick reference).
Thanks to awesome functional programming and metaprogramming stuff,
this library is just around ~200 lines of code in a single file, and ~3k minified.

Installation
------------

npm:

    npm install it.js

Node:

    var It = require('it.js')

Bower:

    bower install dtinth/it.js

Browser:

    <script src="path/to/it.js"></script>

Quick Reference
---------------

~~~javascript
It                             -> return it
It.self                        -> return this

.get('foo')                    -> return it.foo
.send/.invoke('foo', ...args)  -> return it.foo(...args)
.fcall(...args)                -> return it(...args)
.set/.put('foo', 'bar')        -> it.foo = 'bar'; return it
.del('foo')                    -> delete it.foo; return it

.or(defaultValue)              -> return it || defaultValue
.instantiate(Klass)            -> return new Klass(it)
.tap(fun)                      -> fun(it); return it
.post('foo', [...args])        -> return it.foo(...args)
.fapply([...args])             -> return it(...args)

.maybe(fun)                    -> return it && fun(it)
.maybe('foo')                  -> return it && it.foo
.not(fun)                      -> return !fun(it)
.not('foo')                    -> return !it.foo

.splat(fun)                    -> return Array.prototype.map.call(it, fun)
.splat/.pluck('foo')           -> return Array.prototype.map.call(it, It.get('foo'))
.select/.filter(fun)           -> return Array.prototype.filter.call(it, fun)
.select/.filter('foo')         -> return Array.prototype.filter.call(it, It.get('foo'))
.reduce('foo')                 -> return Array.prototype.reduce.call(it, It.get('foo'))

['op'](value)                  -> return it op value
['op'](a, b)                    = a op b
     (where op === == !== != > >= < <= + - * /)
~~~

example.js
----------

```javascript
var _ = require('underscore')
var It = require('./')
```

```javascript
var numbers = [3, 1, 4, 1, 5]
var strings = ['this', 'is', 'a', 'Book']
```

It
--
`It` provides an identity function, just like `_.identity`, but much shorter.

What you pass to it, you get it back!

```javascript
console.log(It(123))
console.log(It('hello!'))
```


```
123
hello!
```

This code maps an array with itself... Pretty useless

```javascript
console.log(_.map(numbers, It))
```


```
[ 3, 1, 4, 1, 5 ]
```

This code gets a sorted copy of an array. We just sort by itself!
(This is nice since underscore has only `_.sortBy`, but not `_.sort`)

```javascript
console.log(_.sortBy(numbers, It))
console.log(_.sortBy(strings, It))
```


```
[ 1, 1, 3, 4, 5 ]
[ 'Book', 'a', 'is', 'this' ]
```

.get
----
`.get` returns the value of a property. Here's where things get interesting...

Let's create a function that returns the length of a string (or an array, or whatever that has `.length` property).

```javascript
// equivalent to function(x) { return x.length }
var getLength = It.get('length')
```

Now, `getLength` is a function that returns the length property.

```javascript
console.log(getLength('this is a string'))
console.log(getLength(strings))
```


```
16
4
```

We can use it to sort the strings by their length.

```javascript
console.log(_.sortBy(strings, getLength))
```


```
[ 'a', 'is', 'this', 'Book' ]
```

.send / .invoke
---------------
Use `.send(...)` to call a method on an object.

```javascript
// equivalent to function(x) { return x.toUpperCase() }
var upcase = It.send('toUpperCase')
```

Now, `upcase` is a function that takes something and calls the `toUpperCase()` method on it.

```javascript
console.log(upcase('this is a string'))
```


```
THIS IS A STRING
```

With this, we can map all these strings to uppercase:

```javascript
console.log(_.map(strings, upcase))
```


```
[ 'THIS', 'IS', 'A', 'BOOK' ]
```

And with this, case-insensitive sorting is easy:

```javascript
console.log(_.sortBy(strings, upcase))
```


```
[ 'a', 'Book', 'is', 'this' ]
```

.splat / .pluck
------
Use `.splat(function)` to map an array over that function.

```javascript
// equivalent to function(x) { return Array.prototype.map.call(x, upcase) }
var upcaseAll = It.splat(upcase)
```

```javascript
console.log(upcaseAll(strings))
```


```
[ 'THIS', 'IS', 'A', 'BOOK' ]
```

Note that `.pluck('foo')` is equivalent to `.splat(It.get('foo'))`

Chaining
--------
Of course, all of these are chainable.

```javascript
// equivalent to function(x) { return x.substr(0, 1).toUpperCase() }
var firstCharacterCapitalized = It.send('substr', 0, 1).send('toUpperCase')
```

Get the first character of each string, capitalized.

```javascript
console.log(_.map(strings, firstCharacterCapitalized))
```


```
[ 'T', 'I', 'A', 'B' ]
```

---

Now, let's move on and try to use chaining to do something more practical...

Here we have a list of people. (name generation thanks to chance.js)

```javascript
var addressBook = [
  { first: 'Sifwa',    last: 'Duhav', phone: '(416) 984-4454' },
  { first: 'Moc',                     phone: '(898) 983-5755' },
  { first: 'Diblacbo', last: 'Li',    phone: '(258) 838-8314' },
  { first: 'Betu',     last: 'Jol',   phone: '(219) 234-9591' },
  { first: 'Fuhetu',   last: 'Ra',    phone: '(631) 437-2332' }
]
```

Let's sort them by the length of first name!

```javascript
// equivalent to function(x) { return x.first.length }
var firstNameLength = It.get('first').get('length')
```

```javascript
console.log(_.sortBy(addressBook, firstNameLength))
```


```
[ { first: 'Moc', phone: '(898) 983-5755' },
  { first: 'Betu', last: 'Jol', phone: '(219) 234-9591' },
  { first: 'Sifwa', last: 'Duhav', phone: '(416) 984-4454' },
  { first: 'Fuhetu', last: 'Ra', phone: '(631) 437-2332' },
  { first: 'Diblacbo', last: 'Li', phone: '(258) 838-8314' } ]
```

.set / .put
-----------
`.set(property, value)` sets a property on an object.
The result of this operation will be the invoked object,
so you can chain more operations (something like `.set('a','b').set('c','d')`).

Let's set everyone's score to zero! Yes, scores in an address book!

```javascript
_.each(addressBook, It.set('score', 0))
console.log(addressBook)
```


```
[ { first: 'Sifwa',
    last: 'Duhav',
    phone: '(416) 984-4454',
    score: 0 },
  { first: 'Moc', phone: '(898) 983-5755', score: 0 },
  { first: 'Diblacbo',
    last: 'Li',
    phone: '(258) 838-8314',
    score: 0 },
  { first: 'Betu', last: 'Jol', phone: '(219) 234-9591', score: 0 },
  { first: 'Fuhetu', last: 'Ra', phone: '(631) 437-2332', score: 0 } ]
```

.not
----
`.not(func)` invokes a passed function with current value, and returns the logical NOT of the result.
If you don't put in any function, `.not()` is equivalent to `.not(It)`.

For example, one of the contact in the address book above does not have a last name.
Let's find out who.

```javascript
// these three are equivalent to function(x) { return !x.last }
console.log(_.select(addressBook, It.not(It.get('last'))))
console.log(_.select(addressBook, It.get('last').not()))
console.log(_.select(addressBook, It.not('last')))
```


```
[ { first: 'Moc', phone: '(898) 983-5755', score: 0 } ]
[ { first: 'Moc', phone: '(898) 983-5755', score: 0 } ]
[ { first: 'Moc', phone: '(898) 983-5755', score: 0 } ]
```

.maybe
------
`.maybe(func)` invokes a passed function with current value only if the current value is truthy.

Let's say we want to get everyone's last name, lowercased.
Since "Moc" doesn't have a last name, attempt to call `.toLowerCase()` on undefined will throw an Error.
We want to call `.toLowerCase()` only when we have something to call on.

```javascript
// equivalent to function(x) { return x.last && x.last.toLowerCase() }
var lastNameLowered = It.get('last').maybe(It.send('toLowerCase'))
console.log(_.map(addressBook, lastNameLowered))
```


```
[ 'duhav', undefined, 'li', 'jol', 'ra' ]
```

Then you can filter out falsy value by using `_.filter(..., It)`.

```javascript
console.log(_.filter(_.map(addressBook, lastNameLowered), It))
```


```
[ 'duhav', 'li', 'jol', 'ra' ]
```

Note that `.maybe('foo')` is a shorthand for `.maybe(It.get('foo'))`.

.or
---
Instead of using `.maybe`, we can use `.or` to put a default value.

```javascript
var lastNameLowered2 = It.get('last').or('None').send('toLowerCase')
console.log(_.map(addressBook, lastNameLowered2))
```


```
[ 'duhav', 'none', 'li', 'jol', 'ra' ]
```

.instantiate
------------
`.instantiate(Constructor)` can be used to quickly map things
into an instance.

Here we have a Person class.

```javascript
function Person(info) {
  this.info = info
}
Person.prototype.getName = function() {
  return this.info.first + ' ' + this.info.last
}
Person.prototype.greet = function() {
  console.log('Hello! I am "' + this.getName() + '"')
}
```

We can map everyone in the address book into a new Person instance!

```javascript
// equivalent to function(x) { return new Person(x) }
var people = _.map(addressBook, It.instantiate(Person))
_.each(people, It.send('greet'))
```


```
Hello! I am "Sifwa Duhav"
Hello! I am "Moc undefined"
Hello! I am "Diblacbo Li"
Hello! I am "Betu Jol"
Hello! I am "Fuhetu Ra"
```

It.self
-------
You can use `It.self` instead of `It` to create a function that
uses the value of `this` instead of the value of passed argument.

You can use it to quickly make an accessor function

`Person#getFirstName` returns the first name.

```javascript
// equivalent to function() { return this.info.first }
Person.prototype.getFirstName = It.self.get('info').get('first')
```

This function takes a last name, and returns a name suffix.
No need to check of `null` here, we'll let `.maybe` do it.

```javascript
function initial(string) {
  return ' ' + string.substr(0, 1) + '.'
}
```

`Person#getLastInitial` returns the initial of last name.
If the person does not have last name, then return empty string.

```javascript
// equivalent to function() { return (this.info.last && initial(this.info.last)) || '' }
Person.prototype.getLastInitial = It.self.get('info').get('last').maybe(initial).or('')
```

We can then redefine the `getName` method to make use of them:

```javascript
Person.prototype.getName = function() {
  return this.getFirstName() + this.getLastInitial()
}
```

```javascript
_.each(people, It.send('greet'))
```


```
Hello! I am "Sifwa D."
Hello! I am "Moc"
Hello! I am "Diblacbo L."
Hello! I am "Betu J."
Hello! I am "Fuhetu R."
```

.compose
--------
You can use `.compose` to compose your own functionality.
In fact, most of the functionality are in this library is built on top of `.compose`.

Here we have these vectors...

```javascript
var vectors = [ [1, 5], [5, 1], [2, -3] ]
```

We also have a square function...

```javascript
function square(x) {
  return x * x
}
```

Let's get the square of x and y components of these vectors!

```javascript
console.log(_.map(vectors, It.get(0).compose(square)))
console.log(_.map(vectors, It.get(1).compose(square)))
```


```
[ 1, 25, 4 ]
[ 25, 1, 9 ]
```

---

You can also use `.compose` to chain functions together.

```javascript
var test = { a: { b: 1 }, b: { a: 2 } }
var getA = It.get('a')
var getB = It.get('b')
var getAB = getA.compose(getB)
var getBA = getB.compose(getA)
console.log(test)
console.log(getA(test))
console.log(getB(test))
console.log(getAB(test))
console.log(getBA(test))
```


```
{ a: { b: 1 }, b: { a: 2 } }
{ b: 1 }
{ a: 2 }
1
2
```

---

Let's bring back that array of `Person` instances, and the `firstNameLength` function we created earlier before.

The `firstNameLength` function works with JSON data, not `Person` instances.
Luckily, the Person class stores the original JSON data in the `.info` property.
So we can still sort these people by their first name length.

```javascript
_.each(_.sortBy(people, It.get('info').compose(firstNameLength)), It.send('greet'))
```


```
Hello! I am "Moc"
Hello! I am "Betu J."
Hello! I am "Sifwa D."
Hello! I am "Fuhetu R."
Hello! I am "Diblacbo L."
```

---

Here we have a list of things, initially sorted alphabetically...

```javascript
var things = [
  { name: 'Apple',          type: 'fruit' },
  { name: 'CoffeeScript',   type: 'language' },
  { name: 'Cat',            type: 'animal' },
  { name: 'Dog',            type: 'animal' },
  { name: 'Guava',          type: 'fruit' },
  { name: 'JavaScript',     type: 'language' },
  { name: 'Mountain Lion',  type: 'animal' },
  { name: 'Pineapple',      type: 'fruit' },
  { name: 'Ruby',           type: 'language' } ]
```

Let's say we want to order them. We want languages first, then we want animals, and finally we want fruits.
In that order.

Thanks to `.compose` and `_.partial`, this is easy!

```javascript
var where = _.partial(_.indexOf, ['language', 'animal', 'fruit'])
console.log(_.sortBy(things, It.get('type').compose(where)))
```


```
[ { name: 'CoffeeScript', type: 'language' },
  { name: 'JavaScript', type: 'language' },
  { name: 'Ruby', type: 'language' },
  { name: 'Cat', type: 'animal' },
  { name: 'Dog', type: 'animal' },
  { name: 'Mountain Lion', type: 'animal' },
  { name: 'Apple', type: 'fruit' },
  { name: 'Guava', type: 'fruit' },
  { name: 'Pineapple', type: 'fruit' } ]
```

['==='], ['=='], ['!=='], ['!='], ['>'], ['>='], ['<'], ['<='], ['+'], ['-'], ['*'], ['/'], ['%']
-------------------------------------------------------------------------------------------------
These functions can be used to check against the given value...

There are so many different conventions on how to name each of these functions.

* Should I use equal, eq, eql, equals, strictEqual, or strictlyEquals for `===`? How about `==`?
* add or plus? gt, above, greaterThan, more, moreThan?

After I think about them, I think that these names will only add more confusion.
So I just use the original operator name, which are symbols.

```javascript
var addOne = It['+'](1)
console.log(addOne(41))
```


```
42
```

These "operator" functions are a little bit special.
If you pass 2 parameters to these functions, it will calculate the answer right away.

```javascript
console.log(It['+'](41, 1))
```


```
42
```

...so that we can put them into `_.reduce`:

```javascript
console.log(_.reduce([1,2,3,4,5], It['+']))
```


```
15
```

.select / .filter
-----------------
Just like `.splat(fun)` that runs [].map(fun) over passed array,
`.select(fun)` runs [].filter(fun) over passed array.

---

Using ['%'], we can generate even and odd functions quickly.

```javascript
var odd = It['%'](2)
var even = It.not(odd)
```

Then we can filter the even and odd numbers.

```javascript
var onlyEven = It.select(even)
var onlyOdd = It.select(odd)
```

```javascript
console.log(onlyEven(numbers))
console.log(onlyOdd(numbers))
```


```
[ 4 ]
[ 3, 1, 1, 5 ]
```

---

From the above list of things, let's get all the languages.

```javascript
var getLanguageNames = It.select(It.get('type')['==']('language')).pluck('name')
console.log(getLanguageNames(things))
```


```
[ 'CoffeeScript', 'JavaScript', 'Ruby' ]
```

.reduce
-------
Yeah. Just like .splat and .select...

```javascript
var sum = It.reduce(It['+'])
console.log(sum([1,2,3,4,5]))
```


```
15
```

.tap
----
`.tap` invokes the passed function with the current value,
and returns the current value.

log the numbers and while mapping to get the squares

```javascript
console.log(numbers)
console.log(_.map(numbers, It.tap(console.log).compose(square)))
```


```
[ 3, 1, 4, 1, 5 ]
3
1
4
1
5
[ 9, 1, 16, 1, 25 ]
```

make everyone greet while mapping to get their first name

```javascript
console.log(_.map(people, It.tap(It.send('greet')).send('getFirstName')))
```


```
Hello! I am "Sifwa D."
Hello! I am "Moc"
Hello! I am "Diblacbo L."
Hello! I am "Betu J."
Hello! I am "Fuhetu R."
[ 'Sifwa', 'Moc', 'Diblacbo', 'Betu', 'Fuhetu' ]
```

Performance
-----------

While these generated functions are fast (only a little function call overhead),
the process of creating these functions is expensive.

For best performance, you can generate the functions you want to use ahead of time,
and just use them, instead of generating these functions on the fly.
As a simple guideline, don't generate these functions inside a loop.

A very simple benchmark is included in `benchmark.js` to illustrate the point.

License
-------
MIT Licensed

