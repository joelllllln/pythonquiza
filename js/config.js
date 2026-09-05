/* Firebase project settings.

   Leave this as-is and the app still works — progress is saved in this
   browser only. Fill it in (see README.md, 5 minutes) and you get Google
   sign-in with progress synced across every device you use.

   These values are public by design; access is controlled by the Firestore
   security rules in firestore.rules, not by hiding the key.                */

export const firebaseConfig = {
  apiKey: 'AIzaSyAwq3Q4jXs2yISgI_CGYqLewuCsUBMs1fQ',
  authDomain: 'pyquiz-5870c.firebaseapp.com',
  projectId: 'pyquiz-5870c',
  appId: '1:534771282596:web:fad27962282363161fac31',
};

export const firebaseEnabled = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain
);
