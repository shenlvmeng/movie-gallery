# MyPhotoGallery

> A project powered by Vue.js

Use ```gallery_info.json``` for meta data of pictures in ```assets``` and rename pitures ascendingly from 0.

In file gallery_info.json, ```name```, ```author```, ```description``` fields are used for basic information
of the whole photo gallery.```content``` stores the whole data.

Every item of items in ```content``` are composed of fields "date", "info", "tags" and "type".

* ```date```: when this photo or picture is created
* ```info```: description of this picture
* ```tags```: most important part. Tags are used to identify a picture and judge relationship of other pictures
* ```type```: the format of this picture