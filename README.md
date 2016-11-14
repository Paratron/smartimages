SmartImages
===========

This javascript library makes the <img> tags in your website smarter. It enables you to define different source URLs
for desktop and mobile devices and even differentiate between regular and retina displays.

SmartImages also brings a basic lazy loading functionality that helps reducing the initial load impact of your website.

This library has absolutely no dependencies and weights way under 1000 bytes if delivered with gzip compression.


##How it works
To make use of the smart loading behaviour, you need to leave the `src` property of your image empty. This way you
are preventing the browser from directly starting to download the image contents upon pageload.

You can define up to four image sources on your image tag like so:

````html
<img
	data-src="regularDesktopImage.jpg"
	data-src-2x="retinaDesktopImage.jpg"
	data-src-mobile="regularMobileImage.jpg"
	data-src-mobile-2x="retinaMobileImage.jpg"
	>
````

Note how the `src` property is completely omitted here so the browser won't download anything by himself.

You can simply include the SmartImages library at the bottom of the page and forget about it. 
You don't need any more configuration:
   
````html
<script type="text/javascript" src="smartImages.min.js"></script>
````

The library will check the browser and then apply the needed image sources for the current environment.

It decides what to use based on two media queries. A device is detected as a retina device, when
the minimal device pixel ratio is 1.25 or the resolution is more then 120 dpi.

If a device is considered "mobile" will be detected by the media query `(max-width: 650px)`. This can be changed
manually, if desired.

Heads up: SmartImages will dynamically swap image sources when you resize the browser window
and cross the border defined in the media query.

If you want certain images to be ignored by the lib, simply add the `data-smart-ignore` attribute to the image tag
and SmartImages will _not_ replace the sources automatically, even if data-src definitions are present.


##Using the lazy loader
Sometimes you want to reduce the initial loading impact of your website - especially when
 its using a LOT of image data. You can do so by applying the attribute `data-lazy` to your
 images. When the attribute is present, SmartImages will only start to download the images
 when they get near the viewport of the browser. Rule of thumb: everything below
 scrollPos + (screenHeight * 1.5) is not downloaded yet.
  
##Intercepting initialization
By default, SmartImages listens to the body.load event and will initialize when everything
else on your page has been loaded. You can disable that behaviour.

When you call `smartImages.noAutoInit()` right after you embedded the library in your
page, SmartImages won't initialize itself. You need to call `smartImages.init()` manually.

I've implemented this because I had pages where I definitely only wanted to load ONE big
image above the fold first and nothing else.

This can be done by including the library, disabling the autoInit and then applying
the SmartImage functionality manually on just one image. After that image has been loaded,
initialize the library as usual.

Here's an example:

````html
<script type="text/javascript" src="smartImages.min.js"></script>
<script>
	smartImages.noAutoInit();
</script>

<img
	data-src="myHeaderImage.jpg"
	data-src-2x="myHeaderImage_2x.jpg"
	data-src-mobile="myHeaderImageMobile.jpg"
	data-src-mobile-2x="myHeaderImageMobile_2x.jpg"
	onload="smartImages.init"
	id="myHeaderImage"
	>
	
<script>
	smartImages.manualAssign(document.getElementById('myHeaderImage'));
</script>
````

Notice how I applied the `init()` method to the `onload` event of the image.

##Custom methods

You can use the method `smartImages.manualAssign(domElement)` to manually assign the source of an image once.

There is also a method `smartImages.getSrc(domElement)` that will just return the source, SmartImages would select
in the very moment and returns it as a string.