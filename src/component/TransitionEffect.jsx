import { forwardRef } from 'react';
import { Slide, Grow, Zoom } from '@mui/material';

export const SlideDownTransition = forwardRef(function SlideDownTransition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export const SlideUpTransition = forwardRef(function SlideUpTransition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const SlideLeftTransition = forwardRef(function SlideLeftTransition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

export const SlideRightTransition = forwardRef(function SlideRightTransition(props, ref) {
    return <Slide direction="right" ref={ref} {...props} />;
});

// Bonus: a couple of other MUI transition styles, wrapped the same way,
// in case you want to try something other than slide later.
export const GrowTransition = forwardRef(function GrowTransition(props, ref) {
    return <Grow ref={ref} {...props} />;
});

export const ZoomTransition = forwardRef(function ZoomTransition(props, ref) {
    return <Zoom ref={ref} {...props} />;
});