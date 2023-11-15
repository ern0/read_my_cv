function setVisibleByElement(element, visible) {
  if (element === undefined) {
    return;
  }

  const value = (!visible ? "none" : "");
  element.style.display = value;
}

function setVisibleByAttributeName(attributeName, visible) {
  const elements = document.querySelectorAll("[" + attributeName + "]");
  console.log("2");

  if ((elements === undefined) || (elements.length == 0)) {
    return;
  }

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    setVisibleByElement(element, visible);
  }
}

function setVisibleByAttributeNameValue(attributeName, attributeValue, visible) {
  const elements = document.querySelectorAll("[" + attributeName + "=" + attributeValue + "]");

  if ((elements === undefined) || (elements.length == 0)) {
    return;
  }

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    setVisibleByElement(element, visible);
  }
}

function setVisibleByAttributeNameValues(attributeName, attributeValues, visible) {
  if ((attributeValues === undefined) || (attributeValues.length == 0)) {
    return;
  }

  for (let i = 0; i < attributeValues.length; i++) {
    const attributeValue = attributeValues[i];
    setVisibleByAttributeNameValue(attributeName, attributeValue, visible)
  }
}

function prependController(parent, attributeName, visible) {

  function appendItem(parent, attributeName, attributeValue, visible) {

    function appendVisibleButton(parent, attributeName, attributeValue, visible) {
      const button = document.createElement("button");
      button.type = "button";
    
      const onclick = "setVisibleByAttributeNameValue(" +
        "'" + attributeName + "', " +
        "'" + attributeValue + "', " +
        visible + ")";
    
      button.setAttribute("onclick", onclick);
      button.innerHTML = (!visible ? "Hide" : "Show") + " " + attributeValue;
    
      parent.append(button);
    }

    const item = document.createElement("div");
    item.className = "item";

    appendVisibleButton(item, attributeName, attributeValue, false);
    appendVisibleButton(item, attributeName, attributeValue, true);

    parent.append(item);    
  }

  const elements = document.querySelectorAll("[" + attributeName + "]");

  if ((elements === undefined) || (elements.length == 0)) {
    return;
  }

  const controller = document.createElement("div");
  controller.className = "controller";

  const header = document.createElement("h1");
  const text = document.createTextNode("Controller");
  header.append(text);
  controller.append(header);

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const attributeValue = element.getAttribute(attributeName).trim();
    appendItem(controller, attributeName, attributeValue);
  }

  setVisibleByElement(controller, visible);
  parent.prepend(controller);

  return controller;
}