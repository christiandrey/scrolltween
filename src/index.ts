import finder from '@medv/finder';

import { ScrollTweenInstance, ScrollTweenRawInstance } from './classes';
import { ScrollTweenAction, TweenableProperties } from './types';

const defineScrollTweenActions = (actions: Array<ScrollTweenAction>) => {
	return new ScrollTweenInstance(actions);
};

const getActionsForParallelTweening = (trigger: string, actions: Array<ScrollTweenAction>, delay = 0): Array<ScrollTweenAction> => {
	return actions.map(o => ({ ...o, trigger, delay: delay ?? o.delay }));
};

const getActionsForStaggeredTweening = (trigger: string, stagger: number, actions: Array<ScrollTweenAction>, delay = 0): Array<ScrollTweenAction> => {
	return actions.map((o, i) => ({
		...o,
		trigger,
		delay: i * stagger + delay,
	}));
};

const getActionsForSequenceTweening = (trigger: string, actions: Array<ScrollTweenAction>, delay = 0): Array<ScrollTweenAction> => {
	return actions.map((o, i, c) => ({
		...o,
		trigger,
		delay: (i === 0 ? 0 : c.slice(0, i).reduce((acc, cur) => acc + cur.duration, 0)) + delay,
	}));
};

const getActionsForChildrenOfElement = (parent: string, duration: number, props: TweenableProperties | Array<TweenableProperties>): Array<ScrollTweenAction> => {
	const parentElement = document.querySelector(parent);
	const children = parentElement?.children;

	if (!children || children.length === 0 || !props) return [];

	const useGroupProps = Array.isArray(props);
	const actions = [];

	Array.from(children).forEach((o, i) => {
		const selector = finder(o);
		const action = {
			selector,
			duration,
			props: useGroupProps ? props[i] ?? {} : props,
		};
		actions.push(action);
	});

	return actions;
};

const getRawTweenValues = (action: Partial<ScrollTweenAction>, callback: (value: number) => void): ScrollTweenRawInstance => {
	const scrollTweenRawInstance = new ScrollTweenRawInstance(action, callback);
	scrollTweenRawInstance.start();

	return scrollTweenRawInstance;
};

export const define = defineScrollTweenActions;
export const parallel = getActionsForParallelTweening;
export const staggered = getActionsForStaggeredTweening;
export const sequence = getActionsForSequenceTweening;
export const fromChildren = getActionsForChildrenOfElement;
export const raw = getRawTweenValues;

const ScrollTween = {
	define,
	parallel,
	staggered,
	sequence,
	fromChildren,
	raw,
};

export default ScrollTween;
