function appInitialize() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const debug = urlParams.get('debug') == "true";

  const controller = {
    element: undefined,
    visible: 0 // TODO: Read URL to determine if controller is to start visible or invisible
  }

  const input = {
    text: "",
    at: undefined
  }

  function onKey(event) {
    const keyNow = Date.now();
    const keyThen = input.at;

    const ignoreKeys = ["Alt", "Control", "Shift"];
    const resetKeys = ["Backspace", "Delete", "Escape"];
    const terminatorKeys = ["Enter"];

    const secret = {
      text: "Bob",
      timeout: 2000 // ms
    }

    const key = event.key;

    if ((ignoreKeys.includes(key) || event.isComposing || event.keyCode === 229)) { // 229 is a special value set for a keyCode relating to an event that has been processed by an input-method editor -- TODO: Use event.code and appropriate string value! 
      return;
    }

    input.at = keyNow;

    const reset = resetKeys.includes(key);
    const timeout = (keyNow - keyThen) > secret.timeout;

    const terminator = terminatorKeys.includes(key);
    const complete = terminator && (input.text == secret.text);

    if (debug) {
      console.log("Key: " + key);
      console.log("Input: " + input.text);

      console.log("Reset: " + reset);
      console.log("Timeout: " + timeout);

      console.log("Terminator: " + terminator);
      console.log("Complete: " + complete);
    }

    if (reset || terminator || timeout) {
      input.text = "";
      input.at = undefined;

      if (reset || timeout) {
        if (debug) {
          console.log("Input: " + input.text);
        }

        return;
      }
    }

    if (!terminator) {
      input.text += key;
    }

    if (debug) {
      console.log("Input: " + input.text);
    }

    if (!complete) {
      return;
    }

    setVisibleByElement(controller.element, 1);
    document.removeEventListener("keyup", onKey);
    controller.visible = 1;
  }

  controller.element = prependController(document.body, "controlled", controller.visible);
  document.addEventListener("keyup", onKey);
}