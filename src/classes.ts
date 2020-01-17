import memoize from 'fast-memoize';
import interpolate from 'polate-js';
import * as Rematrix from 'rematrix';

import { getElementOffset, getViewportHeight, normalizeColor, normalizeFontSize } from './utils';

import type { ScrollTweenAction } from '.';

class ScrollTweenInstance {
	private _scrollPosition: number;
	private _isTicking: boolean;
	private _viewportHeight: number;
	private _actions: Array<ScrollTweenAction>;

	private static _nonTransformProps = ["opacity", "color", "backgroundColor", "fontSize"];

	private _transforms: Map<string, Array<number>>;
	private _opacities: Map<string, number>;
	private _colors: Map<string, string>;
	private _backgroundColors: Map<string, string>;
	private _fontSizes: Map<string, number>;
	private _topOffsets: Map<string, number>;

	private _onScroll = () => {
		this._scrollPosition = window.scrollY;

		if (!this._isTicking) {
			window.requestAnimationFrame(() => {
				this._tick();
				this._isTicking = false;
			});
			this._isTicking = true;
		}
	};

	private _tick = () => {
		this._actions.forEach(action => this._runAction(action, this._scrollPosition));
	};

	private _runAction = (action: ScrollTweenAction, scrollPosition: number) => {
		const element: HTMLElement = document.querySelector(action.selector);
		const styleChanges = this._getStyleChanges(action, scrollPosition);

		Object.keys(styleChanges).forEach(o => {
			element.style[o] = styleChanges[o];
		});
	};

	private _getStyleChangesUnOptimized = (action: ScrollTweenAction, scrollPosition: number) => {
		const { selector, props, duration, delay } = action;
		const trigger = action.trigger ?? selector;

		const tweenState = this._getTweenState(trigger, duration, delay ?? 0, scrollPosition);
		const styleChanges = {};
		let elementTransforms = [this._transforms.get(selector)];

		Object.keys(props).forEach(prop => {
			if (ScrollTweenInstance._nonTransformProps.includes(prop)) {
				switch (prop) {
					case "opacity":
						styleChanges["opacity"] = this._getNonTransformProp(this._opacities.get(selector), props[prop], tweenState);
						break;
					case "color":
						styleChanges["color"] = this._getNonTransformProp(this._colors.get(selector), normalizeColor(props[prop]), tweenState);
						break;
					case "backgroundColor":
						styleChanges["backgroundColor"] = this._getNonTransformProp(this._backgroundColors.get(selector), normalizeColor(props[prop]), tweenState);
						break;
					case "fontSize":
						styleChanges["fontSize"] = this._getNonTransformProp(this._fontSizes.get(selector), props[prop], tweenState);
						break;
					default:
						break;
				}
				return;
			}
			const propValue = props[prop];
			const computedPropValue = prop.startsWith("scale") ? 1 + propValue * tweenState : propValue * tweenState;
			elementTransforms.push(Rematrix[prop](computedPropValue));
		});

		styleChanges["transform"] = Rematrix.toString(elementTransforms.reduce(Rematrix.multiply));

		return styleChanges;
	};

	private _getStyleChanges = memoize(this._getStyleChangesUnOptimized);

	private _getTweenState = (trigger: string, duration: number, delay: number, scrollPosition: number) => {
		const elementOffsetTop = this._topOffsets.get(trigger);
		let lowerLimit: number, solveFor: number;

		if (elementOffsetTop <= this._viewportHeight) {
			lowerLimit = 0;
			solveFor = scrollPosition;
		} else {
			lowerLimit = elementOffsetTop;
			solveFor = scrollPosition + this._viewportHeight;
		}
		lowerLimit = lowerLimit + (delay * this._viewportHeight) / 100;
		const upperLimit = lowerLimit + (duration * this._viewportHeight) / 100;

		if (solveFor <= lowerLimit) return 0;
		if (solveFor >= upperLimit) return 1;

		return Number(
			interpolate(solveFor, {
				inputRange: [lowerLimit, upperLimit],
				outputRange: [0, 1],
				extrapolate: "clamp",
			})
		);
	};

	private _getNonTransformProp = (lowerLimit: string | number, upperLimit: string | number, tweenState: number) => {
		if (tweenState <= 0) return lowerLimit;
		if (tweenState >= 1) return upperLimit;

		return interpolate(tweenState, {
			inputRange: [0, 1],
			outputRange: [lowerLimit, upperLimit],
			extrapolate: "clamp",
		});
	};

	start() {
		window.addEventListener("scroll", this._onScroll);
	}

	refresh() {
		this._actions.forEach(({ selector, trigger }) => {
			trigger = trigger ?? selector;
			const triggerElement: HTMLElement = document.querySelector(trigger);
			const top = getElementOffset(triggerElement).top;
			this._topOffsets.set(trigger, top);
		});
		this._tick();
	}

	destroy() {
		window.removeEventListener("scroll", this._onScroll);
	}

	/**
	 *
	 */
	constructor(actions: Array<ScrollTweenAction>) {
		this._scrollPosition = 0;
		this._isTicking = false;
		this._viewportHeight = getViewportHeight();
		this._actions = actions;

		this._transforms = new Map();
		this._opacities = new Map();
		this._colors = new Map();
		this._backgroundColors = new Map();
		this._fontSizes = new Map();
		this._topOffsets = new Map();

		actions.forEach(({ selector, trigger }) => {
			trigger = trigger ?? selector;
			const element: HTMLElement = document.querySelector(selector);
			const triggerElement: HTMLElement = document.querySelector(trigger);
			const computedStyle = window.getComputedStyle(element);
			const { transform, opacity, color, backgroundColor, fontSize } = computedStyle;
			const transformMatrix = Rematrix.fromString(transform);
			const top = getElementOffset(triggerElement).top;

			this._transforms.set(selector, transformMatrix);
			this._opacities.set(selector, Number(opacity));
			this._colors.set(selector, normalizeColor(color));
			this._backgroundColors.set(selector, normalizeColor(backgroundColor));
			this._fontSizes.set(selector, normalizeFontSize(fontSize));
			this._topOffsets.set(trigger, top);
		});
	}
}

class ScrollTweenRawInstance {
	private _scrollPosition: number;
	private _isTicking: boolean;
	private _viewportHeight: number;
	private _callback: (value: number) => void;
	private _elementOffsetTop: number;
	private _config: Partial<ScrollTweenAction>;
	private _tweenState: number;

	private _onScroll = () => {
		this._scrollPosition = window.scrollY;

		if (!this._isTicking) {
			window.requestAnimationFrame(() => {
				this._tick();
				this._isTicking = false;
			});
			this._isTicking = true;
		}
	};

	private _tick = () => {
		const { duration, delay } = this._config;
		const tweenState = this._getTweenState(duration, delay, this._scrollPosition);

		if (tweenState !== this._tweenState) {
			this._callback(tweenState);
			this._tweenState = tweenState;
		}
	};

	private _getTweenStateUnoptimized = (duration: number, delay: number, scrollPosition: number) => {
		const elementOffsetTop = this._elementOffsetTop;
		let lowerLimit: number, solveFor: number;

		if (elementOffsetTop <= this._viewportHeight) {
			lowerLimit = 0;
			solveFor = scrollPosition;
		} else {
			lowerLimit = elementOffsetTop;
			solveFor = scrollPosition + this._viewportHeight;
		}
		lowerLimit = lowerLimit + (delay * this._viewportHeight) / 100;
		const upperLimit = lowerLimit + (duration * this._viewportHeight) / 100;

		if (solveFor <= lowerLimit) return 0;
		if (solveFor >= upperLimit) return 1;

		return Number(
			interpolate(solveFor, {
				inputRange: [lowerLimit, upperLimit],
				outputRange: [0, 1],
				extrapolate: "clamp",
			})
		);
	};

	private _getTweenState = memoize(this._getTweenStateUnoptimized);

	start() {
		window.addEventListener("scroll", this._onScroll);
	}

	refresh() {
		const { trigger } = this._config;
		const element: HTMLElement = document.querySelector(trigger);
		const top = getElementOffset(element).top;

		this._elementOffsetTop = top;
		this._tick();
	}

	destroy() {
		window.removeEventListener("scroll", this._onScroll);
	}

	/**
	 *
	 */
	constructor(action: Partial<ScrollTweenAction>, callback: (value: number) => void) {
		const { trigger, duration, delay } = action;
		this._scrollPosition = 0;
		this._isTicking = false;
		this._viewportHeight = getViewportHeight();
		this._callback = callback;

		const element: HTMLElement = document.querySelector(trigger);
		const top = getElementOffset(element).top;

		this._elementOffsetTop = top;
		this._config = { trigger, duration, delay: delay ?? 0 };
	}
}

export {
   ScrollTweenInstance,
   ScrollTweenRawInstance
}