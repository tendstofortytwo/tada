for(const link of document.querySelectorAll('a')) {
    link.setAttribute('target', '_blank');
}

const sliders = [];

function Slider(slider, opts = {}) {
    const {
        // determines how slides are shown.
        // 'single' => one slide (slide n) visible at a time
        // 'multi' => slides [0, n] visible at the same time
        slideVisibility,

        // if true, slider starts with first slide hidden
        startWithFirstHidden,

        // index of the first slide visible in this slider
        // only applies to constructor
        startIndex
    } = opts;
    const slides = slider.children;
    let n = startWithFirstHidden ? -1 : (startIndex || 0);

    const show = () => {
        if(n >= 0 && n < slides.length) slides[n].classList.add('visible');
    }
    const hide = () => {
        if(n >= 0 && n < slides.length) slides[n].classList.remove('visible');
    }

    this.next = () => {
        // try to advance a child slider, if it exists
        if(n >= 0 && n < slides.length) {
            for(const c of slides[n].querySelectorAll('.slider')) {
                if(sliders[Number(c.getAttribute('data-slider-id'))].next()) {
                    return true;
                }
            }
            if(slides[n].classList.contains('slider')) {
                if(sliders[Number(slides[n].getAttribute('data-slider-id'))].next()) {
                    return true;
                }
            }
        }

        // make next slide visible, if there is one
        if(n < slides.length-1) {
            if(slideVisibility === 'single') hide();
            n++;
            show();
            return true;
        }

        // report that no change was made
        return false;
    }

    this.prev = () => {
        // try to rewind a child slider, if it exists
        if(n >= 0 && n < slides.length) {
            // TODO: querySelectorAll does a depth-first search, and a reversal
            // of a DFS is not a DFS starting from reverse. Canonicalize this
            // traversal order between next() and prev() somehow?
            for(const c of [...slides[n].querySelectorAll('.slider')].reverse()) {
                if(sliders[Number(c.getAttribute('data-slider-id'))].prev()) {
                    return true;
                }
            }
            if(slides[n].classList.contains('slider')) {
                if(sliders[Number(slides[n].getAttribute('data-slider-id'))].prev()) {
                    return true;
                }
            }
        }

        // make previous slide visible, if there is one
        if(n > 0 || (n === 0 && startWithFirstHidden)) {
            hide();
            n--;
            show();
            return true;
        }

        // report that no change was made
        return false;
    }

    this.childrenSliders = [];

    show();
}

for(const slider of document.querySelectorAll('.slider')) {
    let idx = sliders.length;
    sliders.push(new Slider(slider, {
        slideVisibility: slider.getAttribute('data-visibility') || slider.classList.contains('multi') ? 'multi' : 'single',
        startWithFirstHidden: slider.hasAttribute('data-start-first-hidden') || slider.classList.contains('first-hidden'),
        startIndex: Number(slider.getAttribute('data-start-idx')) || 0,
        sliderID: idx,
    }));
    slider.setAttribute('data-slider-id', idx);
}

document.body.addEventListener('keyup', e => {
    switch(e.key) {
    case 'ArrowRight':
    case ' ':
    case 'Enter':
        if(e.shiftKey) sliders[0].prev();
        else sliders[0].next();
        break;
    case 'ArrowLeft':
        sliders[0].prev();
    }
})