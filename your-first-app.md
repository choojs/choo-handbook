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
Below, we add an `addTodo` reducer that uses the
[ES6 spread operator](http://es6-features.org/#SpreadOperator) to create a copy
of `state.todos` and add `action` (the new todo item) to it.

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

Yikes, that's starting to get hard to read. We can go a step further and put the
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

## Completion status

We'll assume that every new item should be _not_ complete when it's created. Let's
revisit our `addTodo` reducer and have it add that default property.

```javascript
app.model({
  state: {
    todos: []
  },
  reducers: {
    addTodo: (action, state) => {
      action.completed = false
      const newTodos = [...state.todos, action]
      return { todos: newTodos }
    }
  }
})
```

Now, every time we add a todo item, it will be stored as
`{ title: 'Our title', complete: false }`. Let's update the view to show that status.

```javascript
const view = (params, state, send) => {
  return html`
    <div>
      <form onsubmit=${onSubmit}>
        <input type="text" placeholder="New item" id="title">
      </form>
      <ul>
        ${state.todos.map((todo) => html`
          <li>
            <input type="checkbox" ${todo.completed ? 'checked' : ''} />
            ${todo.title}
          </li>`)}
      </ul>
    </div>`

  function onSubmit (e) {
    . . .
}
```

Now every time you add an item, it should have an unchecked checkbox next to it.
If you like, you can change the reducer to set `completed` to `true` by default,
which will make the checkboxes show up as checked. But then change it back,
because that isn't how our app should work.

You'll notice, though, that if you add a new item, it resets all the "checked"
statuses to the default. That's because nothing's actually happening when you
click the checkbox other than the default browser functionality provided by
`<input type="checkbox">`. Let's create a handler for when the checkbox changes
that fires an action to update its `completed` property in the state.

To update the state's array of todo items, we need to tell the reducer which item
in the array to update. So we'll take advantage of `.map()`'s second argument,
the index of the array it's iterating.

```javascript
const view = (params, state, send) => {
  return html`
    <div>
      <form onsubmit=${onSubmit}>
        <input type="text" placeholder="New item" id="title">
      </form>
      <ul>
        ${state.todos.map((todo, index) => html`
          <li>
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange=${(e) => {
              send('setCompleted', { index, completed: e.target.checked })
            }} />
            ${todo.title}
          </li>`)}
      </ul>
    </div>`

  function onSubmit (e) {
    . . .
}
```

First of all, you'll notice our `<input>` has grown to two lines. That's valid
markup but not very readable, so feel free to move it to its own function like
we did for `onSubmit`. Second, you'll notice we're passing `index` using the
[ES6 property shorthand](http://es6-features.org/#PropertyShorthand) and the
value of the checkbox's `checked` property.

Now we have to create a reducer called `setCompleted` to update the state when
this action is fired.

```javascript
app.model({
  state: {
    todos: []
  },
  reducers: {
    addTodo: (action, state) => {
      . . .
    },
    setCompleted: (action, state) => {
      const newTodos = [...state.todos]
      newTodos[action.index].completed = action.completed
    }
  }
})
```

In this reducer, we create a copy of `state.todos` so as not to mutate the state,
then we alter the specific item in the new array, changing its `completed`
property to whatever's been passed. Now your app will maintain the `completed`
state when you add new items, as your state is being updated.

So far our app works great unless you refresh! Doing so clears your state, and
you lose all your items. In a real-world app, you may want to persist your items
to a server's database. For this example, we'll use `localStorage`, an in-browser
database that lets you persist data between refreshes. We accomplish similar to
how we'd accomplish communicating with a server: we use an *effect*.

## Effects
