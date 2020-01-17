// -----------------------------------------------------------
// TYPES
// -----------------------------------------------------------
type TweenableProperties = Partial<{
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

type ScrollTweenAction = {
	selector: string;
	trigger?: string;
	duration?: number;
	delay?: number;
	props?: TweenableProperties;
};

export { TweenableProperties, ScrollTweenAction };
