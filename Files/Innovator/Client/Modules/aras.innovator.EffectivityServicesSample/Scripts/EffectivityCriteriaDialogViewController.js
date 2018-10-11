(function(window) {
	'use strict';

	const GRID_COLUMN_NAMES = {
		variable: 'variable',
		value: 'value'
	};

	//Int32 represents signed integers with values that range from
	//negative 2147483648(-2^31) through positive 2147483647(2^31 - 1).
	const INT32_MIN_VALUE = -2147483648;
	const INT32_MAX_VALUE = 2147483647;

	function EffectivityCriteriaDialogViewController(dialogArguments, toolbarConnectId, gridConnectId, applyButtonConnectId, clearButtonConnectId) {
		//window.aras is required for Grid formatters and editors
		window.aras = this.aras = dialogArguments.aras;
		this._presetScope = dialogArguments.presetScope;
		this.dialogArguments = dialogArguments;
		this._init(toolbarConnectId, gridConnectId, applyButtonConnectId, clearButtonConnectId);
	}

	EffectivityCriteriaDialogViewController.prototype = {
		constructor: EffectivityCriteriaDialogViewController,

		aras: null,

		dialogArguments: null,

		grid: null,

		scope: null,

		_presetScope: null,

		_effsModuleSolutionBasedRelativePath: '../Modules/aras.innovator.EffectivityServicesSample',

		_commonGridCellEditorMetadata: null,

		_applyButtonElement: null,

		_clearButtonElement: null,

		get _scopeItemContext() {
			return this._currentScopeItem;
		},

		set _scopeItemContext(itemNode) {
			this._currentScopeItem = {
				id: this.aras.getItemProperty(itemNode, 'id') || '',
				keyedName: this.aras.getItemProperty(itemNode, 'keyed_name') || '',
				builderMethod: this.aras.getItemPropertyAttribute(itemNode, 'builder_method', 'keyed_name') || ''
			};
			this.scope = this._getScopeObject();

			const isScopeNotSelected = !this.scope;
			this._toggleElementDisabledState(this._applyButtonElement, isScopeNotSelected);
			this._toggleElementDisabledState(this._clearButtonElement, isScopeNotSelected);

			this._populateGridWithScopeVariables();
		},

		_toggleElementDisabledState: function(element, state) {
			element.disabled = state;
		},

		_init: function(toolbarConnectId, gridConnectId, applyButtonConnectId, clearButtonConnectId) {
			//init soap module for itemProperty component
			ArasModules.soap(null, {async: true, method: 'ApplyItem', url: this.aras.getServerURL(), headers: this.aras.getHttpHeadersForSoapMessage('ApplyItem')});

			this._defineCommonGridCellEditorMetadata();
			this._loadGrid(gridConnectId)
				.then(function() {
					return this._loadToolbar(toolbarConnectId);
				}.bind(this))
				.then(function() {
					this._updateGridValueColumnCellsWithPresetValues();
				}.bind(this));

			this._setupApplyButton(applyButtonConnectId);
			this._setupClearButton(clearButtonConnectId);
		},

		_defineCommonGridCellEditorMetadata: function() {
			const failedStringValidationMessage = this.aras.getResource(
				this._effsModuleSolutionBasedRelativePath, 'effectivity_criteria_dialog.grid.cell_editor.invalid_string_validation_message');
			const failedIntegerValidationMessage = this.aras.getResource(
				this._effsModuleSolutionBasedRelativePath, 'effectivity_criteria_dialog.grid.cell_editor.invalid_integer_validation_message');
			const failedListValueValidationMessage = this.aras.getResource(
				this._effsModuleSolutionBasedRelativePath, 'effectivity_criteria_dialog.grid.cell_editor.invalid_list_value_validation_message');

			const validValueResolver = function(value) {
				return Promise.resolve(value);
			};

			const allowedStringCharactersPattern = /^[0-9A-Za-z]*$/;

			this._commonGridCellEditorMetadata = {
				string: {
					formatter: 'text',
					willValidate: validValueResolver,
					checkValidity: function(value) {
						const isValueValid = allowedStringCharactersPattern.test(value);
						const validationResult = {valid: isValueValid};

						if (!isValueValid) {
							validationResult.validationMessage = failedStringValidationMessage;
						}

						return validationResult;
					}
				},
				integer: {
					formatter: 'text',
					willValidate: validValueResolver,
					checkValidity: function(value) {
						let isValidValue = true;

						if (value) {
							const intValueOrNaN = parseInt(value, 10);
							// '00001' and '1.0000' values can be parsed to integer, so this check is added to interpret those values as invalid
							//Server cannot accept value larger than Int32 (2^31)
							//Don't use Number.MAX_VALUE and Number.MIN_VALUE because they represent the double precision 64-bit format IEEE 754
							//value in Javascript
							isValidValue = Number.isInteger(intValueOrNaN) && intValueOrNaN.toString() === value &&
								intValueOrNaN >= INT32_MIN_VALUE && intValueOrNaN <= INT32_MAX_VALUE;
						}

						const validationResult = {valid: isValidValue};

						if (!isValidValue) {
							validationResult.validationMessage = failedIntegerValidationMessage;
						}

						return validationResult;
					}
				},
				shortDate: {
					formatter: 'calendar',
					editor: 'dynamicTreeGrid_calendar',
					format: 'shortDate',
					validationMessage: this.aras.getResource(
						this._effsModuleSolutionBasedRelativePath,
						'effectivity_criteria_dialog.grid.cell_editor.invalid_date_validation_message',
						this.aras.getDotNetDatePattern('short_date'))
				},
				list: {
					formatter: 'select',
					willValidate: function() {
						const filterList = this.grid.view.activeCell.querySelector('aras-filter-list');

						// filterList.state.label is not null if user modifies input value using keyboard
						// in this case we should validate user input using 'label' list option property
						let userInputValue = filterList.state.label;
						let listOptionPropertyToCheck = 'label';

						// perform explicit null check because userInputValue can be an empty string
						if (userInputValue === null) {
							// filterList.state.label is null if user selects value using drop-down list
							// in this case we should validate user input using 'value' list option property
							userInputValue = filterList.state.value || '';
							listOptionPropertyToCheck = 'value';
						}

						const foundOption = filterList.state.list.find(function(option) {
							return option[listOptionPropertyToCheck] === userInputValue;
						});

						return foundOption ? Promise.resolve(foundOption.value) : Promise.reject(failedListValueValidationMessage);
					}.bind(this)
				}
			};
		},

		_loadGrid: function(gridConnectId) {
			const dom = document.getElementById(gridConnectId);
			const options = {
				draggableColumns: false
			};

			this.grid = new DynamicTreeGrid(dom, options);

			const columnWidth = Math.floor(window.innerWidth / 2);
			const columns = [
				{
					name: GRID_COLUMN_NAMES.variable,
					label: this.aras.getResource(this._effsModuleSolutionBasedRelativePath, 'effectivity_criteria_dialog.grid.variable_column_label'),
					width: columnWidth,
					settings: {
						editable: false
					}
				},
				{
					name: GRID_COLUMN_NAMES.value,
					label: this.aras.getResource(this._effsModuleSolutionBasedRelativePath, 'effectivity_criteria_dialog.grid.value_column_label'),
					width: columnWidth
				}
			];

			this.grid.obtainRowId = function(rowObj) {
				return rowObj.id;
			};

			this.grid.loadData(null, columns);
			return this.grid.render();
		},

		_updateGridValueColumnCellsWithPresetValues: function() {
			if (this._presetScope) {
				//use Array.prototype.forEach() explicitly to avoid "Can't execute code from a freed script" error in IE which occurs
				//if array of scope variables was created in the freed script (for example, in the popup dialog that was closed)
				Array.prototype.forEach.call(this._presetScope.variables, function(variable) {
					this.grid.setCellValue(variable.id, GRID_COLUMN_NAMES.value, variable.value);
				}.bind(this));
			}
		},

		_populateGridWithScopeVariables: function() {
			const grid = this.grid;
			grid.removeAllRows();
			grid.settings.orderBy = [];

			if (!this.scope) {
				return;
			}

			const variables = this.scope.variables;
			grid.addRows(variables);

			variables.forEach(function(variable) {
				const rowId = variable.id;
				const valueCellMetadata = this._calculateValueCellMetadata(variable);

				grid.setCellMetadata(rowId, GRID_COLUMN_NAMES.value, valueCellMetadata);
				grid.setCellValue(rowId, GRID_COLUMN_NAMES.variable, variable.name);
				grid.setCellValue(rowId, GRID_COLUMN_NAMES.value, '');
			}.bind(this));
		},

		_calculateValueCellMetadata: function(variable) {
			let metadata;

			switch (variable.datatype) {
				case 'String':
					metadata = this._commonGridCellEditorMetadata.string;
					break;
				case 'Int':
					metadata = this._commonGridCellEditorMetadata.integer;
					break;
				case 'DateTime':
					metadata = this._commonGridCellEditorMetadata.shortDate;
					break;
				default:
					const options = [{label: '', value: ''}];

					variable.namedConstants.forEach(function(namedConstant) {
						options.push({
							label: namedConstant.name,
							value: namedConstant.id
						});
					});

					metadata = Object.assign({options: options}, this._commonGridCellEditorMetadata.list);
					break;
			}

			return metadata;
		},

		_loadToolbar: function(toolbarConnectId) {
			const toolbar = new ToolbarWrapper({id: 'effs_criteria_dialog_toolbar', connectId: toolbarConnectId});
			const effsModuleURL = this.aras.getBaseURL() + '/Modules/aras.innovator.EffectivityServicesSample/';
			const toolbarXml = this.aras.getI18NXMLResource('EffectivityCriteriaDialogToolbar.xml', effsModuleURL);
			toolbar.loadXml(toolbarXml);
			toolbar.show();

			//get toolbar item after toolbar.show() method call which initializes toolbar items
			const scopeFieldToolbarItem = toolbar.getItem('effs_scope_field')._item_Experimental;
			//set metadata object which will be used in the effs_item_field toolbar formatter during delayed rendering in the toolbar component
			scopeFieldToolbarItem.metadata = this._getScopeFieldToolbarItemMetadata();

			return toolbar._toolbar.render();
		},

		_getScopeFieldToolbarItemMetadata: function() {
			const topWnd = this.aras.getMostTopWindowWithAras();
			const self = this;
			const scopeItemPropertiesToSelect = 'id,keyed_name,builder_method';

			const showSearchDialog = function(itemPropertyElement) {
				topWnd.ArasModules.MaximazableDialog.show('iframe', {
					aras: self.aras,
					itemtypeName: itemPropertyElement.state.itemType,
					type: 'SearchDialog'
				}).promise.then(function(result) {
					if (!result) {
						itemPropertyElement.setState({focus: true});
						return;
					}

					const currentRetainedScopeItemId = self._scopeItemContext.id;
					if (currentRetainedScopeItemId !== result.itemID) {
						itemPropertyElement.setState({value: result.keyed_name});
						itemPropertyElement.state.refs.input.dispatchEvent(new CustomEvent('change', {bubbles: true}));
					}
				});
			};

			return {
				onChangeHandler: function() {
					const itemPropertyElement = this;
					const selectedScopeItemKeyedName = itemPropertyElement.state.value;
					const currentRetainedScopeItemKeyedName = self._scopeItemContext.keyedName;

					if (selectedScopeItemKeyedName === currentRetainedScopeItemKeyedName) {
						return;
					}

					const clearCurrentRetainedScopeItem = selectedScopeItemKeyedName === '';
					const scopeItemNode = clearCurrentRetainedScopeItem ? null
																		: self.aras.getItemByKeyedName(
																			itemPropertyElement.state.itemType,
																			selectedScopeItemKeyedName,
																			0,
																			'',
																			scopeItemPropertiesToSelect);

					if (clearCurrentRetainedScopeItem || scopeItemNode) {
						if (currentRetainedScopeItemKeyedName) {
							const message = self.aras.getResource(
								self._effsModuleSolutionBasedRelativePath,
								'effectivity_criteria_dialog.change_scope_message',
								currentRetainedScopeItemKeyedName);
							topWnd.ArasModules.Dialog.confirm(message).then(function(result) {
								const isScopeItemChangingConfirmed = result === 'ok';
								if (isScopeItemChangingConfirmed) {
									self._scopeItemContext = scopeItemNode;
								} else {
									itemPropertyElement.setState({value: currentRetainedScopeItemKeyedName});
								}
							});
						} else {
							self._scopeItemContext = scopeItemNode;
						}
					} else {
						const message = self.aras.getResource('', 'relationshipsgrid.value_not_exist_for_it', itemPropertyElement.state.itemType);
						topWnd.ArasModules.Dialog.confirm(message).then(function(result) {
							const giveAnotherAttemptToEnterItemName = result === 'ok';
							if (giveAnotherAttemptToEnterItemName) {
								itemPropertyElement.setState({focus: true});
							} else {
								itemPropertyElement.setState({value: currentRetainedScopeItemKeyedName});
							}
						});
					}
				},
				onClickHandler: function(e) {
					if (e.target.closest('.aras-filter-list__button_ellipsis')) {
						showSearchDialog(this);
						e.stopPropagation();
					}
				},
				onKeyDownHandler: function(e) {
					const isF2KeyPressed = e.keyCode === 113;
					if (isF2KeyPressed) {
						showSearchDialog(this);
						e.stopPropagation();
					}
				},
				onAddElementNodeHandler: function(itemPropertyElement) {
					self._scopeItemContext = self._presetScope ? self.aras.getItemById(
																	itemPropertyElement.state.itemType,
																	self._presetScope.id,
																	0,
																	'',
																	scopeItemPropertiesToSelect)
																: null;
					itemPropertyElement.setState({value: self._scopeItemContext.keyedName});
				}
			};
		},

		_getScopeObject: function() {
			const scopeId = this._scopeItemContext.id;
			if (!scopeId) {
				return null;
			}

			const targetScope = this.aras.newIOMItem('Method', this._scopeItemContext.builderMethod);
			targetScope.setID(scopeId);

			let scopeItem = this.aras.newIOMItem('Method', 'cfg_GetScopeStructure');
			scopeItem.setPropertyItem('targetScope', targetScope);
			scopeItem.setProperty('output_buider_method', 'effs_ScopeOutputBuilderMethod');
			scopeItem = scopeItem.apply();

			if (scopeItem.isError()) {
				this.aras.AlertError(scopeItem);
				return null;
			}

			return this._parseScopeItemToObject(scopeItem);
		},

		_parseScopeItemToObject: function(scopeItem) {
			const variableItems = scopeItem.getRelationships('Variable');
			const variableCount = variableItems.getItemCount();
			const variables = [];

			for (let varIndex = 0; varIndex < variableCount; varIndex++) {
				const variableItem = variableItems.getItemByIndex(varIndex);
				const namedConstantItems = variableItem.getRelationships('NamedConstant');
				const namedConstantCount = namedConstantItems.getItemCount();
				const namedConstants = [];

				for (let ncIndex = 0; ncIndex < namedConstantCount; ncIndex++) {
					const namedConstantItem = namedConstantItems.getItemByIndex(ncIndex);

					namedConstants.push({
						id: namedConstantItem.getID(),
						name: namedConstantItem.getProperty('name')
					});
				}

				variables.push({
					id: variableItem.getID(),
					name: variableItem.getProperty('name'),
					datatype: variableItem.getProperty('datatype', ''),
					namedConstants: namedConstants
				});
			}

			return {
				id: scopeItem.getID(),
				name: scopeItem.getProperty('name'),
				variables: variables
			};
		},

		_setupApplyButton: function(applyButtonConnectId) {
			this._applyButtonElement = document.getElementById(applyButtonConnectId);
			this._setupButton(this._applyButtonElement, 'effectivity_criteria_dialog.apply_button_label', this._applyButtonOnClickHandler.bind(this));
		},

		_setupClearButton: function(clearButtonConnectId) {
			this._clearButtonElement = document.getElementById(clearButtonConnectId);
			this._setupButton(this._clearButtonElement, 'effectivity_criteria_dialog.clear_button_label', this._clearButtonOnClickHandler.bind(this));
		},

		_setupButton: function(buttonElement, textContentResource, eventListener) {
			buttonElement.textContent = this.aras.getResource(this._effsModuleSolutionBasedRelativePath, textContentResource);
			buttonElement.addEventListener('click', eventListener);
		},

		_applyButtonOnClickHandler: function() {
			const isModelStateValid = this.grid.settings.focusedCell ? this.grid.settings.focusedCell.valid : true;

			if (!isModelStateValid) {
				return this.aras.AlertError(
					this.aras.getResource(this._effsModuleSolutionBasedRelativePath, 'effectivity_criteria_dialog.apply_button_validation_message')
				);
			}

			this.dialogArguments.dialog.close(this.scope);
		},

		_clearButtonOnClickHandler: function() {
			this.grid.cancelEdit();
			this.grid.getAllRowIds().forEach(function(rowId) {
				this.grid.setCellValue(rowId, GRID_COLUMN_NAMES.value, '');
			}.bind(this));
		}
	};

	window.EffectivityCriteriaDialogViewController = EffectivityCriteriaDialogViewController;
}(window));
