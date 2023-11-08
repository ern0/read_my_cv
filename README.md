# Read My CV

## Mission

There are sites for [companies and recruiters](https://hireify.com/),
there are plenty of job offer/seek sites,
but nobody cares with job seekers.

This project helps to job seekers to:

- keep the CV data up-to date,
- export customized CVs, one for each application.

## How it works

The CV data is stored in HTML format, 
with custom tags.
Only one CV-related tags are used: `cv-role`, 
which specifies the *job role* 
which the given section is applies to.
If no `cv-role` is specified, 
the section will always appear in the result.

You can use any HTML/CSS feature, template, external images, anything.
You should include the CV engine (`readmycv.js`), 
which will do the trick.

```
<html>
  <head>
    ...
    <script src="myScript.js"></script>
    ...
  </head>

  <body>
    ...
    <div class="name"> Charlie Brown </div>
    <div class="title" cv-role="devops"> Senior Devops Engineer </div>
    <div class="title" cv-role="developer"> Senior Software Developer </div>
    ...
  </body>
</html>

```

With including the engine, 
the CV itself turns into a simple a one-page application.
It collects `cv-role` tags from the page 
(in the example: *devops*, *developer*).
Upon pressing a secret key combo, the app displays a dialog, 
where these tags can be switched individually on or off.
If a section contains no `cv-role` tag,
it will be always rendered.

The states of the role switches are stored in the URL, 
in scrambled form,
so it can be used to share the CV for the current role.

It's up to you how you organize roles and sections.


That's all.
