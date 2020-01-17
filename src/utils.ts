const getViewportHeight = () => {
	return window.innerHeight ?? document.documentElement.clientHeight ?? document.body.clientHeight;
};

const getElementOffset = (element: HTMLElement) => {
	var rect = element.getBoundingClientRect(),
		scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
		scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
};

const normalizeColor = (color: string) => color.replace(/\s+/g, "");

const normalizeFontSize = (fontSize: string) => Number(fontSize.replace("px", ""));

export { getViewportHeight, getElementOffset, normalizeColor, normalizeFontSize };
