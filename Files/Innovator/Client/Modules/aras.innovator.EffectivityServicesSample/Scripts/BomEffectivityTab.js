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
		//TreeGridView sets and updates parameter values using this setParameter() method.
		//"Production Date" parameter is named as ID of the "Production Date" effectivity variable ("E3EDDEC18B584347B3F11A517CF2AC2E") in order
		//to be able to provide default values for the Effectivity Criteria Dialog using standard TreeGridView parameters functionality.
		//However, it is required to set dynamic default value (current date) for the "Production Date" parameter which is not supported out of the box.
		//So we should replace parameter value with current date once during default parameter values initialization when corresponding property does not exist.
		if (name === 'E3EDDEC18B584347B3F11A517CF2AC2E' && !parameters.hasOwnProperty(name)) {
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
