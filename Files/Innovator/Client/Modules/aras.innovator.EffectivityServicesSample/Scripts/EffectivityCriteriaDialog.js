define(['dojo/_base/declare'], function(declare) {
	return declare(null, {
		aras: null,

		scope: null,

		constructor: function(aras, presetScope) {
			this.aras = aras;
			this.scope = presetScope || null;
		},

		show: function() {
			const dialog = this.aras.getMostTopWindowWithAras(window).ArasModules.MaximazableDialog.show('iframe', {
				aras: this.aras,
				presetScope: this.scope,
				title: this.aras.getResource('../Modules/aras.innovator.EffectivityServicesSample', 'effectivity_criteria_dialog.title'),
				dialogWidth: 445,
				dialogHeight: 450,
				content: this.aras.getBaseURL() + '/Modules/aras.innovator.EffectivityServicesSample/Views/EffectivityCriteriaDialog.html'
			});
			return dialog.promise.then(function(scopeObject) {
				if (scopeObject) {
					this.scope = scopeObject;
				}

				return scopeObject;
			}.bind(this));
		}
	});
});
