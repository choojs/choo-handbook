# Your first app

Let's build a small todo application using choo. This tutorial assumes you're
familiar with a few things:

* The concept of **models** and **views** (as in MVC)
* The concept of **state** (the data your application is currently using)
* A few JavaScript features from ES6 (aka ES2015) like [`const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const),
[arrow `=>` functions](https://github.com/lukehoban/es6features#arrows), and
[tagged template strings](https://github.com/lukehoban/es6features#template-strings)
(But don't worry: they're optional, they don't make it much harder to understand
what's going on, and [choo supports older browsers](https://github.com/yoshuawuyts/choo/#choo--internet-explorer--safari))
* [npm](https://nodejs.org/en/download/), and importing JavaScript modules using
`require('...')`

As you go through this tutorial, please take note of anything that is confusing
and [let us know about it](https://github.com/yoshuawuyts/workshop-choo/issues/12)
so we can improve the tutorial.

## Boilerplate

Let's walk through the boilerplate necessary for this project. First, create a
new directory called `choodo` (clever, right?). Inside it, use the terminal to
initialize [npm](https://nodejs.org/en/download/) via `npm init --yes`. Now we'll
install `choo` via `npm install --save choo` and create a file called `index.js`.
The rest of this tutorial will take place inside that file.

## Rendering data

First, let's import the `choo` module, the `html` builder, and initialize the
application.

```javascript
const choo = require('choo')
const html = require('choo/html')
const app = choo()
```

We'll start building our application by creating a **model**. In choo, models
are where **state** is contained and where the methods for updating the state
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

Now let's create a **view** to render the todo items. Views are just functions
that return a DOM tree of elements. They are passed the current state, the
previous state, and a callback function that can be used to change the state.

The `html` builder uses ES6's [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
to construct a DOM tree. We'll use a `.map()` function to list out the todo
items.

```javascript
const view = (state, prev, send) => {
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
app.router([
  ['/', view]
])
```

Finally, we'll start our application. This returns a DOM tree, which we'll attach
to the `<body>`.

```javascript
const tree = app.start()
document.body.appendChild(tree)
```

Now we can run our application to see it in action! Normally, we'd need to bundle
the code using [browserify](http://browserify.org/) (because we use `require()`)
and create an `index.html` file that pulls in the bundle with a `<script>` tag.
To save time, we'll use [budo](https://github.com/mattdesl/budo), which bundles
the code and runs a development server. In your terminal, run:

```bash
npm install --global budo

budo index.js --live --open
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

Our first thought might be to add a button to the **view** that `.push()`es an
item into `state.todos`. But choo embraces the concept of uni-directional data
flow, so views cannot update the state directly. Instead, when we want to add an
item to the `todos` array, we dispatch an **action** using
`send('addTodo', { title: 'Buy milk' })`. choo then looks for a **reducer** on the
model called `addTodo` and passes it `{ title: 'Buy milk' }`.

Choo also embraces immutability, so the reducer won't alter the current state;
instead, it will make a copy of it, alter the copy, and return the copy. Choo will
then _replace_ the state with the copy under the hood. This allows us to compare
state over time (you'll notice views receive the current state and the
previous state as parameters).

Below, we add an `addTodo` reducer that creates a copy of `state.todos` and adds
the new todo item to it, returning a new version of the state that uses the copy.

```javascript
app.model({
  state: {
    todos: []
  },
  reducers: {
    addTodo: (state, data) => {
      const newTodos = state.todos.slice()
      newTodos.push(data)
      return { todos: newTodos }
    }
  }
})
```

Now let's add a `<form>` above our list of todos so users can add an item. We'll
give it an `onsubmit` handler that will call our `addTodo` reducer with the `value`
of its `<input>` child element using the `send` callback passed to the view by
choo.

```javascript
const view = (state, prev, send) => {
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
    </div>
  `
}
```

Take a look at your app again and try typing in a new todo item and pressing
`enter`. It should immediately show up at the bottom of your list! Woah! That's
because `send()` calls the **reducer** on your **model**, which updates the
**state**. Every time the state updates, the **view** re-renders itself. And when
it re-renders, `state.todos` contains the new item you added.

You'll notice that this "re-render" doesn't reset the text in your `<input>`.
That's because choo uses [morphdom](https://github.com/patrick-steele-idem/morphdom),
which only patches the pieces of the DOM that have changed. That's cool, but we
probably want the `<input>` to be reset in this case. So let's touch up our
`onsubmit` code a little.

```javascript
const view = (state, prev, send) => {
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
const view = (state, prev, send) => {
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
revisit our `addTodo` reducer and have it add that default property. Like `state`,
we don't want to mutate/alter `data` directly, so we'll use the
[xtend](https://github.com/Raynos/xtend) library to clone/extend it.

To install the library, use:

```bash
npm install --save xtend
```

Then import it at the top of the file using:

```javascript
const extend = require('xtend')
const choo = require('choo')
const html = require('choo/html')
const app = choo()
```

Now we're ready to update the `addTodo` reducer.

```javascript
app.model({
  state: {
    todos: []
  },
  reducers: {
    addTodo: (state, data) => {
      const todo = extend(data, {
        completed: false
      })
      const newTodos = state.todos.slice()
      newTodos.push(todo)
      return { todos: newTodos }
    }
  }
})
```

Now, every time we add a todo item, it will be stored as
`{ title: 'Our title', completed: false }`. Let's update the view to show that
status.

```javascript
const view = (state, prev, send) => {
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
          </li>`
        )}
      </ul>
    </div>`

  function onSubmit (e) {
    // ...
  }
}
```

Now every time you add an item, it should have an unchecked checkbox next to it.
If you like, you can change the reducer to set `completed` to `true` by default,
which will make the checkboxes show up as checked. But then change it back,
because that isn't how our app should work.

You'll notice, though, that if you add a new item, it resets all the "checked"
statuses to the default. That's because nothing's actually happening when you
click the checkbox other than the default browser functionality provided by
`<input type="checkbox">`. Let's create a handler for checkbox clicks
that fires an action to update its `completed` property in the state.

The state stores todos as an array. To update a specific todo, we'll need to know
its index in that array. So we'll alter the `state.todos.map((todos) => ...)`
signature to include the second argument that JavaScript's `.map` function
provides: the `index` of the array it's iterating, which we can then include in
our `send()` call.

```javascript
const view = (state, prev, send) => {
  return html`
    <div>
      <form onsubmit=${onSubmit}>
        <input type="text" placeholder="New item" id="title">
      </form>
      <ul>
        ${state.todos.map((todo, index) => html`
          <li>
            <input
              type="checkbox" ${todo.completed ? 'checked' : ''}
              onchange=${(e) => {
                const updates = { completed: e.target.checked }
                send('updateTodo', { index: index, updates: updates })
              }} />
            ${todo.title}
          </li>
        `)}
      </ul>
    </div>
  `
}

function onSubmit (e) {
  // ...
}
```

Here, we're passing the `index` and an object of `updates` to the `updateTodo`
reducer. Now we have to create the reducer to update the state when this action
is fired.

```javascript
app.model({
  state: {
    todos: []
  },
  reducers: {
    addTodo: (state, data) => {
      // ...
    },
    updateTodo: (state, data) => {
      const newTodos = state.todos.slice()
      const oldItem = newTodos[data.index]
      const newItem = extend(oldItem, data.updates)
      newTodos[data.index] = newItem
      return { todos: newTodos }
    }
  }
})
```

In this reducer, we create a copy of the `state.todos` array, then we identify
the item we're updating using the `index` that was passed. We then create a copy
of that item and extend it with our `updates` using `xtend`. Finally we replace
the old item in the array with our new object and return the new version of the
state.

This may seem like a lot of work relative to simply altering the state directly,
but immutability lets us compare the state across time and helps avoid bugs down
the line.

At this point your app will maintain the `completed` state when you add new items,
as your state is being updated. So far our app works great unless you refresh!
Doing so clears your state, and you lose all your items. In a real-world app, you
may want to persist your items to a server's database. For this example, we'll use
`localStorage`, an in-browser database that lets you persist data between refreshes.
We accomplish this similar to how we'd accomplish communicating with a server: we
use an **effect**.

## Effects

**Effects** are similar to **reducers** except instead of modifying the **state**
they cause _side effects_ by interacting with servers, databases, DOM APIs, etc. 
Often they'll call a reducer when they're done to update the state. For instance, 
you may have an **effect** called `getUsers` that fetches a list of users from a
server API using AJAX. Assuming the AJAX request completes successfully, the
effect can pass off the list of users to a **reducer** called `receiveUsers`
which simply updates the **state** with that list, separating the concerns of
interacting with an API from updating the application's state.

For the purposes of this tutorial, we'll use a wrapper around `localStorage`
to resemble making an AJAX request. Drop this code snippet in anywhere - all it
does is `getAll` items from `localStorage`, `add` an item and `replace`
an item. And it provides a callback just for appearances even though `localStorage`
is synchronous. It's not very elegant and for demonstration purposes only. You
don't need to learn how `localStorage` works for this tutorial; just pretend it's
interacting with a database.

```javascript
// localStorage wrapper
const store = {
  getAll: (storeName, cb) => {
    try {
      cb(JSON.parse(window.localStorage[storeName]))
    } catch (e) {
      cb([])
    }
  },
  add: (storeName, item, cb) => {
    store.getAll(storeName, (items) => {
      items.push(item)
      window.localStorage[storeName] = JSON.stringify(items)
      cb()
    })
  },
  replace: (storeName, index, item, cb) => {
    store.getAll(storeName, (items) => {
      items[index] = item
      window.localStorage[storeName] = JSON.stringify(items)
      cb()
    })
  }
}
```

Now back to our application code! Let's start by creating an effect called
`getTodos`. In here we'll use a method from the snippet we just pasted called
`getAll` to get an array of our `todos`. Once it completes, we'll use `send()`
to pass it off to a very simple `receiveTodos` reducer to be applied to the
state. Notice that when used inside an **effect**, `send()` requires a third
parameter: `done`. This allows effects to be chained together in a sequence.

```javascript
app.model({
  state: {
    todos: []
  },
  reducers: {
    receiveTodos: (state, data) => {
      return { todos: data }
    }
  },
  effects: {
    getTodos: (state, data, send, done) => {
      store.getAll('todos', (todos) => {
        send('receiveTodos', todos, done)
      })
    }
  }
})
```

Next we'll trigger the `getTodos` effect when our view is first loaded by using
choo's `onload` lifecycle event. To use it, just add an `onload` function to the
view, as seen in the `<div>` tag below.

```javascript
const view = (state, prev, send) => {
  return html`
    <div onload=${() => send('getTodos')}>
      <form onsubmit=${onSubmit}>
        <input type="text" placeholder="New item" id="title">
      </form>
      <ul>
        // ...
      </ul>
    </div>`

  function onSubmit (e) {
    // ...
  }
}
```

If you refresh, you shouldn't see any difference yet because `localStorage` is
empty. To test it out, add an example item by entering the following in your
JavaScript console and refresh:

```javascript
localStorage.todos = '[{"title": "Test", "completed": false}]'
```

To clear it out, use `localStorage.clear()`.

Now we want to our `addTodo` method to interact with `localStorage` as well,
so we'll replace it with an **effect** and a new **reducer**.

```javascript
app.model({
  state: {
    todos: []
  },
  reducers: {
    receiveTodos: (state, data) => {
      // ...
    },
    receiveNewTodo: (state, data) => {
      const newTodos = state.todos.slice()
      newTodos.push(data)
      return { todos: newTodos }
    }
  },
  effects: {
    getTodos: (state, data, send, done) => {
      // ...
    },
    addTodo: (state, data, send, done) => {
      const todo = extend(data, {
        completed: false
      })

      store.add('todos', todo, () => {
        send('receiveNewTodo', todo, done)
      })
    }
  }
})
```

You'll see some similarities to the original reducer from earlier. We basically
split the functionality and added in a side effect (`store.add`). Let's do
the same for `updateTodo`.

```javascript
app.model({
  state: {
    todos: []
  },
  reducers: {
    receiveTodos: (state, data) => {
      // ...
    },
    receiveNewTodo: (state, data) => {
      // ...
    },
    replaceTodo: (state, data) => {
      const newTodos = state.todos.slice()
      newTodos[data.index] = data.todo
      return { todos: newTodos }
    }
  },
  effects: {
    getTodos: (state, data, send, done) => {
      // ...
    },
    addTodo: (state, data, send, done) => {
      // ...
    },
    updateTodo: (state, data, send, done) => {
      const oldTodo = state.todos[data.index]
      const newTodo = extend(oldTodo, data.updates)

      store.replace('todos', data.index, newTodo, () => {
        send('replaceTodo', { index: data.index, todo: newTodo }, done)
      })
    }
  }
})
```

Again we're splitting the logic -- we do what's necessary to make an update to
the data store in the **effect**, and then apply it to the application state
in the **reducer**.

When you call `send()`, it looks for both **reducers** _and_ **effects** with
the name of the action. Since our view is already wired up to call
`send('addTodo')` and `send('updateTodo')`, it should all work now! Refresh
the page - you should be able to add items, mark them completed, refresh all
you like and they'll still be there.

Having gone through this tutorial, is there anything you had to re-read a few
times or concepts we took for granted? Please [let us know](https://github.com/yoshuawuyts/workshop-choo/issues/12)
so we can improve the tutorial!

## Full code

```js
const extend = require('xtend')
const choo = require('choo')
const html = require('choo/html')
const app = choo()

app.model({
  state: {
    todos: []
  },
  reducers: {
    receiveTodos: (state, data) => {
      return { todos: data }
    },
    receiveNewTodo: (state, data) => {
      const newTodos = state.todos.slice()
      newTodos.push(data)
      return { todos: newTodos }
    },
    replaceTodo: (state, data) => {
      const newTodos = state.todos.slice()
      newTodos[data.index] = data.todo
      return { todos: newTodos }
    }
  },
  effects: {
    getTodos: (state, data, send, done) => {
      store.getAll('todos', (todos) => {
        send('receiveTodos', todos, done)
      })
    },
    addTodo: (state, data, send, done) => {
      const todo = extend(data, {
        completed: false
      })

      store.add('todos', todo, () => {
        send('receiveNewTodo', todo, done)
      })
    },
    updateTodo: (state, data, send, done) => {
      const oldTodo = state.todos[data.index]
      const newTodo = extend(oldTodo, data.updates)

      store.replace('todos', data.index, newTodo, () => {
        send('replaceTodo', { index: data.index, todo: newTodo }, done)
      })
    }
  }
})

const view = (state, prev, send) => {
  return html`
    <div onload=${() => send('getTodos')}>
      <form onsubmit=${onSubmit}>
        <input type="text" placeholder="New item" id="title">
      </form>
      <ul>
        ${state.todos.map((todo, index) => html`
          <li>
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange=${(e) => {
              const updates = { completed: e.target.checked }
              send('updateTodo', { index: index, updates: updates })
            }} />
            ${todo.title}
          </li>`)}
      </ul>
    </div>`

  function onSubmit (e) {
    const input = e.target.children[0]
    send('addTodo', { title: input.value })
    input.value = ''
    e.preventDefault()
  }
}

app.router([
  ['/', view]
])

const tree = app.start()
document.body.appendChild(tree)

// localStorage wrapper
const store = {
  getAll: (storeName, cb) => {
    try {
      cb(JSON.parse(window.localStorage[storeName]))
    } catch (e) {
      cb([])
    }
  },
  add: (storeName, item, cb) => {
    store.getAll(storeName, (items) => {
      items.push(item)
      window.localStorage[storeName] = JSON.stringify(items)
      cb()
    })
  },
  replace: (storeName, index, item, cb) => {
    store.getAll(storeName, (items) => {
      items[index] = item
      window.localStorage[storeName] = JSON.stringify(items)
      cb()
    })
  }
}
```
