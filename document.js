function setVisibleByElement(element, visible) {
  if (element === undefined) {
    return;
  }

  const value = (!visible ? "none" : "");
  element.style.display = value;
}

function setVisibleByAttributeName(attributeName, visible) {
  const elements = document.querySelectorAll("[" + attributeName + "]");

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