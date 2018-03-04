/**
 * Global ng-app files
 *
 * scripts/controllers folder for components logic
 */
// i18N Setup

if (window.i18next) {
    window.i18next.use(window.i18nextXHRBackend) ;
//    window.i18next.use(window.i18nextSprintfPostProcessor);
    window.i18next.init({
            debug: true,
            fallbackLng: 'en',
            lng: 'en',
            resGetPath: '/locales/{{lng}}/camps.json',
            backend: {
                loadPath: '/locales/{{lng}}/camps.json'
            },
        }, function (err, t) {
            return i18next ;
            console.log('resources loaded',t);
            var translate = i18next.t("nav");
            console.log("translate variable = " + translate);
        });
};
    
; // eslint-disable-line

app = angular.module("ngCamps", ['ngSanitize', 'jm.i18next' , 'ngAnimate', 'ui.select']) ;
console.log(app) ;
events_app = angular.module("ngEvents", ['ngAnimate', 'ngSanitize', 'ui.select','jm.i18next' ]); // eslint-disable-line

