# Deploying static Nextjs apps into Azure
This post will guide you through the steps to setup a static export of your Nextjs app. But before we get started let’s list some of the reasons why you might want to use Next for a static webapp instead of plain react:

-	SEO out of the box, no configuration or extra code required
-	Image optimization, Nextjs will serve lighter versions of your images to smaller screen sizes
-	Easier to setup and maintain project. Next will configure common dependencies most projects need: webpack, es-lint, css-modules, typescript, sass etc. 
-	Gives your project a standardized structure. This one often gets un-noticed but is very convenient for onboarding new developers.

## Setup of the project
If you already have a Nextjs project you can skip this step.

```sh
npx create-next-app --ts 
```

```sh
npm install sass
```

Go to package.json and change the build script to:

```json
"build": "next build && next export",
```

Done. Very easy, bearly an inconvenience.
