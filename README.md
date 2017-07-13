<img src ="https://s3-us-west-2.amazonaws.com/fm.ethan.jason/celljs.png" class="logo">

<div class="header">
<a href="https://github.com/intercellular/cell" class="btn btn-primary">GitHub</a>
<a href="https://play.celljs.org" class="btn btn-secondary">Demo</a>
<a href="https://tutorial.celljs.org" class="btn btn-secondary">Tutorial</a>
<a href="https://twitter.com/_celljs" class="btn btn-secondary">Twitter</a>
<a href="https://celljs.now.sh" class="btn btn-secondary">Slack</a>

<br><br>

<a class="badge" href="https://travis-ci.org/intercellular/cell"><img alt="Build Status" src="https://travis-ci.org/intercellular/cell.svg?branch=master"></a>
<a class="badge" href="https://coveralls.io/github/intercellular/cell"><img alt="Coverage Status" src="https://coveralls.io/repos/github/intercellular/cell/badge.svg"></a>

</div>

<div id='mailchimp'></div>


# Cell

A self-constructing web app framework powered by a self-driving DOM.


1. [Philosophy](#philosophy)
2. [Try Now](#try-now)
3. [How is it different?](#there-is-no-framework)
4. [Rules](#there-are-only-3-rules)
5. [How does it work?](#how-it-works)
6. [What problems does it solve?](#what-problems-this-solves)


<br>

# Philosophy

Cell has one and only one design goal: **Easy**.

1. **Easy to learn:** There is NO API to learn. You just need to remember 3 rules.
2. **Easy to use:** You just need a single HTML file with a single `<script src>` line.
3. **Easy to read:** Write an entire app as a piece of JSON-like, human-readable data structure.
4. **Easy to integrate:** Integrating into an existing website is as simple as copy and pasting a Youtube embed code.
5. **Easy to reuse:** Everything is powered by stateless functions instead of 
es and objects, making it extremely modular.
6. **Easy to maintain:** "Development workflow" doesn't exist. No NPM, No Webpack, No Babel, just vanilla Javascript and 100% based on web standards.

<br>

# Try Now

Try downloading to your local machine and open it in your browser.

Seriously, there is no additional code or dependency, no environment to set up. What you see is what you get.

### [Download and Try it!](https://s3-us-west-2.amazonaws.com/fm.ethan.jason/cell_sync.html)

```html
<html>
<script src="https://www.celljs.org/cell.js"></script>
<script>
var el = {
  $cell: true,
  style: "font-family: Helvetica; font-size: 14px;",
  $components: [
    {
      $type: "input",
      type: "text",
      placeholder: "Type something and press enter",
      style: "width: 100%; outline:none; padding: 5px;",
      $init: function(e) { this.focus() },
      onkeyup: function(e) {
        if (e.keyCode === 13) {
          document.querySelector("#list")._add(this.value);
          this.value = "";
        }
      }
    },
    {
      $type: "ol",
      id: "list",
      _items: [],
      $components: [],
      _add: function(val) { this._items.push(val) },
      $update: function() {
        this.$components = this._items.map(function(item) {
          return { $type: "li", $text: item }
        })
      }
    }
  ]
}
</script>
</html>
```

<br>


Here's the generated DOM tree, as viewed in Chrome inspector:


![autonomous dom](https://s3-us-west-2.amazonaws.com/fm.ethan.jason/autnonomous_dom.png)

<br>


# There Is No Framework

A couple of things to note from the code:

1. There are no framework classes to inherit and extend from.
2. There are no API method calls.
3. There are no HTML body tags.
4. All we have is a single JSON-like variable.
5. The DOM just builds itself without you running any function.

<br>

# There are only 3 rules

Cell has no API. 100% of your code will be vanilla Javascript, and there is no framework method or class to implement.

To use Cell, you simply define a variable that describes the DOM content and behavior.

**When you follow the 3 rules below, Cell turns it into HTML.**

<br>

## Rule #1. Attributes map 1:1 to DOM attributes by default.

When you define a Javascript object, its attributes map 1:1 to DOM attributes. So,

```js
var node = {
  id: "container",
  class: "red"
}
```

maps to:

```html
<div id="container" class="red"></div>
```

<br>

## Rule #2. Use 7 special keywords to declare the cell structure

Key				| Description
-------------|---------------------------------
$cell			| Required. Tells Cell to create a cell element using this object as a root
$type			| The type of element to create. (`div`, `form`, `textarea`, etc.)
$components	| Array of nested child nodes
$text			| Text content inside the element (for simple nodes with no $components)
$html			| Unescaped html content inside the element
$init			| A function that auto-executes when the element gets created
$update		| A function that auto-executes when any data stored inside the element changes


For example,

```js
var el = {
  $cell: true,
  $type: "div",
  $components: [
    { $type: "span", $text: "Javascript" },
    { $type: "span", $text: "objective-c" },
    { $type: "span", $text: "ruby" },
    { $type: "span", $text: "java" },
    { $type: "span", $text: "lisp" }
  ]
}
```

becomes:

```html
<div>
  <span>Javascript</span>
  <span>objective-c</span>
  <span>ruby</span>
  <span>java</span>
  <span>lisp</span>
</div>
```

<br>

## Rule #3. Use the "_" Prefix to Store Data and Logic on an HTML Element

Cell lets you store data and application logic directly on HTML elements.

To define a variable on an element's context, simply prepend your attribute name with "_". Cell will treat it as data and make sure it doesn't affect the view.


```js
el = {
  $cell: true,
  $type: "button",
  type: "button",
  $text: "Get next item",
  onclick: function(e) { this._next() },
  _next: function() {
    this._index++;
    this.$text = this._items[this._index];
  },
  _index: 0,
  _items: ["javascript", "objective-c", "ruby", "java", "lisp"]
}
```

Here we use `_items` to store an array, `_index` to store an integer counter, and `_next` to store a function that will run this element by incrementing `_index` and iterating through `_items`.


<br>




# How it works

## 1. Cell is a Single Function that Creates a DOM Tree.

When Cell loads, it first looks for all Javascript variables that have a `$cell` key.

When it finds one, it takes that blueprint object (called a `"Genotype"` in Cell) and creates a DOM tree (`"Phenotype"`) from it.

<br>

![generator](https://s3-us-west-2.amazonaws.com/fm.ethan.jason/function.jpg)


<br>

## 2. Self-driving DOM

So far this is just a static DOM tree. To make it dynamic, you need to write a program that "remote controls" these HTML elements.

Normally Javascript frameworks maintain a separate **centralized data structure and application context ([Model-View-Controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) or some variation)** that synchronizes with and controls HTML elements dynamically.

**Cell takes a decentralized approach.** It creates a DOM tree where each element is self-aware (It can contain an entire Model-View-Controller environment of its own) and can therefore "drive" itself autonomously (Internally called `"Nucleus"`).

<br>

![Image](https://s3-us-west-2.amazonaws.com/fm.ethan.jason/domtree.jpg)

<br>

Instead of having a central master application control the DOM, **Cell directly injects application context into each relevant HTML element so they can run on their own, independent from the outside world.**

Learn more about the underlying architecture [here](./GENESIS.md).

<br>



# What problems this solves


## 1. There is No God (There is No Framework)

Cell has no overarching framework that powers each and every corner of your app.

![Image](https://s3-us-west-2.amazonaws.com/fm.ethan.jason/architecture.jpg)

Normally web app frameworks maintain a central "Model-View-Controller" architecture (or similar) which takes care of everything throughout the app's lifecycle.

Cell works differently. It just creates the DOM and then goes away, because each HTML element it creates can self-drive itself with its **own** model-view-controller. Instead of controlling the DOM remotely with a framework's API, with Cell you control it directly and natively.


Comparison 	|Frameworks before Cell		| Cell
-------------|--------------|------------------------------
Control 		| Centralized 		| Decentralized
Structure		| A master Model-View-Controller program that controls all the HTML elements | Each html element as the container of its own Model-View-Controller logic
Your App		| Full of framework API syntax | Just a vanilla Javascript. No framework code.
Job				| Manages everything throughout the entire app lifecycle | Runs exactly once at the beginning to create an autonomous DOM tree, and then goes away.

<br>

## 2. There are No Middlemen

Nowadays, just to make a simple web app you need to learn all kinds of middlemen technologies.

These tools were born out of necessity as web apps became more complex. But if you take a fundamentally different approach, you may not need them at all.

![Image](https://s3-us-west-2.amazonaws.com/fm.ethan.jason/process.jpg)

Here are some of the reasons why these middlemen have been necessary, and **why Cell doesn't need them**.

##### 1. Frameworks have a class you have to inherit or extend.
>Normally web app frameworks let you use their API by extending or inheriting from their class. Cell has no class and no API method.

##### 2. Frameworks depend on other libraries.
> Most web app frameworks depend on other complex libraries (Don't forget to `npm install` before doing anything!) Cell doesn't depend on any library.

##### 3. Frameworks introduce dependencies.
> Just by choosing to use a framework you have already lost the war against dependency. From then on, you need to use `npm install` for every frontend Javascript library you need to use. Cell frees you from this loop and lets you use frontend Javascript libraries with simple `<script src>`.

##### 4. Framework-specific markup needs to be compiled.
> Cell stays away from inventing any framework-specific markup such as HTML templates. There's no template to compile.

##### 5. Frameworks require you to transpile, compile, and/or build your app to make it work.
> Cell is built with ES5, which works in ALL browsers (including IE). There's no need to transpile your code to use Cell, it just works right away.

<br>

## 3. App as Data

Cell is based on the same idea behind [Jasonette](https://www.jasonette.com), a simple way to build cross-platform iOS/Android native apps with nothing but JSON markup.

Just like Jasonette, Cell lets you express **application logic as a piece of flat data**. This allows you to not only transform and manipulate data, but also the application logic itself.

Let's say we have this view:

```js
var El = {
  $cell: true,
  class: "container",
  $components: [
    { $type: "span", $text: "Four Barrel", class: "row" },
    { $type: "span", $text: "Philz", class: "row" },
    { $type: "span", $text: "Blue Bottle", class: "row" },
    { $type: "span", $text: "Stumptown", class: "row" },
    { $type: "span", $text: "Counter Culture", class: "row" }
  ]
}
```

We see many repeating `span` lines, so let's extract them out into a function:

```js
Coffee = ["Four Barrel", "Philz", "Blue Bottle", "Stumptown", "Counter Culture"]
Item = function(brand) {
  return { $type: "span", $text: brand, class: "row" }
}
var El = {
  $cell: true,
  class: "container",
  $components: Coffee.map(Item)
}
```

Notice how the `Item` is simply a stateless function. We run a `map` on it with the `Coffee` array and end up with the same structure as before.

<br>

## 4. Extreme Modularity with Functional Programming

Normally web app frameworks implement reusable components with **classes**. You need to extend the framework's class and then create components from its instance.

A "component" on Cell is nothing more than a **stateless function**. This is extremely liberating because functions have zero overhead compared to classes.

Because of this functional programming approach:

1. You can split out your app into as many modules as you want.
2. Being able to break down your app into such granular pieces makes it extremely reusable, even in other apps.
3. "Components" are not just for views anymore. Because your app logic fits into a JSON-like object that can be easily transformed, filtered, and manipulated, components can encapsulate the entire Model-View-Controller.

<br>

## 5. Write Future-proof Code

Normally when you use a web app framework, you write code that heavily depends on the framework API.

So if you ever want to use a new framework, you have to rewrite the entire app, taking a huge amount of time to make it do exactly the same thing it used to do.

**With Cell, your can write code that never becomes useless**, simply because:

1. Cell doesn't have an API, so there's nothing to "depend" on.
2. With the functional programming approach, you can write infinitely modular code.

<br>

## 6. Native DOM as App Container

Being able to containerize your app's logic and data inside its HTML elements and then "ship" it to the DOM enables a lot of cool things.

![container](https://s3-us-west-2.amazonaws.com/fm.ethan.jason/container.png)

### A. Integrate with ANY Web Technology Natively.

> Looks like a DOM, Acts like a DOM, it actually IS a DOM

Cell creates an **"Actual DOM"**. There's nothing virtual or magical about it. It really IS just a pure HTML element.

This means we can apply any 3rd party Javascript or CSS libraries (like **jQuery**, **Bootstrap**, **Foundation**, **Select2**, **CodeMirror**, etc.) the same way we would use it on vanilla HTML.

<br>

### B. Plug into EXISTING Websites like a widget.

Normally, using a web app framework is an **all or nothing** deal, because the framework takes over your entire frontend.

Cell completely encapsulates your app's logic into discrete HTML elements, so integrating it into an existing web app or website is as simple as **copy and paste**.


<div id='widget'></div>

<br>

<div id='twitter'></div>

<br>
