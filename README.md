# tao-mobile-app

App wrapper to run a TAO test in mobile devices

## Architecture

### Cordova vs PhoneGap vs PhoneGap Build

This project will use [PhoneGap Build](https://build.phonegap.com) so it will use [PhoneGap](https://phonegap.com) and [Cordova](https://cordova.apache.org/).


Cordova is the basement framework used to build _hybrid apps_, an HTML/CSS/JS app wrapped into a native WebView with access to some features from the native SDK. Cordova brings the config format, a plugin system, tools to build apps into the target platforms.

PhoneGap itself is nothing but a superset of Cordova, it offers more tools on top of Cordova :
 - the command line tool [phonegap](https://www.npmjs.com/package/phonegap) which is a superset of the [Cordova CLI](https://www.npmjs.com/package/cordova). All tools the Cordova CLI provides (`build`, `run`, `create`) are also available from the `phonegap` command.
 - an application to deploy development apps on devices [PhoneGap Mobile App](http://docs.phonegap.com/getting-started/2-install-mobile-app/)
 - a desktop app management software : [PhoneGap Desktop App](https://phonegap.com/products/#desktop-app-section).
 - an online service to build apps on the Cloud [PhoneGap Build](https://build.phonegap.com/)

#### In practice

The previous paragraph describes how the relationship between the tools should be. In reality, there are incompatibilities. There's even incompatibilities between the different ways to build or publish within PhoneGap.

#### The build problem

Cordova and PhoneGap themselves rely on native SDKs to build the apps. It means if you want to build an app for Android, you need to have installed the Android SDKs and tools (`adb`, `aapt`, `gradle`, etc.) on the local machine. It's fine with Android since Java is cross platform.
But when it comes to build for iOS, you need to build from an OSX machine, that have xCode installed and the target SDK. The OSX and xCode versions, should be compatible with your target iOS SDK.
And it's the same for Windows, you need Windows and Visual Sutdio installed with the target SDK, in the compatible version you want to deploy to.

So instead of maintaining a network of build machines, we will rely on [Phone Gap Build](https://build.phonegap.com), on online service that builds the apps. It will build the apps targetting the platform and SDK versions as defined in the `config.xml` manifest of the app.

Phone Gap build, simplifies also the application structure, since it requires only the metadata and the app source code.

### Project structure

The project layout is fixed and can't be changed, it rely on the Cordova and PhoneGap build conventions.

 - `config.xml` : it's the manifest file for the app.
 - `src/` : the app specific source code, where you edit your files
 - `src/js` : the app javascript source code
 - `src/js/test` : the javascript unit tests
 - `src/js/app/app.js` : the main controller
 - `src/js/app/config.js` : the application configuration
 - `src/js/app/component` : the application graphical components
 - `src/js/app/controller` : the applications controllers
 - `src/js/app/service` :  the applications services
 - `src/scss` : the app sass source code
 - `src/taodist` : the symlink to a running TAO instance (not setup by default).
 - `www/` : it contains the source code of the app.
 - `www/index.html` : the app entry point.
 - `www/dist/` : the compiled app source code
 - `www/res/` : the app resources (app icons, app splash screens, etc.)
 - `merges` : an optional folder that can contain resources per platform that will override the resource for the target platform (`merges/android/css/index.css` will replace `www/css/index.css` on Android only)


You can add a `.pgbomit` file in all folders you want the build to ignore.

#### Entry points

The app entry point is the file `www/index.html`

This file bootstraps the phonegap/cordova framework. 
It is recommended to don't navigate to other files, even internally, each entrypoins create a new Cordova process.

### App targets and support

In a first time we can focus on the following support table. Supporting previous versions for each platform may require additional work on the TAO source code.


| Platform      | OS/SDK Version| Mobile Market Share<sup>(1)</sup>| Comment  |
|---------------|:-------------:|:--------------------:|----------|
| Android       | >=5.1 (API 21) | 64,08%              |  Starting from [Lollipop](https://developer.android.com/about/versions/android-5.0.html) Android Webview are Chrome based. All previous versions use an old webkit implementation.  |
| iOS      | >=10      | 26.04% | The minimum requirement for TAO is iOS 9/Safari 9, with some possible limitations, but with a low market share we can start concentrate on 10+  |
| Windows  | ?       |  ? | We can generate `aapx` files, the windows universal app format, I need to investigate what it means exactly |

_(1)_: From https://www.netmarketshare.com


### Development

#### Quick Setup

1. You need the last version of [node.js](https://nodejs.org/en/) (>=9.8.0).
2. Clone this repository :
```sh
git clone  https://github.com/oat-sa/tao-mobile-app.git
```
3. Install the dependencies
```sh
npm i
```
4. Link an installed version of TAO, for now, target the develop version
```sh
npm run tao:symlink /path/to/the/root/of/your/package-tao
```
5. Update the configuration file `src/js/config.js`, especially the value of the sync endpoint 
```
'app/service/authentication' : {
    syncManager : {
        endpoint : 'http://192.168.1.36/taoSync/HandShake/index',
    }
}

```
Please note this endpoint should link to an installed TAO, configured as [central sync endpoint](#central-sync-endpoint). If you test on a real device, don't forget the endpoint to be accessible through your LAN/WAN.

5. You can build the code, to check everything is alright
```sh
npm run build
```
6. Run the development mode (watch mode for sass and js)

```sh
npm run dev
```
7. Open Chrome(ium) at the address indicated in CLI.

Please note, the local development is better using Webkit based browsers, because phonegap injects some specific services.

8. You can also run it in a real device, by installing [the developer app](http://docs.phonegap.com/getting-started/2-install-mobile-app/) and opening the same address (_PRO TIP_ : you should be on the same network...).

#### Set up a TAO central sync endpoint
<a name="central-sync-endpoint"></a>

 - Install a recent (>= sprint-75) version of TAO with the extensions `taoSync` and `taoOAuth`.
 - Once installed, create a user with the role `Sync Manager`
 - Run the script `php index.php '\oat\taoSync\scripts\tool\RegisterHandShakeAuthAdapter'`
 - Do not forget to change the value of the endpoint in the app config file `src/js/config.js`

#### Debug

##### From the development server

You can debug using the Chrome Dev Tools, but on a device running the development application, you have no other option than running a remote debugger.
One of them that works more or less is [Vorlon.js](http://www.vorlonjs.io/)

##### From a built app

See http://docs.phonegap.com/phonegap-build/tools/debugging/

 - For Android use remote debugging from the Chrome Dev Tools
 - For iOS use remote debugging from Safari


#### Build

1. Build the optimized version of the source code using `npm run build`
2. Push the code to Github (here the usual release process takes place)
3. Connect to https://build.phonegap.com
4. Ensure Hydratation and Debug are ticked
5. Update the code, you can define the target branch, tag, etc.
6. Launch the build
7. If the app is already installed, just got back to the home screen (3 fingers taps) and update it. Othersiwse scan the QR code and install it.

> TDB there's a way to launch the build from the CLI

#### Signing

##### Apple

We need to subscribe to the [Apple Developer Program](https://developer.apple.com/programs/) to distribute the app on iOS devices.

##### Android

A certificate creates with the Java `keytool` must be generated.

##### Windows

### Publishing

> TBD

#### Docuemtation

 - http://docs.phonegap.com/
 - http://docs.phonegap.com/phonegap-build/
 - https://cordova.apache.org/docs/en/latest/

### License

> TBD

The Cordova and PhoneGap tools are for the most licensed under Apache 2. But since PhoneGap Build injects the plugins we can publish under GPLv2. Then we can still not include MathJax

