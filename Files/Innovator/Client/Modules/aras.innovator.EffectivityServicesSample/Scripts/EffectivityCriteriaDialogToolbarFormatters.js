window.Toolbar.formatters.effs_label = function(data) {
	return Inferno.createVNode(
		ArasModules.utils.infernoFlags.htmlElement,
		'span',
		data.item.class,
		[data.item.text]
	);
};

window.Toolbar.formatters.effs_item_field = function(data) {
	const properties = {};
	const metadata = data.item.metadata;

	if (metadata) {
		properties.onchange = metadata.onChangeHandler;
		properties.onclick = metadata.onClickHandler;
		properties.onkeydown = metadata.onKeyDownHandler;
	}

	const addNodeCallback = function(itemPropertyElement) {
		itemPropertyElement.setState({
			itemType: data.item.itemtype
		});

		if (metadata && metadata.onAddElementNodeHandler) {
			metadata.onAddElementNodeHandler(itemPropertyElement);
		}
	};

	return Inferno.createVNode(
		ArasModules.utils.infernoFlags.htmlElement,
		'aras-item-property',
		data.item.class,
		null,
		properties,
		null,
		addNodeCallback
	);
};
