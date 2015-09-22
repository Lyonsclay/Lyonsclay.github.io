---
layout: post
custom_css: promises
title: "Promises Promises"
date: 2014-11-08 11:42:00
categories: javascript promises async tutorial
---

How to create shallow Javascript code and avoid callback hell?

[EcmaScript6](https://people.mozilla.org/~jorendorff/es6-draft.htm)
introduces a native Promises spec which "promises" to make asynchronous chaining
much simpler.

[Promises](http://en.wikipedia.org/wiki/Futures_and_promises) are a pattern that
handles asynchronous JavaScript functions. They provide a way of chaining
multiple asynchronous functions in a manner that allows them to operate
sequentially and pass values down the chain. This means that each function will
wait for the previous function to complete operation before executing it's
statements.

Despite the simplicity of the Promise pattern I've found that the numerous
explanations and tutorials on the web are typically insufficient for fully
grasping the concept. One of the failings I have observed is the general attempt
to learn Javascript patterns by using contrived examples.

Instead I am going illustrate a solution to an actual problem: capturing the
latitude and longitude of a broswer with the [HTML5 Geolocation
Api](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)
and then turning that into a physical address.

In addition to basic demonstration of Promises, I will be advocating a way of
[chaining multiple Promise Generators](#promise_land) together that can lead to
more legible JavaScript code.

This tutorial is probably best suited for someone that uses JavaScript for web
development, but has never taken up the language as a serious topic of study. If
you are in that category then I highly recommended taking a deeper look into
[JavaScript](http://javascript.crockford.com). It is a fascinating language that
is continuing to introduce [new patterns and
methods](https://www.youtube.com/watch?v=XE692Clb5LU). If you are already
familiar with asynchronous JavaScript code feel free to skip to the
[Promises](#promises) section.

* [Getting Started](#getting_started)
* [Synchronous Code](#synchronous_code)
* [Asynchronous Code](#asynchronous_code)
* [Promises](#promises)
* [Promise Land](#promise_land)
* [Geolocation Method](#geolocation_method)
* [Geolocation Promise](#geolocation_as_promise)
* [Reverse Geocoding](#reverse_geocoding)

## Getting Started

You can checkout my [Github
repo](https://github.com/Lyonsclay/Promises-Promises.git) it has all the
function defintions for this tutorial. I've included a simple ruby server that
will become necessary when the HTML5 geolocation feature is used.

## Synchronous Code

No doubt you have written plenty of JavaScript synchronous code, but I want to
point out this most basic form of operation in case you have never considered
synchronous code distinct from asynchronous code.

A typical JavaScript function definition is an example of synchronous code.
Synchronous code is run sequentially from one line to the next and blocks
execution of further tasks until the present routine is complete. Synchronous
code can return a value to the function caller with the `return` statement.

```javascript function output(value) { return value; }

var sync = output('jumbalaya'); console.log(sync === 'jumbalaya');   // true ```
You might recall that synchronous functions can be chained together so that the
output of one function is the input of the next.

```javascript 'run'.concat(' away').bold(); // "<b>run away</b>" ```

## Asynchronous Code

Now we'll look at
[setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers.setTimeout)
as an example of an asynchronous function. `setTimeout` runs the code contained
within it after a delay specified in milliseconds.

One challenge with asynchronous functions is that you can't capture the output
directly with a return statement as you would in a synchronous function. The
return statement has to operate immediately because variable assignment happens
immediately( or at least synchronously) otherwise it could not capture an output
value because it would look for a value before it was released and report back
empty.

```javascript var async = setTimeout(function () { console.log('stay classy');
return 'to the depths'; }, 1500);

console.log(async === 'to the depths');   // false ```

In this case the return statement inside `setTimeout` is ignored and `async` is
set to equal the numerical id of the timeout. As it happens, this id can then be
used with the `clearTimeout` function to end an active `setTimeout` timer.

One way of capturing a value from a `setTimeout` is to define a global variable
so that all functions can access it.

```javascript var deffered = 'bric a brac';   // global variable

var passingOut = setTimeout(function () { deffered = 'captured value';
console.log('check deffered now'); }, 3000);

// Result depends on when deffered is accessed.  deffered === 'captured value';
```

The [global
variable](http://stackoverflow.com/questions/4862193/javascript-global-variables)
can also be set inside a function. Here's more information on the
[window](https://developer.mozilla.org/en-US/docs/Web/API/Window) object.

```javascript function setGlobal() { window.greeting = 'namaste'; } ```

Either way it is declared a global variable refers to a variable in the [global
environment](http://www.ecma-international.org/ecma-262/5.1/#sec-10.2.3). The
implication of this is that functions declared in the global execution context
and it's descendants have access to all global variables.

Creating global variables is usually discouraged, because it pollutes the global
namespace. A better way of capturing a value in the global scope is to create a
global object to store variables in. Another way is to avoid the global context
altogether by placing code inside a function body. This insures the scope of the
variables on the top level is shielded from the global context and only the
function name, if one is given, will reside in the global name space.

To chain asynchronous functions together they have to be nested so that they are
forced to operate in sequence. Once they are nested, they can share variables in
a descending fashion because all inner functions have access to it's outer
function's variables. Checkout
[scope](http://toddmotto.com/everything-you-wanted-to-know-about-javascript-scope/)
for more information on how variables are accessed in JavaScript functions.

```javascript function chains() { var arcane = 'chains'; setTimeout(function ()
{        // outer function arcane += ' of '; setTimeout(function () {    //
inner function arcane += 'mephistopheles'; console.log(arcane); }, 700); },
700); return arcane; } ```

The execution of each nested asynchronous function is contingent upon the
completion of an event called by the outer function that encompasses it. In the
above case that event is a delay of 700 milliseconds. As with any function the
code encapsulated executes sequentially. By nesting a function we wait for the
outer function to complete before executing the lines of code in the inner
function.

Regardless of whether a function is synchronous or asynchronous nesting forces
the operation of subsequent functions to occur sequentially. This means that the
values getting passed by the `return` statement are not the final computed
values that the asynchronous functions will eventually give.

```javascript var breakable = chains();

breakable // "chains" ```

If we set a variable equal to the output of the function `chains` that variable
will still have the value given in the initial declaration `var arcane =
'chains'`. Each time an asynchronous function like `setTimeout` is called it
gets processed in it's own time and doesn't block subsequent code. That means
that the value for `arcane` has returned before the functions passed to the
`setTimeout` adds the text 'of' and 'mephistopheles' respectively to `arcane`.
Therefore there are two paths of execution performing simultaneously in the case
of nested asynchronous code as illustrated by the function `chains`.

Passing of variables and sequential operation are two difficult aspects of
asynchronous code that Promises were designed to make simpler.

##Promises

The native EcmaScript6 Promise is based off of the
[Promises/A+](https://promisesaplus.com) proposal which has a nice clear
specification that is worth checking out.

Here is a simple promise to illustrate the pattern.

```javascript var basicPromise = new Promise(function (resolve, reject) { var
basicOperation = true; if (basicOperation) { resolve('play to win'); } else {
reject('crash and burn'); } }); ```

If you enter `basicPromise` in the console you will see what a Promise object
looks like and what value it has resolved to.

```javascript basicPromise

// Promise {[[PromiseStatus]]: "resolved", [[PromiseValue]]: "play to win"} ```

If you get an error stating that Promise is not defined your browser may not
support Promises( currently no version of IE does). Consider updating your
browser or include the polyfill recommended by [Forbes
Lindesay](https://www.promisejs.org).

A promise takes a function with two arguments, which by convention are "resolve"
and "reject". These names can be anything, but it's better to stick with the
convention for code clarity. Inside the function body will live the core
operations of the Promise, in this case it is simply setting the variable
`basicOperation` to `true`. After the core operations are concluded you are
responsible for calling `resolve` or `reject`, otherwise the Promise will
forever have the status of "pending". Both `resolve` and `reject` take an
argument which can be any object that then becomes the `PromiseValue`. It's
important to note that while you can name `resolve` and `reject` anything you
want these are not functions you define, but are rather functions defined on the
Promise prototype that you call with arguments that you provide.

A promise can be "pending", "resolved", or "rejected". Once a Promise has
resolved it's state to "resolved" or "rejected" it never changes status after
that. If you want to invoke the same operation multiple times and use the
Promise pattern then you can return a Promise from a function.

```javascript function evenOdds() { return new Promise(function (resolve,
reject) { if (Math.random() > 0.5) { resolve('beautiful'); } else {
reject('horrific'); } }); } ```

If you enter `evenOdds();` multiple times in the console the `PromiseValue`will
equal "resolve" or "reject" randomly. Now let's say we want to pass the
`PromiseValue` to a function that does something with the value. For that we are
provided with a `then` method that allows us to chain functions so that they
perform sequentially and are able to pass values to subsquent functions.

```javascript function get(value) { console.log('everything is ' + value); }

function throwOut(value) { console.log('so wrong ' + value); }

evenOdds().then(get, throwOut); ```

Try entering `evenOdds().then(get, throwOut);` multiple times and you will
observe the output message alternates between "so wrong horrific" and
"everything is beautiful".

You might notice that the returned Promise object is in the "pending" state. It
does resolve, but at a later moment. If you wish to observe that it has
"resolved" you will need to assign a variable to the expression and call that
variable after the computation has occured.

```javascript var resolution = evenOdds().then(get, throwOut); ```

According to the [Promises A+]() specification the `then` method receives two
arguments that are ignored if they are not functions. The `then` method passes
the `promiseValue` to the first function if it is resolved or the second method
if the promise has rejected.

The term **thenable** refers to an object or function that has a `then` method.
This is the most essential characteristic of a Promise and is what allows for
Promises of different libraries to interact. There is some speculation that
JavaScript asynchronous functions that are currently using the Callback pattern
will be adapted to the Promise pattern.

What if you want to further extend the `then` chain and pass a value to another
function? A simple way to do this is to add a return statement which shares a
value down the chain.

```javascript function fail(value) { return 'so ' + value; }

function give(val) { return 'so extremely ' + val; }

evenOdds().then(give, fail).then(get, throwOut); ```

You can enter the previous line repeatedly and the output will randomly be one
of two messages.

##Promise Land

So we are now passing a series of functions through a Promise interface; this
doesn't seem right. It doesn't seem right because we are in the Promise Land and
all code in Promise Land is clean and beautiful.

Another way of doing this is to chain together a series of Promise generators
with the `then` method. By chaining Promises we can avoid having to provide a
`return` statement to pass values on to subsequent functions as we have done in
the `fail` function.

Notice how the Promise generator `gotcha` now takes an argument.

```javascript function gotcha(value) { return new Promise(function (resolve,
reject) { if (value.length > 0) { value = 'so extremely ' + value;
resolve(value); } else { reject('sorry'); } }); }

evenOdds().then(gotcha); ```

The attempt here is to provide
[modularity](http://en.wikipedia.org/wiki/Modular_programming) of `gotcha`. As a
Promise `gotcha` can start a Promise chain because it is ***thenable***.

```javascript gotcha('freaky').then(give); ```

In the previous cases we have only provided one argument to `then`. This means
that if `evenOdds()` resolves to "rejected" then `gotcha` is ignored. In this
pattern the chain halts when a Promise is "rejected" which might be the desired
behaviour for a series of functions. If, however, you want to operate further on
the value of a rejected Promise you will have to provide a second argument to
`then`.

I believe this is a shortcoming of the Promise pattern. It would be nice to be
able to chain promises together in a way where the state of one Promise is
passed to the next rather than having to provide a function for either state. I
guess the Promise Land is not land of "milk and honey" after all.

##Geolocation Method

HTML5 has a native function
[getCurrentPosition](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)
to acquire geolocation data from a particular piece of hardware running a
browser such as a laptop or mobile device. You can test your browser's ability
use the HTML5 geolocation service with this [demo
app](https://mdn.mozillademos.org/en-US/docs/Web/API/Geolocation/Using_geolocation$samples/Geolocation_Live_Example?revision=635775)
provided by Mozilla.

In order to use this service from your locally hosted code you have to be
running a server, which is why I include the `simple_server.rb` in the
[code](https://github.com/Lyonsclay/Promises-Promises.git) for this tutorial.
This [Stack Overflow]((http://stackoverflow.com/a/5431823)) post offers other
server options if you prefer. Running a server is also important for using the
Google Maps API in the [Reverse Geocoding](#reverse_geocoding) chapter.

To retrieve location data from a device we use the asynchronous method
`getCurrentPosition` which is called on the `navigator.geolocation` object and
takes two callbacks `success` and `error`.
[Callbacks](http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/)
are functions that you define and will get passed into a host function in order
to be called after some operations.

The Callback pattern is perhaps the most widely used design for asynchronous
code. The essential mechanism of passing a function as another function's
parameter is the fundamental way to interact with events that are non blocking.
In fact, the first argument of [setTimeout](#asynchronous_code) can be
considered a callback function for all intensive purposes. What's different is
that `getCurrentPosition` takes an optional second callback, `error`, which is
triggered if `getCurrentPosition` can't get geolocation data for the device it
is running on.

```javascript navigator.geolocation.getCurrentPosition(success, error, options)
```

So now let's implement a `finder` method and define a `success` and `error`
function with some standard `options` for the output data.

```javascript function success(position) { console.log('Your current position
is;'); console.log(position.coords.latitude, position.coords.longitude); }

function error() { alert('Sorry, no position available.'); }

// These are some standard options, but they are not required.  var options = {
enableHighAccuracy: true, maximumAge        : 30000, timeout           : 27000
};

function finder() { navigator.geolocation.getCurrentPosition(success, error,
options); } ```

If you enter `finder();` in your developer's console you will get an output of
your current location assuming you are on a modern browser and have given it
permission to check location.

Our next challenge will be to take the latitude and longitude coordinates and
turn that data into a physical address. Before we do this we are going to turn
the `finder` function in to a Promise in preparation of chaining the two
functions together.

##Geolocation Promise

First off we'll create a Promise constructor for the geolocation service. If you
recall the function to acquire geolocation data takes a `success` and `error`
callback.

```javascript navigator.geolocation.getCurrentPosition(success, error, options)
```

This makes it easy to pipe into a Promise as `success` and `error` correspond to
`resolve` and `reject`. For the sake of simplicity we will ignore the `options`
argument.

```javascript function geoLocate() { return new Promise(function (resolve,
reject) { navigator.geolocation.getCurrentPosition(resolve, reject); }); } ```

The way `getCurrentPosition` works is to pass a current Geoposition object to
the success function if everything goes well and if not it will pass an error
message to the error function.

To see this work we need to set a variable equal to `geoLocate()` that we can
access after the Promise has resolved.

```javascript var where = geoLocate(); ```

If you wait a few moments and type `where` you will hopefully see that it has
resolved to a Geoposition object. `geoLocate` is not so useful by itself so
let's make a Promise generator that produces the latitude and longitude points
from a Geoposition object.

```javascript function getCoordinates(position) { return new Promise(function
(resolve, reject) { if (position) { var coordinates = [position.coords.latitude,
position.coords.longitude]; resolve(coordinates); } else { reject(position); }
}); } ```

Now let's create a fresh logging function `grab` to display the result and for
good measure we'll recycle `throwOut` so we have an error function to pass.

```javascript function grab(val) { console.log(val); }

function throwOut(value) { console.log('so wrong ' + value); }

geoLocate().then(getCoordinates).then(grab, throwOut); ```

##Reverse Geocoding

Reverse geocoding is the process of getting a physical address from latitude and
longitude coordinates. For this example we are going to use the [Google Maps
JavaScript API](https://developers.google.com/maps/documentation/javascript/) to
perform the [Reverse
Geocoding](https://developers.google.com/maps/documentation/javascript/examples/geocoding-reverse).

To start with you have to include the script that contains the Google Maps
Javascript code for connection to the API. This is already included in the file
'index.html' provided with the
[code](https://github.com/Lyonsclay/Promises-Promises.git) for this tutorial.

```html <script type="text/javascript"
src="https://maps.googleapis.com/maps/api/js?sensor=false"></script> ```

The Google Maps API performs many services which we are only using a small
portion of. I say this because the code uses large messy objects, but it's still
worth using because it's free and well maintained by Google.

Here is a simple function that takes an array containing latitude and longitude
and retrieves the corresponding physical address which it then logs to the
console.

```javascript function reverseGeocode(points) { var geocoder = new
google.maps.Geocoder(), coordinates = new google.maps.LatLng(points[0],
points[1]), setting = { 'latLng': coordinates }; geocoder.geocode(setting,
function (results, status) { if (status === 'OK') { var address =
(results[0].formatted_address); console.log(address); } else { alert(status); }
}); } ```

For the sake of producing a physcial address we need not go any further.

```javascript geoLocate().then(getCoordinates).then(reverseGeocode); ```

But, for the sake of demonstration let's turn `reverseGeocode` into a Promise
generator. To do this we will pass `results` to the `resolve` function and
`status` to the `reject` function.

```javascript function getAddress(points) { return new Promise(function
(resolve, reject) { var geocoder = new google.maps.Geocoder(), coordinates = new
google.maps.LatLng(points[0], points[1]), setting = { 'latLng': coordinates };
geocoder.geocode(setting, function (results, status) { if (status === 'OK') {
resolve(results[0].formatted_address); } else { reject(status); } }); }); } ```

Now we can partake in the fruit of our labor and find out where exactly in the
physcial world we are.

```javascript geoLocate().then(getCoordinates).then(getAddress).then(grab,
throwOut); ```

If all worked out you will get something close to the current address you are
occupying.

Yeaahh!
