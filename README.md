# web bot (korean)
* web BOT (kr) - it can't work nowdays (deprecated) since 2022, Oct
* This repo will help who wanna implement or know below functions.
  * To implement PAYCO payment automatically with a image recognization.
  * How Kakaopay payment function on commercial website works.
  * How to bypass Akamai sensor cookie that obstacle(or detect) other type of web bots with an Electon appliation.
  * How to implement an Electon app with a legacy React.js.
  * How to hook network data (http protocol data) with Electron application.
  

## installation dev env
+ install election 
  + npm i -D electron@latest
+ install modules for react.js
  + npm install --save react react-dom

## dev env setting
+ Start babel preprocessor before editing code (for convert jsx to js)
  + npx babel --watch ./*.jsx ./components/*.jsx --out-dir ./ --presets react-app/prod

## dev tools for vs code exts
+ Debugger for chome(firefox, edge ..)
+ Babel JavaScript
+ Live Server
+ JavaScript (ES6) code snippets

## build to main view modules
+ npm run build
