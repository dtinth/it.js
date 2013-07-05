it.js
==

`it.js` is a library to make it easier to create accessor/iterator functions,
for use with things like `_.map`, `_.filter`, `_.sortBy`, `_.each`, and so on...
It complements nicely with [Underscore.js](http://documentcloud.github.io/underscore/).

This library is inspired by the article
[Combinator Recipes for Working With Objects in JavaScript](https://github.com/raganwald/homoiconic/blob/master/2012/12/combinators_1.md)
by Reginald Braithwaite, but I want it to look more fluent and chainable.

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

This maps an array with itself... Pretty useless

```javascript
console.log(_.map(numbers, It))
```


```
[ 3, 1, 4, 1, 5 ]
```

This gets a sorted copy of an array. We just sort by itself!
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

Let's create a function that returns the length of a string (or an array, or whatever object that has `.length` property).

```javascript
// equivalent to function(x) { return x.length }
var getLength = It.get('length')
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

Methods inspired from Q.
---

Many methods are inspired from kriskowal's [Q](https://npmjs.org/package/q) library.
So this library also offers the same methods as Q's:

```
value.foo             It.get('foo')(value)
value.foo = x         It.set('foo', x)(value)
                      It.put('foo', x)(value)
delete value.foo      It.del('foo')(value)
value.foo(...args)    It.post('foo', [...args])(value)
                      It.send('foo', ...args)(value)
                      It.invoke('foo', ...args)(value)
value(...args)        It.fapply([...args])
                      It.fcall(...args)
```

.not
----
`.not(func)` invokes a passed function with current value, and returns the logical NOT of the result.
If you don't put in any function, `.not()` is equivalent to `.not(It)`.

For example, one of the contact in the address book above does not have a last name.
Let's find out who.

```javascript
// these two are equivalent to function(x) { return !x.last }
console.log(_.select(addressBook, It.not(It.get('last'))))
console.log(_.select(addressBook, It.get('last').not()))
```


```
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

Here we have these vectors...

```javascript
var vectors = [
  { x: 1, y: 5 }, { x: 5, y: 1 }, { x: 2, y: -3 }
]
```

We also have a square function...

```javascript
function square(x) {
  return x * x
}
```

Let's get the square of x and y components of these vectors!

```javascript
console.log(_.map(vectors, It.get('x').compose(square)))
console.log(_.map(vectors, It.get('y').compose(square)))
```


```
[ 1, 25, 4 ]
[ 25, 1, 9 ]
```

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

License
-------
MIT Licensed

