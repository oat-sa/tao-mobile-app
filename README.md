# tao-mobile-app
Experimental app wrapper to run a tao test in mobile devices

## Architecture

### PhoneGap vs Cordova

This project will use [PhoneGap](https://phonegap.com) so it will use [Cordova](https://cordova.apache.org/). 

As a reminder PhoneGap is a kind of superset to Cordova, it provides tools on top of Cordova : 
 - the command line tool [phonegap](https://www.npmjs.com/package/phonegap)
 - an application to deploy development apps on devices [PhoneGap Mobile App](http://docs.phonegap.com/getting-started/2-install-mobile-app/)
 - an online service to build apps on the Cloud [PhoneGap Build](https://build.phonegap.com/)


All tools the [Cordova CLI](https://www.npmjs.com/package/cordova) provides (`build`, `run`, `create`) are also available from the `phonegap` command.

References sites : 
 - http://docs.phonegap.com/
 - https://cordova.apache.org/docs/en/latest/


#### In practice

The previous paragraph describes how the relationship between the tools should be. In reality, there are incompatibilities. There's even incompatibilities between the different ways to build or publish within PhoneGap.

### Project structure

 - `config.xml` : it's the manifest file for the app.
 - `www` : it contains the source code of the app.

#### Entrypoint

The app entrypoint is always a _special_ `index.html` file. For our app we will have 2 entrypoints : 

 - `www/index.html` the main entrypoint, it will contains the following features : login, admin, sync, test selection, etc. Everything developed especially for the app.
 - `www/test/index.html` the entrypoint that starts a TAO test. 

Each entrypoint (ie. opening a new page) creates a new process on the device, with a reload of all the Cordova framework and plugins. It's the reason we limit the app to 2 entrypoints.

#### TAO Test Runner

This project leverage the concept of only one TAO Test Runner for all the devices and channels.
Since PhoneGap and Cordova enforce a closed structure for the project, we will retrieve the test runner source code using a tool or link to a TAO installation to ease the development cycle.

### Build

Connect to https://build.phonegap.com and launch the build.

You can add a `.pgbomit` file in all folders you want the build to ignore.

### Publishing

#### Signing 

##### Apple

We need to subsribe to the [Apple Developer Program](https://developer.apple.com/programs/) to distribute the app on iOS devices.

##### Android

A certificate creates with the Java `keytool` must be generated.

### Development

You need the last version of [node.js](https://nodejs.org/en/) (>=9.8.0).

Install the PhoneGap cli, globally : 

```sh
npm i -g phonegap@latest
```


### License

_TBD_

Be careful,  Codova and PhoneGap tools are licensed under the Apache 2.

