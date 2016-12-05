SmartImages
===========

This javascript library makes images in your website smarter. It enables you to define different source URLs
for desktop and mobile devices and even differentiate between regular and retina displays.

SmartImages also brings a basic lazy loading functionality that helps reducing the initial load impact of your website.

This library has absolutely no dependencies and weights way under 1000 bytes if delivered with gzip compression.


##How it works for image elements
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
You only need to apply this to images where you have defined `data-src...` attributes but want the library to leave them alone.

##How it works for containers
The library supports smart background image loading since version 2.3. The functionality behaves very much like with
the image tags - the only difference is that you need to additionally apply the attribute `data-smartImageContainer`
to any containers that should be recognized by the library.

````html
<div
	data-smartImageContainer
	data-src="regularDesktopImage.jpg"
	data-src-2x="retinaDesktopImage.jpg"
	data-src-mobile="regularMobileImage.jpg"
	data-src-mobile-2x="retinaMobileImage.jpg"
	>
	<!-- Some other HTML stuff in here -->
</div>
````

Lazy loading is also supported for container backgrounds.

Instead of just defining an image URL, you can put everything into the src attributes that would be a [valid css `background-image` value](https://developer.mozilla.org/en/docs/Web/CSS/background-image).
This is especially handy when you want to define multiple background images.


##Using the lazy loader
Sometimes you want to reduce the initial loading impact of your website - especially when
 its using a LOT of image data. You can do so by applying the attribute `data-lazy` to your
 images. When the attribute is present, SmartImages will only start to download the images
 when they get near the viewport of the browser. Rule of thumb: everything below
 scrollPos + (screenHeight * 1.5) is not downloaded yet.
 
###Preserving the layout with lazy images
If you leave the `src` attribute of your image tags empty, they will collapse and can possibly mess up your
 document layout. Not only would every freshly loaded lazy image cause your document to re-align and completely redrawn,
 it will also mess with the lazy loading functionality itself, since the lazy loader looks for the positions of the images
 in the document. If they all collapse, it is very well possible that the lazy loader will fetch all of them upon page request - 
 thats really not a desired behaviour.
 
You can tell the library about the dimensions of the images to be expected if they are requested. The library will then
 go ahead and dynamically create an empty, transparent dummy image and use it as a replacement source until you load the real
  image from the server. This will cause your layout to be correctly calculated and nothing will jump around when the lazy images
   are requested from the server.
   
You can tell the SmartImages library about image sizes like this:

````html
<img
	data-lazy
	
	data-src="regularDesktopImage.jpg"
	data-size="1200x800"
	
	data-src-2x="retinaDesktopImage.jpg"
	data-size-2x="2400x1600"
	
	data-src-mobile="regularMobileImage.jpg"
	data-size-mobile="320x213"
	
	data-src-mobile-2x="retinaMobileImage.jpg"
	data-size-mobile-2x="640x426"
	>
````

This works for container backgrounds as well but is probably not as important there, because background images don't interfer
with container dimensions.

  
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

You can use the method `smartImages.manualAssign(domElement)` to manually assign the source/background of an image or container once.

There is also a method `smartImages.getSrc(domElement)` that will just return the source, SmartImages would select
in the very moment and returns it as a string. For containers, use the method `smartImages.getBackground(domElement)`.