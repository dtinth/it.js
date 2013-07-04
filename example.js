

// It (it.js)
// ==
//
// `It` is a library to make it easier to create accessor/iterator functions,
// for use with things like `_.map`, `_.filter`, `_.sortBy`, `_.each`, and so on...
// It complements nicely with [Underscore.js](http://documentcloud.github.io/underscore/).
//
// This library is inspired by the article
// [Combinator Recipes for Working With Objects in JavaScript](https://github.com/raganwald/homoiconic/blob/master/2012/12/combinators_1.md)
// by Reginald Braithwaite, but I want it to look more fluent and chainable.


// example.js
// ----------

var _ = require('underscore')
var It = require('./')

var numbers = [3, 1, 4, 1, 5]
var strings = ['this', 'is', 'a', 'Book']


// It
// --
// `It` provides an identity function, just like `_.identity`, but much shorter.


// maps an array with itself... pretty useless

console.log(_.map(numbers, It))


// gets a sorted copy of an array

console.log(_.sortBy(numbers, It))
console.log(_.sortBy(strings, It))



// .get
// ----
// `.get` returns the value of a property. Here's where things get interesting...


// equivalent to function(x) { return x.length }
var getLength = It.get('length')


// sort the strings by their length

console.log(_.sortBy(strings, getLength))



// .send
// -----
// Use `.send(...)` to call a method on an object.


// equivalent to function(x) { return x.toUpperCase() }
var toUpperCase = It.send('toUpperCase')

// map all strings to uppercase:

console.log(_.map(strings, toUpperCase))

// therefore, case-insensitive sorting is easy:

console.log(_.sortBy(strings, toUpperCase))



// Chaining
// --------
// Of course, all of these are chainable.

// equivalent to function(x) { return x.substr(0, 1).toUpperCase() }
var firstCharacterCapitalized = It.send('substr', 0, 1).send('toUpperCase')

console.log(_.map(strings, firstCharacterCapitalized))


// ---
//
// Now, let's move on and try to use chaining to do something more practical...

// Here we have a list of people. (name generation thanks to chance.js)

var addressBook = [
  { first: 'Sifwa', last: 'Duhav', phone: '(416) 984-4454' },
  { first: 'Moc', phone: '(898) 983-5755' },
  { first: 'Diblacbo', last: 'Li', phone: '(258) 838-8314' },
  { first: 'Betu', last: 'Jol', phone: '(219) 234-9591' },
  { first: 'Fuhetu', last: 'Ra', phone: '(631) 437-2332' }
]

// Let's sort them by the length of first name!

// equivalent to function(x) { return x.first.length }
var firstNameLength = It.get('first').get('length')

console.log(_.sortBy(addressBook, firstNameLength))




// .set
// ----
// `.set(property, value)` sets a property on an object.
// The result of this operation will be the invoked object,
// so you can chain more operations (something like `.set('a','b').set('c','d')`).

// Let's set everyone's score to zero! Yes, scores in an address book!

_.each(addressBook, It.set('score', 0))
console.log(addressBook)





// .maybe
// ------
// `.maybe(func)` invokes a passed function with current value only if the current value is truthy.
//
// In the address book above, Moc doesn't have a last name.
// Without `.maybe()`, we will end up calling `.toLowerCase()` on `undefined`,
// and an Error will be thrown.
//
// We want to call `.toLowerCase()` only when we have something to call on.

// equivalent to function(x) { return x.last && x.last.toLowerCase() }
var lastNameLowered = It.get('last').maybe(It.send('toLowerCase'))
console.log(_.map(addressBook, lastNameLowered))

// Then you can filter out falsy value by using `_.filter(..., It)`.

console.log(_.filter(_.map(addressBook, lastNameLowered), It))



// .or
// ---
// Instead of using `.maybe`, we can use `.or` to put a default value.

var lastNameLowered2 = It.get('last').or('None').send('toLowerCase')
console.log(_.map(addressBook, lastNameLowered2))




// .instantiate
// ------------
// `.instantiate(Constructor)` can be used to quickly map things
// into an instance.
//
// Here we have a Person class.

function Person(info) {
  this.info = info
}
Person.prototype.getName = function() {
  return this.info.first + ' ' + this.info.last
}
Person.prototype.greet = function() {
  console.log('Hello! I am "' + this.getName() + '"')
}

// We can map everyone in the address book into a new Person instance!

// equivalent to function(x) { return new Person(x) }
var people = _.map(addressBook, It.instantiate(Person))
_.each(people, It.send('greet'))



// It.self
// -------
// You can use `It.self` instead of `It` to use make a function that
// uses the value of `this` instead of the value of passed argument.
//
// You can use it to quickly make an accessor function

// `Person#getFirstName` returns the first name.

// equivalent to function() { return this.info.first }
Person.prototype.getFirstName = It.self.get('info').get('first')


// This function takes a last name, and returns a name suffix.
// No need to check of `null` here, we'll let `.maybe` do it.

function initial(string) {
  return ' ' + string.substr(0, 1) + '.'
}

// `Person#getLastInitial` returns the initial of last name.
// If the person does not have last name, then return empty string.

// equivalent to function() { return (this.info.last && initial(this.info.last)) || '' }
Person.prototype.getLastInitial = It.self.get('info').get('last').maybe(initial).or('')

// We can then redefine the `getName` method to make use of them:

Person.prototype.getName = function() {
  return this.getFirstName() + this.getLastInitial()
}

_.each(people, It.send('greet'))


// .compose
// --------
// You can use `.derive` to compose your own functionality.
//
// Here we have these vectors...

var vectors = [
  { x: 1, y: 5 }, { x: 5, y: 1 }, { x: 2, y: -3 }
]
  
// We also have a square function...

function square(x) {
  return x * x
}

// Let's get the square of x and y components of these vectors!

console.log(_.map(vectors, It.get('x').compose(square)))
console.log(_.map(vectors, It.get('y').compose(square)))

// You can also use `.compose` to chain functions together.

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



// .tap
// ----
// `.tap` invokes the passed function with the current value,
// and returns the current value.

// log the numbers and while mapping to get the squares

console.log(numbers)
console.log(_.map(numbers, It.tap(console.log).compose(square)))


// make everyone greet while mapping to get their first name

console.log(_.map(people, It.tap(It.send('greet')).send('getFirstName')))



// License
// -------
// MIT Licensed


