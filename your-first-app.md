We'll be using several features from ES6 here, but they're entirely optional.

First, let's import the `choo` module and initialize the application. We'll
create a short-hand variable for `choo.view` called `html`.

```javascript
const choo = require('choo')
const html = choo.view
const app = choo()
```

We'll start building our application by creating a model. In choo, models
are where *state* is contained and where the methods for updating the state
are defined. For now, let's say that our state will contain an array of todo
items. We'll add a couple example todos for demonstration purposes.

```javascript
app.model({
  state: {
    todos: [
      { title: 'Buy milk' },
      { title: 'Call mum' }
    ]
  }
})
```

Now let's create a view to render the todo items. Views are meant to be functions
that are passed `(params, state, send)` and return a DOM tree of element(s).

```javascript
const view = (params, state, send) => {
  return html`
    <div>
      <h1>Todos</h1>
      <ul>
        ${state.todos.map((todo) => html`<li>${todo.title}</li>`)}
      </ul>
    </div>`
}
```

Next, we'll use choo's `router` to make our view show up as the default route.

```javascript
app.router((route) => [
  route('/', view)
])
```

Finally, we'll start our application. This returns a DOM tree, which we'll attach
to the `<body>`.

```javascript
const tree = app.start()
document.body.appendChild(tree)
```

Now we can run our application to see it in action! Switch over to your terminal
and use [budo]() to run a development server with [browserify]().

```bash
budo index.js --live
```

You should see the **Todos** header and your list of two todo items. That's cool,
but not a very useful todo app yet because you can't add your own items!

## Adding items

Let's go back to our model and remove our sample items. By default, the state
should contain an empty `todos` array.

```javascript
app.model({
  state: {
    todos: []
  }
})
```

In choo, state is meant to be immutable, so we would never want to alter `todos`
directly (like `state.todos.push(newTodo)`). Instead, when we want to add an item
to the `todos` array, we dispatch an *action* using
`send('addTodo', { title: 'Buy milk' })`. choo then looks for a *reducer* on the
model called `addTodo` and passes it `{ title: 'Buy milk' }`. The reducer should 
return a new version of the state which choo will use to _replace_ the state under
the hood (rather than alter/mutate it). (TODO: Add "benefit" of immutability)
Below, we add an `addTodo` reducer that uses the [ES6 spread operator]() to create
a copy of `state.todos` and add `action` (the new todo item) to it.

```javascript
app.model({
  state: {
    todos: []
  },
  reducers: {
    addTodo: (action, state) => {
      const newTodos = [...state.todos, action]
      return { todos: newTodos }
    }
  }
})
```

Now let's add a `<form>` above our list of todos so users can add an item. We'll give
it an `onsubmit` handler that will call our `addTodo` reducer with the `value` of its
`<input>` child element using the `send` callback passed to the view by choo.

```javascript
const view = (params, state, send) => {
  return html`
    <div>
      <form onsubmit=${(e) => {
        send('addTodo', { title: e.target.children[0].value })
        e.preventDefault()
      }}>
        <input type="text" placeholder="New item" id="title">
      </form>
      <ul>
        ${state.todos.map((todo) => html`<li>${todo.title}</li>`)}
      </ul>
    </div>`
}
```

Take a look at your app again and try typing in a new todo item and pressing `enter`.
It should immediately show up at the bottom of your list! Woah! That's because `send()`
calls the *reducer* on your *model*, which updates the *state*. Every time the state
updates, the *view* re-renders itself. And when it re-renders, `state.todos` contains
the new item you added.

You'll notice that this "re-render" doesn't even reset the text in your `<input>`.
That's because it uses [morphdom](), which only patches the pieces of the DOM that
have changed. That's cool, but we probably want the `<input>` to be reset in this
case. So let's touch up our `onsubmit` code a little.

```javascript
const view = (params, state, send) => {
  return html`
    <div>
      <form onsubmit=${(e) => {
        const input = e.target.children[0]
        send('addTodo', { title: input.value })
        input.value = ''
        e.preventDefault()
      }}>
        <input type="text" placeholder="New item" id="title">
      </form>
      <ul>
        ${state.todos.map((todo) => html`<li>${todo.title}</li>`)}
      </ul>
    </div>`
}
```

Yikes, that's starting to get a little ugly. We can go a step further and put the
`onsubmit` code into its own function.

```javascript
const view = (params, state, send) => {
  return html`
    <div>
      <form onsubmit=${onSubmit}>
        <input type="text" placeholder="New item" id="title">
      </form>
      <ul>
        ${state.todos.map((todo) => html`<li>${todo.title}</li>`)}
      </ul>
    </div>`

  function onSubmit (e) {
    const input = e.target.children[0]
    send('addTodo', { title: input.value })
    input.value = ''
    e.preventDefault()
  }
}
```

Ah, much cleaner. At this point, you should be able to add your own todo items and
the `<input>` should reset each time. But how do we mark the items as complete?
