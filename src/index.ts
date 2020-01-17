import finder from '@medv/finder';

import { ScrollTweenInstance, ScrollTweenRawInstance } from './classes';

// -----------------------------------------------------------
// TYPES
// -----------------------------------------------------------
export type TweenableProperties = Partial<{
	translate: number;
	translateX: number;
	translateY: number;
	translateZ: number;
	scale: number;
	scaleX: number;
	scaleY: number;
	scaleZ: number;
	rotate: number;
	rotateX: number;
	rotateY: number;
	rotateZ: number;
	opacity: number;
	color: string;
	backgroundColor: string;
	fontSize: number;
}>;

export type ScrollTweenAction = {
	selector: string;
	trigger?: string;
	duration?: number;
	delay?: number;
	props?: TweenableProperties;
};

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
		delay: i * stagger,
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

export default {
	define: defineScrollTweenActions,
	parallel: getActionsForParallelTweening,
	staggered: getActionsForStaggeredTweening,
	sequence: getActionsForSequenceTweening,
	fromChildren: getActionsForChildrenOfElement,
	raw: getRawTweenValues,
};
