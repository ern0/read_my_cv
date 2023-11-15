function initializePlayground() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const debug = urlParams.get('debug') == "true";
  const controllerStartsVisible = false;

  function getAttributeValuesByName(attributeName) {
    const attributeValues = {
      "google": ["Sam"],
      "microsoft": ["Bob", "Billy"],
      "all": ["Bob", "Billy", "Sam"]
    };

    return attributeValues[attributeName];
  }

  const attributeName = urlParams.get('name');
  const attributeValues = getAttributeValuesByName(attributeName);
  setVisibleByAttributeName("controlled", false); // Hide all
  setVisibleByAttributeNameValues("controlled", attributeValues, true); // Show conditionally

  initializeControllerManager("controlled", controllerStartsVisible, "Bob", debug);
}