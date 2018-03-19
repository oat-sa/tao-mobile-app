# tao-mobile-app
Experimental app wrapper to run a TAO test in mobile devices

## Architecture

### Cordova vs PhoneGap vs PhoneGap Build

This project will use [PhoneGap Build](https://build.phonegap.com) so it will use [PhoneGap](https://phonegap.com) and [Cordova](https://cordova.apache.org/).


Cordova is the framework used to build hybrid apps (an HTML/CSS/JS app wrapped into a WebView with access to some native apps). Cordova brings the config format, a plugin system, the tools to build the apps to the target platforms.

PhoneGap itself is nothing but a superset to Cordova, adding more tools on top of Cordova.
 - the command line tool [phonegap](https://www.npmjs.com/package/phonegap) that is a superset of the Cordova CLI tool. All tools the [Cordova CLI](https://www.npmjs.com/package/cordova) provides (`build`, `run`, `create`) are also available from the `phonegap` command.
 - an application to deploy development apps on devices [PhoneGap Mobile App](http://docs.phonegap.com/getting-started/2-install-mobile-app/)
 - a desktop app management software : [https://phonegap.com/products/#desktop-app-section](PhoneGap Desktop App).
 - an online service to build apps on the Cloud [PhoneGap Build](https://build.phonegap.com/)


#### The build problem

Cordova and PhoneGap themselves rely on native SDKs to build the apps. It means if you want to build an app for Android, you need to have installed the Android SDKs and tools (`adb`, `aapt`, `gradle`, etc.) on the local machine. It's fine with Android since Java is cross platform.
But when it comes to build for iOS, you need to build from a OSX machine, that have xCode installed and the target SDK. The OSX and xCode versions, should be compatible with your target iOS SDK.
And it's the same for Windows, you need Visual Sutdio installed with the target SDK.

So instead of maintaining a network of build machines, we will rely on [Phone Gap Build](https://build.phonegap.com), on online service that builds the apps.

Phone Gap build, simplifies also the application structure, since it requires only the metadata and the app source code.


#### In practice

The previous paragraph describes how the relationship between the tools should be. In reality, there are incompatibilities. There's even incompatibilities between the different ways to build or publish within PhoneGap.

### Project structure

The project layout is fixed and can't be changed, it rely on the Cordova and PhoneGap build conventions.

 - `config.xml` : it's the manifest file for the app.
 - `www/` : it contains the source code of the app.
 - `www/index.html` : the app entry point.
 - `www/res/` : the app resources (app icons, app splash screens, etc.)
 - `www/runner/` : the TAO test runner folder.
 - `www/runner/index.html` : the TAO test runner entry point.
 - `www/runner/src/` : the test runner source code from TAO.
 - `www/runner/data/` : the test runner data, to be downloaded from an external endpoint (taoSync)
 - `merges` : an optional folder that can contain resources per platform that will override the resource for the target platform (`merges/android/css/index.css` will replace `www/css/index.css` on Android only)

You can add a `.pgbomit` file in all folders you want the build to ignore.

#### Entry points

The app entry point is always a _special_ `index.html` file. For our app we will have 2 entry points :

 - `www/index.html` the main entry point, it will contains the following features : login, admin, sync, test selection, etc. Everything developed especially for the app.
 - `www/runner/index.html` the entry point that starts a TAO test.

Each entrypoint (ie. opening a new page) creates a new process on the device, with a reload of all the Cordova framework and plugins. It's the reason we limit the app to 2 entry points.

### TAO Test Runner

This project leverage the concept of only one TAO Test Runner for all the devices and channels.
This approach fits the plan to use [PWA](https://developers.google.com/web/progressive-web-apps/) instead of apps. This is unfortunately not yet possible do to the lack of API support on the Apple side, but it's only a matter of months. 
So waiting the PWA support, we will wrap our TAO Test Runner into a WebView.

Since PhoneGap and Cordova enforce a closed structure for the project, we will retrieve the test runner source code using a tool or link to a TAO installation to ease the development cycle.

Here the plan is to have a command line tool that you run for example :

`npm run taolink /path/to/local/tao` that creates the correct symlinks to a TAO local instance.
`npm run taosync /path/to/local/tao` that retrieve the source code before the build

This process will need to retrieve only the required source code before the build. The source code size should be as small as possible and never be more than 100MB.


### App targets and support

In a first time we can focus on the following support table. Supporting previous versions for each platform may require additional work on the TAO source code.


| Platform      | OS/SDK Version| Mobile Market Share<sup>(1)</sup>| Comment  |
|---------------|:-------------:|:--------------------:|----------|
| Android       | >=5.1 (API 21) | 64,08%              |  Starting from [Lollipop](https://developer.android.com/about/versions/android-5.0.html) Android Webview are Chrome based. All previous versions use an old webkit implementation.  |
| iOS      | >=10      | 26.04% | The minimum requirement for TAO is iOS 9/Safari 9, with some possible limitations, but with a low market share we can start concentrate on 10+  |
| Windows  | ?       |  ? | We can generate `aapx` files, the windows universal app format, I need to investigate what it means exactly |

_(1)_: From https://www.netmarketshare.com

### Development

You need the last version of [node.js](https://nodejs.org/en/) (>=9.8.0).

Install the PhoneGap CLI, globally :

```sh
npm i -g phonegap@latest
```

Clone the project and install it :

```sh
npm i
```

> TDB there's a way to launch and get the build from the CLI


1. Connect to https://build.phonegap.com
2. Ensure Hydratation and Debug are ticked
3. Update the code
4. Launch the build
5. If the app is already installed, just got back to the home screen (3 fingers taps) and update it. Othersiwse scan the QR code and install it.


#### Debug

See http://docs.phonegap.com/phonegap-build/tools/debugging/

Debugging using the Chrome Dev Tools' remote device give the most friendly way, Weinre is more universal but offers only limited debugging options (mainly console.log).


#### Local Development

For very quick cycles, you can develop from you browser running the _phone gap only_ app.

 - install plugins
 - install browser platform
 - `phonegap serve` or `phonegap run browser`

> Be careful to not commit changes introduced.


### Build

Connect to https://build.phonegap.com and launch the build.

#### Signing

##### Apple

We need to subscribe to the [Apple Developer Program](https://developer.apple.com/programs/) to distribute the app on iOS devices.

##### Android

A certificate creates with the Java `keytool` must be generated.

##### Windows

### Publishing

To Be Done


#### Docuemtation

 - http://docs.phonegap.com/
 - http://docs.phonegap.com/phonegap-build/
 - https://cordova.apache.org/docs/en/latest/

### License

_TBD_

The Cordova and PhoneGap tools are for the most licensed under Apache 2. But since PhoneGap Build injects the plugins we can publish under GPLv2. Then we can still not include MathJax

