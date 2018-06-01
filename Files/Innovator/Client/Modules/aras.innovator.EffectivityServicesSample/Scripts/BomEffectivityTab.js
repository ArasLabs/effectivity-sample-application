window.aras = parent.aras;

window.getCurrentDate = function() {
	const date = new Date();
	const year = date.getFullYear().toString();

	let month = date.getMonth() + 1;
	if (month < 10) {
		month = '0' + month.toString();
	}

	let day = date.getDate();
	if (day < 10) {
		day = '0' + day.toString();
	}

	return year + '-' + month + '-' + day;
};

window.CustomParametersProvider = function() {
	let parameters = {};

	this.getParameters = function() {
		return parameters;
	};

	this.setParameter = function(name, value) {
		if (name === 'ProductionDate' && !parameters.hasOwnProperty(name)) {
			value = window.getCurrentDate();
		}

		parameters[name] = value;
	};
};

window.CustomStartConditionProvider = function() {
	this.getCondition = function() {
		return {
			'id': parent.item.getAttribute('id')
		};
	};
};

const tgvdIdParam = 'tgvdId=10C00B57BDF146279451D9E428916754';
const startConditionProviderParam = 'startConditionProvider=parent.CustomStartConditionProvider()';
const parametersProviderParam = 'parametersProvider=parent.CustomParametersProvider()';

let tgvUrl = aras.getBaseURL('/Modules/aras.innovator.TreeGridView/Views/MainPage.html?');
const allParams = [tgvdIdParam, startConditionProviderParam, parametersProviderParam];

for (let i = 0; i < allParams.length; i++) {
	tgvUrl += (i === 0 ? '' : '&') + allParams[i];
}

let iframe = document.createElement('iframe');
iframe.id = 'tree_grid_viewer';
iframe.width = '100%';
iframe.height = '100%';
iframe.frameBorder = '0';
iframe.scrolling = 'auto';
iframe.src = tgvUrl;
document.body.insertBefore(iframe, document.body.childNodes[0]);
