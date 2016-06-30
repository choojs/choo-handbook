# sup choo
Hey there stranger, welcome to this workshop. My name is
[yosh](https://twitter.com/yoshuawuyts), and I'll be your host for today. I'm
super stoked for you to be here. I'm goinging ahead and assume `choo` (choo
choo!) has piqued your interest, and you want to get started. Let's do it!

`choo` is a tiny little framework that tries to bridge the gap from prototyping
to production code. How does that work? Easy - you'll have seen it in action in
the next few minutes. We'll be building a pocket-sized app, starting off with
HTML and then gently bolting on logic where needed. Here goes!

## Task
Create a `choo` app that displays `"hello pink world!"` inside of a `<div>` in
the browser.

## Guide
To get things started we must import `choo` and create a new instance called
`app`. `app` will be the little container that holds our app. Create a new file
called `client.js` and initialize `choo`:
```js
const choo = require('choo')
const app = choo()
```

Next up let's create a `view`. Views are functions that return HTML.  So let's
go on and import `html` from choo and create our `<div>` tag:
```js
const myCoolView = () => choo.view`
  <div>hello pink world!</div>
`
```

Raddddd! - Alright, now we need to get this puppy rendered on the screen. We do
this by mounting our view inside our application `router`. The `router` takes a
function, which should return an array of `route()`s. Let's do that:
```js
app.router((route) => [
  route('/', myCoolView)
])
```

Alright, now we have our application, our view, and our router. All that's left
is rendering it on the screen by mounting it on the DOM, and then compiling it
using `browserify` so it runs in the browser.

To mount an app on the dom call `app.start()`. This returns a DOM tree that can
be appended to the `<body>` tag in the browser:
```js
const tree = app.start()
document.body.appendChild(tree)
```

And that's it for code. Now to run the app we're going to use a little
prototyping tool that wraps `browserify` called `budo`. Install it with the
`-g` flag:
```sh
$ npm install -g budo
```

And then run our `client.js` file:
```sh
$ budo client.js
[0001] info  Server running at http://127.0.0.1:9966/ (connect)
[0001] 453ms      21KB (browserify)
```

Annnnd that's it! Congratulations, you now you can navigate to your browser on
`localhost:9966` and your app should be alive!
