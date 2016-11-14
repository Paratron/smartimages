/**
 * SmartImages
 * ===========
 * SmartImages provides multiple functions:
 *
 * - Loading retina images when necessary and/or possible
 * - Making image sources responsive by swapping image sources on a predefined breakpoint.
 * - Adding lazy loading to images to only load when they come near the viewport.
 *
 * @author: Christian Engel <hello@wearekiss.com>
 * @version: 2.1 (14.11.2016)
 */
(function () {
    'use strict';

    var isRetina,
        isMobile,
        smartImages,
        scrollTimeout,
        autoInit = true,
        scrollListening = false,
        hasLazyImages = false;

    isRetina = window.matchMedia('(-webkit-min-device-pixel-ratio: 1.25),(min-resolution: 120dpi)').matches;

    smartImages = window.smartImages = window.smartImages || {};
    smartImages.mediaQuery = smartImages.mediaQuery || '(max-width: 650px)';

    function responsiveHandler(e) {
        isMobile = e.matches;
        processImages();
    }

    function assign(img, scrollTop, lazyBorder, force, justSrc) {
        if(img.getAttribute('data-smart-ignore') !== null && !force){
            return;
        }

        var o = {
            src1x: img.getAttribute('data-src'),
            src2x: img.getAttribute('data-src-2x'),
            src1x_mobile: img.getAttribute('data-src-mobile'),
            src2x_mobile: img.getAttribute('data-src-mobile-2x'),
            lazy: img.getAttribute('data-lazy') !== null
        };

        var src = o.src1x;

        if (isMobile) {
            if (o.src1x_mobile !== null) {
                src = o.src1x_mobile;
            }

            if (isRetina) {
                if (o.src2x_mobile !== null) {
                    src = o.src2x_mobile;
                } else {
                    if (o.src2x !== null) {
                        src = o.src2x;
                    }
                }
            }
        } else {
            if (isRetina && o.src2x !== null) {
                src = o.src2x;
            }
        }

        if (o.lazy) {
            hasLazyImages = true;

            if (scrollTop + img.getBoundingClientRect().top > lazyBorder) {
                return;
            }
        }

        if(justSrc){
            return src || '';
        }

        if (src === null) {
            return;
        }

        img.src = src;
    }

    function processImages() {
        var scrollTop, lazyBorder;

        scrollTop = document.body.scrollTop;
        lazyBorder = scrollTop + (window.innerHeight * 1.5);

        for (var i = 0; i < document.images.length; i++) {
            assign(document.images[i], scrollTop, lazyBorder, false, false);
        }

        if (hasLazyImages && !scrollListening) {
            scrollListening = true;
            window.addEventListener('scroll', function () {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(processImages, 100);
            });
        }
    }

    /**
     * This processes all images on the page for the first time and also sets up
     * the event listener for the media query to react on scaling.
     */
    smartImages.init = function () {
        processImages();

        //React on the mobile media query and attach event listeners.
        var responsiveQuery = window.matchMedia(smartImages.mediaQuery);
        responsiveHandler(responsiveQuery);
        responsiveQuery.addListener(responsiveHandler);

        console.log('Images are smart, now.');
    };

    /**
     * Prevent the automatic initialization and replacement of all image sources in the document.
     */
    smartImages.noAutoInit = function () {
        autoInit = false;
    };

    /**
     * Manually perform the assignation of the smart image source ONCE on the given element.
     * @param elm
     */
    smartImages.manualAssign = function(elm){
        assign(elm, 0, 0, true, false);
    };

    /**
     * Just get the the source that would currently apply for an image without setting it.
     * @param elm
     * @returns string
     */
    smartImages.getSrc = function(elm){
        return assign(elm, 0, 0, true, true);
    };

    window.addEventListener('load', function(){
        if(autoInit === true){
            smartImages.init();
        }
    });
})();

