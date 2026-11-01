/* Unifitz browser push — shows notifications sent by the `send-push` Edge
 * Function while the site is closed or in the background. The message's
 * `webpush.notification` is displayed by the Firebase SDK and a click opens
 * `webpush.fcm_options.link`. Keep the version in sync with the `firebase`
 * npm package and the config with src/lib/push.js. */
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyB8Vu1H85Dzsnk7x3AvsywnpLKrj9DvCTw',
  authDomain: 'unifitz-7e01c.firebaseapp.com',
  projectId: 'unifitz-7e01c',
  storageBucket: 'unifitz-7e01c.firebasestorage.app',
  messagingSenderId: '401520391936',
  appId: '1:401520391936:web:816fffa9aeab21acbc65e5',
});

firebase.messaging();
