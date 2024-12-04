<div align="center">
  <img width="180" alt="React Beaker Store icon" src="https://raw.githubusercontent.com/react-beaker-store/react-beaker-store/refs/heads/main/beaker.png"/>
</div>

<div align="center">
  <a href="https://www.npmjs.com/package/react-beaker-store" target="_blank" rel="noopener noreferrer">
    <img alt="npm" src="https://img.shields.io/badge/npm-v0.1.1-5c5c5c?logo=npm&labelColor=d40100"/>
  </a>
  <img alt="npm" src="https://img.shields.io/badge/tests-passing-29aa47?logo=jest"/>
  <img alt="npm" src="https://img.shields.io/badge/coverage-97%25-29aa47?logo=jest"/>
</div>

# React Beaker Store
Intuitive and reactive state management library for React apps.

## Installation
```bash
# or pnpm or yarn
npm install react-beaker-store
```

## Usage

### Create a Beaker Store
You can create as many beaker stores as you want, it is recommended for each to be defined in a separate file:

```js
const beaker = createBeaker({
  state: { // this will be your initial state
    counter: 0,
    someData: ''
  },
  actions: {    
    // beaker is "magically" reactive to state changes applied inside actions    
    increment(){
       // `this` is the beaker store instance, just like it was defined!
      this.state.counter += 1;
    },
    setSomeData(newSomeData){
      this.state.someData = newSomeData;
    }
  }
});
```

### Connect a Beaker Store to a React component
You need to add `useBeakerState()` hook to your components to start reacting.
```js
function MyComponent() {
  // this hook will make this component reactive to the beaker
  const { counter } = useBeakerState(beaker);
  return (
    <button onClick={beaker.actions.increment}>
      {counter}
    </button>
  );
}
```

### Using Async Actions
In the following snippet you can find an example of how async actions can be implemented:
```js
// define a beaker
const beaker = createBeaker({
  state: {
    loading: false,
    error: null,
    result: null    
  },
  actions: {    
    async loadData(){
      try {
        this.state.loading = true; // this will inform all the components the process is loading
        const response = await fetch('https://api.example.com/v1/some-data');
        if (!response.ok) throw Error(`Received response with status code ${response.status}`)
        this.state.result = await response.json(); // get the good stuff the process has been waiting for!
      } catch (error) {
        this.state.error = error; // in case an error occurs
      } finally {
        this.state.loading = false; // this will inform all the components the process has finished
      }
    }
  }
});

// define a component
function MyComponent() {
  const { loading, error, result } = useBeakerState(beaker); // remember to connect the component to the beaker using the hook!

  useEffect(() => {
    beaker.actions.loadData(); // trigger the action as soon as the component is mounted!
  }, []);

  return (
    <div>
      {/* show the error message in case error occurs */}
      {error && <div>Unfortunately an error occurred</div>}

      {/* show a loading message while loading */}
      {loading && <div>The content is loading...</div>}

      {/* when the result is ready, display it! */}
      {result && <div>{result}</div> } 
    </div>
  );
}

```

### Use Beaker Store from anywhere in your code
Beakers not only work with React components, you can change their state or call their actions from anywhere in your application.
```js
async function getDataFromApi() {
  const response = await fetch('https://api.example.com/v1/some-data');
  const json = await response.json();
  beaker.actions.setSomeData(json.data); // this will make any components connected to store react to data changes!
}
```

#### Manually committing changes to trigger required updates to components.
Imagine you want to give progressive insights about the state of a process happening in your app. Beakers are flexible enough to help you with that!
```js
async function getDataFromApi() {
  beaker.state.loading = true;
  beaker.commit(); // this will schedule a notification for the connected React components

  const response = await fetch('https://api.example.com/v1/some-data');
  const json = await response.json();

  beaker.state.someData = json.data; // you can change the state from anywhere outside of actions if you want, just don't forget to call commit() right after;
  beaker.state.loading = false;
  beaker.commit(); // schedule another notification to announce a change occurred
}
```

#### Listening to Beaker Store changes outside of React components
What if you needed to run a process when some state is met, but that code simply does not belong inside a React component? Beaker got you covered!
```js
function validateState() {
  // check if there is something wrong with the new state and potentially trigger actions or commit changes to fix it!
}
beaker.subscribe(validateState);

// you can also unsubscribe anytime by calling
beaker.unsubscribe(validateState);
```

## FAQ
**Why should I use `react-beaker-store` instead of `redux`, `mobx`, `recoil` or the `react context api`?**\
You are free to use any solution you prefer, but we would recommend it for:
- Developers creating new apps and looking to keep their code simple and understandable to other devs.
- Developers building code bases which must be scalable and flexible to changes from many people.
- Developers who want to avoid excessively large and hard to maintain boilerplates in their code.
- Developers wanting to avoid complex configurations in their apps which are easy to break or misuse by other devs.

**How does `react-beaker-store` really work?**\
`react-beaker-store` is powered by [Immer](https://github.com/immerjs/immer).

**What inspired `react-beaker-store`?**\
The idea for this project came thanks to [`pinia`](https://github.com/vuejs/pinia), which is fantastic state management solution for Vue apps, if you already know pinia you can't unsee the similarities.

**Can I contribute to this project?**\
Off course! any ideas, improvements and pull requests are welcome!

## License
[MIT](http://opensource.org/licenses/MIT)