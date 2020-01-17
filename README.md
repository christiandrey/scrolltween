# scrolltween

![](https://img.shields.io/npm/v/scrolltween.svg?style=flat)
![](https://img.shields.io/david/christiandrey/scrolltween.svg?style=flat)
![](https://img.shields.io/bundlephobia/minzip/scrolltween)

ScrollTween is a utility that enables binding of properties of DOM elements to the scroll event and tweening of these properties accordingly.

## Installation

Setup via NPM

```sh
npm install scrolltween --save
```

Setup via Yarn

```sh
yarn add scrolltween
```

ScrollTween ships with four build flavors:

- UMD: index.umd.js
- AMD: index.amd.js
- CommonJS: index.cjs.js
- ES6 module: index.esm.js

In browser environments, include `index.umd.js` in the body tag of an html page as shown below:

```html
<script src="dist/index.umd.js"></script>
```

In node environments, however, import the module as follows.

```js
const ScrollTween = require("scrolltween");
```

or

```js
import ScrollTween from "scrolltween";
```

ScrollTween ships with Typescript definitions for write-time type checking.

## Live demo

Please see live demo at [CodeSandbox](https://codesandbox.io/s/nostalgic-greider-14ymb).

## Quickstart

```js
import ScrollTween from "scrolltween";

ScrollTween.define([
	{
		selector: ".element",
		duration: 20,
		props: {
			rotate: 90,
		},
	},
]).start();
```

## Key Concepts

### TweenableProperties

`TweenableProperties` is an object that defines the properties of a DOM element that are to be tweened in an action. The following properties can be tweened.

| Property        | Type     | Value type |
| --------------- | -------- | ---------- |
| translate       | `number` | increment  |
| translateX      | `number` | increment  |
| translateY      | `number` | increment  |
| translateZ      | `number` | increment  |
| scale           | `number` | increment  |
| scaleX          | `number` | increment  |
| scaleY          | `number` | increment  |
| scaleZ          | `number` | increment  |
| rotate          | `number` | increment  |
| rotateX         | `number` | increment  |
| rotateY         | `number` | increment  |
| rotateZ         | `number` | increment  |
| opacity         | `number` | final      |
| color           | `string` | final      |
| backgroundColor | `string` | final      |
| fontSize        | `number` | final      |

- `increment`: Provide value to be spread across tween range.
- `final`: Provide value at the end of tweening.

Note: Unit of `fontSize` is `px`.

### ScrollTweenAction

A `ScrollTweenAction` describes a DOM element to be tweened, and the tweening configuration. It takes the following shape:

| Property  | Type                  | Description                                                                                                                                            |
| --------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| selector  | `string`              | The DOM element whose properties are to be tweened.                                                                                                    |
| trigger?  | `string`              | Watch this DOM element instead to trigger tween start. Uses the selector element by default.                                                           |
| duration? | `number`              | The total duration of a tweening action. It's defined in `vh`, that is, 1 unit of the viewport height.                                                 |
| delay?    | `number`              | A delay that defines the duration from when the trigger element appears in the viewport to when the actual tweening starts. It's also defined in `vh`. |
| props?    | `TweenableProperties` | The properties of the DOM element that are to be tweened.                                                                                              |

### ScrollTweenInstance

A `ScrollTweenInstance` exposes the following methods:

| Method    | Description                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| start()   | Call this method on a ScrollTweenInstance to begin watching for changes in vertical scroll and start tweening the DOM element. |
| refresh() | Reinitialize the tweening process, typically when the DOM properties of the trigger element have been modified externally.     |
| destroy() | Destroy the ScrollTweenInstance and stop watching for scroll changes.                                                          |

## Overview

ScrollTween provides the following top-level methods:

- `define`
- `sequence`
- `parallel`
- `staggered`
- `fromChildren`
- `raw`

### define

`ScrollTween.define(actions)` allows initial configuration of tweening actions. It returns a `ScrollTweenInstance`.

| Parameter | Type                       | Description                                                                                             |
| --------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| actions   | `Array<ScrollTweenAction>` | A list of actions representing DOM elements to be tweened and their respective tweening configurations. |

### sequence

`ScrollTween.sequence(trigger, actions, delay?)` allows definition of tweening actions that are to be executed sequentially. It returns an array of `ScrollTweenAction`.

| Parameter | Type                       | Description                                                                                             |
| --------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| trigger   | `string`                   | Selector for the DOM element to watch to know when to start sequential tweening.                        |
| actions   | `Array<ScrollTweenAction>` | A list of actions representing DOM elements to be tweened and their respective tweening configurations. |
| delay?    | `number`                   | An optional length of scroll time that should be added before tweening starts. It's defined in `vh`.    |

### parallel

`ScrollTween.parallel(trigger, actions, delay?)` allows definition of tweening actions that are to be executed in parallel. It returns an array of `ScrollTweenAction`.

| Parameter | Type                       | Description                                                                                             |
| --------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| trigger   | `string`                   | Selector for the DOM element to watch to know when to start sequential tweening.                        |
| actions   | `Array<ScrollTweenAction>` | A list of actions representing DOM elements to be tweened and their respective tweening configurations. |
| delay?    | `number`                   | An optional length of scroll time that should be added before tweening starts. It's defined in `vh`.    |

### staggered

`ScrollTween.staggered(trigger, stagger, actions, delay?)` allows definition of tweening actions that are to be executed in parallel, but with successive delays. It returns an array of `ScrollTweenAction`.

| Parameter | Type                       | Description                                                                                             |
| --------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| trigger   | `string`                   | Selector for the DOM element to watch to know when to start sequential tweening.                        |
| stagger   | `number`                   | The delay between each action.                                                                          |
| actions   | `Array<ScrollTweenAction>` | A list of actions representing DOM elements to be tweened and their respective tweening configurations. |
| delay?    | `number`                   | An optional length of scroll time that should be added before tweening starts. It's defined in `vh`.    |

### fromChildren

`ScrollTween.fromChildren(parent, duration, props)` is a utility function that generates a list of `ScrollTweenAction` from the direct children of a DOM element. It returns an array of `ScrollTweenAction`.

| Parameter | Type                                               | Description                                                                                                                                                                                                |
| --------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| parent    | `string`                                           | Selector for the parent DOM element.                                                                                                                                                                       |
| duration  | `number`                                           | Duration to be applied to each action                                                                                                                                                                      |
| props     | `TweenableProperties | Array<TweenableProperties>` | An object or an Array containing properties to be tweened. When an array of `TweenableProperties` is provided, the index of the child DOM element is used to get its `TweenableProperties` from the array. |

### raw

`ScrollTween.raw(action, callback)` calls a callback with a value between 0 and 1, representing the tween state. This will typically be used for tweening instances not covered by ScrollTween. It's optimized and only calls the callback with a new value only if the value has changed. It returns a `ScrollTweenInstance` that is auto-started and can also be refreshed and destroyed.

| Parameter | Type                         | Description                                                                         |
| --------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| action    | `Partial<ScrollTweenAction>` | Defines `trigger`, `duration` and optionally `delay`.                               |
| callback  | `(value: number) => void`    | A function to be called with the tween value (between 0 and 1) whenever it changes. |

## License

MIT © christiandrey
