function setElementVisible(element, visible) {
  if (element === undefined) {
    return;
  }

  const value = (visible == 0 ? "none" : "");
  element.style.display = value;
}

function setVisibleByAttributeNameValue(attributeName, attributeValue, visible) {
  const elements = document.querySelectorAll("[" + attributeName + "=" + attributeValue + "]");

  if ((elements === undefined) || (elements.length == 0)) {
    return;
  }

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    setElementVisible(element, visible);
  }
}

function appendVisibleButton(parent, attributeName, attributeValue, visible) {
  const button = document.createElement("button");
  button.type = "button";
  const onclick = "setVisibleByAttributeNameValue(" + "'" + attributeName + "', '" + attributeValue + "', " + visible + ")";
  button.setAttribute("onclick", onclick);
  button.innerHTML = (visible == 0 ? "Hide" : "Show") + " " + attributeValue;

  parent.append(button);
}

function prependController(parent, attributeName, visible) {
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

    const item = document.createElement("div");
    item.className = "item";

    appendVisibleButton(item, attributeName, attributeValue, 0);
    appendVisibleButton(item, attributeName, attributeValue, 1);

    controller.append(item);
  }

  setElementVisible(controller, visible);
  parent.prepend(controller);

  return(controller);
}