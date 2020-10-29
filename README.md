[![react-flow](https://user-images.githubusercontent.com/2857535/95224198-b2540000-07fa-11eb-832d-361d72d60345.jpg)](https://reactflow.dev)

# React Flow

React Flow is a library for building node-based graphs. You can easily implement custom node types and it comes with components like a mini-map and graph controls. Feel free to check out the [examples](https://reactflow.dev/) or read the [blog post](https://webkid.io/blog/react-flow-node-based-graph-library/) to get started.

- **Website:** https://reactflow.dev
- **Documentation:** https://reactflow.dev/docs
- **Examples:** https://reactflow.dev/examples

## Key Features

* **Easy to use:** Seamless zooming & panning behaviour and single and multi-selections of elements
* **Customizable:** Different [node](#node-types--custom-nodes) and [edge types](#edge-types--custom-edges) and support for custom nodes with multiple handles and custom edges
* **Fast rendering:** Only nodes that have changed are re-rendered and only those that are in the viewport are displayed
* **Utils:** Snap-to-grid and graph [helper functions](#helper-functions)
* **Components:** [Background, Minimap and Controls](#components)
* **Reliable**: Written in [Typescript](https://www.typescriptlang.org/) and tested with [cypress](https://www.cypress.io/)

# Installation

```
npm install react-flow-renderer
```

# Quick Start

This is a very basic example of how to use React Flow. There are more advanced examples in the [example](/example/src) folder.

```javascript
import React from 'react';
import ReactFlow from 'react-flow-renderer';

const elements = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  // you can also pass a React component as a label
  { id: '2', data: { label: <div>Node 2</div> }, position: { x: 100, y: 100 } },
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

const BasicFlow = () => <ReactFlow elements={elements} />;
```

# Development

You need to install the React Flow dependencies via `npm install` and the ones of the examples `cd example && npm install`.

If you want to contribute or develop some custom features the easiest way is to start the dev server:

```
npm run dev
```

This serves the content of the `example` folder and watches changes inside the `src` folder. The examples are using the source of the `src` folder.

# Testing

Testing is done with cypress. You can find the tests in the [`integration/flow`](/cypress/integration/flow) folder. In order to run the tests do:

```
npm run test
```

# Support

If you need custom support or features for your application we are [happy to hear from you](https://webkid.io/contact).

## Thanks!

Special thanks to [Andy Lindemann](https://github.com/AndyLnd) for a lot of helpful contributions!

---

React Flow was initially developed by [webkid](https://webkid.io), a data visualization company from Berlin. If you need help or want to develop react-based tools or data visualizations, get in touch!
