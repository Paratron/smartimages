/**
 * SmartImages
 * ===========
 * SmartImages provides multiple functions:
 *
 * - Loading retina images when necessary and/or possible
 * - Making image sources responsive by swapping image sources on a predefined breakpoint.
 * - Adding lazy loading to images to only load when they come near the viewport.
 * - Added option to pre-define the future image sizes so the layout will be preserved for lazy images.
 * - Implemented functionality for background images of containers.
 * - Implemented functionality of custom query and source
 *
 * @url: https://github.com/Paratron/smartimages
 * @author: Christian Engel <hello@wearekiss.com>
 * @version: 2.4 (28.12.2016)
 */
(function () {
    'use strict';

    var isRetina,
        isMobile,
        initDone = false,
        smartImages,
        scrollTimeout,
        autoInit = true,
        scrollListening = false,
        hasLazyImages = false,
        hasLazyContainers = false,
        customQueries = {};

    isRetina = window.matchMedia('(-webkit-min-device-pixel-ratio: 1.25),(min-resolution: 120dpi)').matches;

    smartImages = window.smartImages = window.smartImages || {};
    smartImages.mediaQuery = smartImages.mediaQuery || '(max-width: 650px)';

    function responsiveHandler(e) {
        isMobile = e.matches;

        var scrollTop, lazyBorder;

        scrollTop = document.body.scrollTop;
        lazyBorder = scrollTop + (window.innerHeight * 1.5);

        processImages(scrollTop, lazyBorder);
        processContainers(scrollTop, lazyBorder);
    }

    /**
     * Attached to custom queries.
     * @param elm
     */
    function customResponsiveHandler(elm) {
        var scrollTop, lazyBorder;

        scrollTop = document.body.scrollTop;
        lazyBorder = scrollTop + (window.innerHeight * 1.5);

        if(elm.nodeName === 'IMG'){
            assignImg(elm, scrollTop, lazyBorder, false, false);
            return;
        }
        assignContainer(elm, scrollTop, lazyBorder, false, false);
    }

    /**
     * This detects the currently correct src / background of the given element and returns it.
     * @param elm
     * @param scrollTop
     * @param lazyBorder
     * @param justSrc
     * @returns {*}
     */
    function getSrc(elm, scrollTop, lazyBorder, justSrc) {
        var o = {
            src1x: elm.getAttribute('data-src'),
            src2x: elm.getAttribute('data-src-2x'),
            src1x_mobile: elm.getAttribute('data-src-mobile'),
            src2x_mobile: elm.getAttribute('data-src-mobile-2x'),
            size1x: elm.getAttribute('data-size'),
            size2x: elm.getAttribute('data-size-2x'),
            size1x_mobile: elm.getAttribute('data-size-mobile'),
            size2x_mobile: elm.getAttribute('data-size-mobile-2x'),
            custom: elm.getAttribute('data-src-custom'),
            customQuery: elm.getAttribute('data-match-custom-id'),
            customSize: elm.getAttribute('data-size-custom'),
            lazy: elm.getAttribute('data-lazy') !== null
        };

        if (o.size1x) {
            o.size1x = o.size1x.split('x');
        }
        if (o.size2x) {
            o.size2x = o.size2x.split('x');
        }
        if (o.size1x_mobile) {
            o.size1x_mobile = o.size1x_mobile.split('x');
        }
        if (o.size2x_mobile) {
            o.size2x_mobile = o.size2x_mobile.split('x');
        }

        var src = o.src1x,
            size = o.size1x;

        if (isMobile) {
            if (o.src1x_mobile !== null) {
                src = o.src1x_mobile;
                size = o.size1x_mobile;
            }

            if (isRetina) {
                if (o.src2x_mobile !== null) {
                    src = o.src2x_mobile;
                    size = o.size2x_mobile;
                } else {
                    if (o.src2x !== null) {
                        src = o.src2x;
                        size = o.size2x;
                    }
                }
            }
        } else {
            if (isRetina && o.src2x !== null) {
                src = o.src2x;
                size = o.size2x;
            }
        }

        if (o.custom && o.customQuery) {
            if (customQueries[o.customQuery].matches) {
                src = o.custom;
                size = o.customSize;
            }
        }

        if (o.lazy) {
            if (elm instanceof Image) {
                hasLazyImages = true;
            } else {
                hasLazyContainers = true;
            }

            if (scrollTop + elm.getBoundingClientRect().top > lazyBorder) {
                if (size && !elm.getAttribute('data-dummy')) {
                    elm.setAttribute('data-dummy', '1');
                    return getDummy(size);
                }
                return null;
            }
        }

        if (justSrc) {
            return src || '';
        }

        if (src === null) {
            return null;
        }

        return src;
    }

    /**
     * This finds and applies the currently correct background of an container.
     * @param elm
     * @param scrollTop
     * @param lazyBorder
     * @param force
     * @param justSrc
     */
    function assignContainer(elm, scrollTop, lazyBorder, force, justSrc) {
        if (elm.getAttribute('data-smart-ignore') !== null && !force) {
            return;
        }

        var src = getSrc(elm, scrollTop, lazyBorder, justSrc);

        if (src !== null) {
            elm.style.backgroundImage = src;
        }
    }

    /**
     * This finds and applies the currently correct src of an image element.
     * @param img
     * @param scrollTop
     * @param lazyBorder
     * @param force
     * @param justSrc
     */
    function assignImg(img, scrollTop, lazyBorder, force, justSrc) {
        if (img.getAttribute('data-smart-ignore') !== null && !force) {
            return;
        }

        var src = getSrc(img, scrollTop, lazyBorder, justSrc);

        if (src !== null) {
            img.src = src;
        }
    }

    /**
     * This method creates a transparent dummy image with the given dimensions and
     * returns the result as data URL.
     * @type {Element}
     */
    var dummyCvs = document.createElement('canvas');

    function getDummy(size) {
        dummyCvs.width = size[0];
        dummyCvs.height = size[1];
        return dummyCvs.toDataURL();
    }

    /**
     * This loops over all images in the document and enables their smart functionality.
     * This is being called from within the init() method.
     * @param scrollTop
     * @param lazyBorder
     */
    function processImages(scrollTop, lazyBorder) {
        var img, imgId;

        for (var i = 0; i < document.images.length; i++) {
            img = document.images[i];

            if (img.getAttribute('data-match-custom') && !img.getAttribute('data-match-custom-id')) {
                imgId = Math.random().toString().split('.')[1];
                img.setAttribute('data-match-custom-id', imgId);
                customQueries[imgId] = window.matchMedia(img.getAttribute('data-match-custom'));
                customQueries[imgId].addListener(function () {
                    customResponsiveHandler(img);
                });
            }

            assignImg(img, scrollTop, lazyBorder, false, false);
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
     * This selects any container with the "data-smartImageContainer" attribute and enables
     * smart background functionality on them.
     * This is being called from within the init() method.
     * @param scrollTop
     * @param lazyBorder
     */
    function processContainers(scrollTop, lazyBorder) {
        var elm, elmId;

        var elms = document.querySelectorAll('[data-smartImageContainer]');

        for (var i = 0; i < elms.length; i++) {
            elm = elms[i];

            if (elm.getAttribute('data-match-custom') && !elm.getAttribute('data-match-custom-id')) {
                var imgId = Math.random().toString().split('.')[1];
                elm.setAttribute('data-match-custom-id', imgId);
                customQueries[imgId] = window.matchMedia(elm.getAttribute('data-match-custom'));
                customQueries[imgId].addListener(function () {
                    customResponsiveHandler(elm);
                });
            }

            assignContainer(elm, scrollTop, lazyBorder, false, false);
        }

        if (hasLazyContainers && !scrollListening) {
            scrollListening = true;
            window.addEventListener('scroll', function () {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(processContainers, 100);
            });
        }
    }

    /**
     * This processes all images and containers on the page for the first time and also sets up
     * the event listener for the media query to react on scaling.
     */
    smartImages.init = function () {
        var scrollTop, lazyBorder;

        if (initDone) {
            return;
        }

        initDone = true;

        scrollTop = document.body.scrollTop;
        lazyBorder = scrollTop + (window.innerHeight * 1.5);

        processImages(scrollTop, lazyBorder);

        if (document.querySelectorAll) {
            processContainers(scrollTop, lazyBorder);
        }

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
    smartImages.manualAssign = function (elm) {
        if (elm instanceof Image) {
            assignImg(elm, 0, 0, true, false);
        } else {
            assignContainer(elm, 0, 0, true, false);
        }
    };

    /**
     * Just get the the source that would currently apply for an image without setting it.
     * @param elm
     * @returns string
     */
    smartImages.getSrc = function (elm) {
        return assignImg(elm, 0, 0, true, true);
    };

    /**
     * Just get the background that would currently apply for a container without setting it.
     * @param elm
     * @returns string
     */
    smartImages.getBackground = function (elm) {
        return assignContainer(elm, 0, 0, true, true);
    };

    window.addEventListener('load', function () {
        if (autoInit === true) {
            smartImages.init();
        }
    });
})();