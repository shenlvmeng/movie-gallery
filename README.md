# MyPhotoGallery

> A project powered by Vue.js

Use `meta.json` for meta data of pictures in `assets` and rename pitures ascendingly from 0.

In file `meta.json`, `name`, `author`, `description` fields are used for basic information
of the whole photo gallery.`content` stores the whole data.

Every item of items in `content` are composed of fields "date", "info", "tags" and "type".

- **date**: when this photo or picture is created
- **info**: description of this picture
- **tags*: most important part. Tags are used to describe a picture and judge relationship of other pictures
- **type**: the format of this picture

Use `npm install` to download gulp plugins to translate and minify files in `assets`.

Use `gulp dev` for developing, use `gulp [css | js | json]` for deploying.

p.s. Pictures in this site are hosted in image hosting server [Qiniu](https://qiniu.com).
