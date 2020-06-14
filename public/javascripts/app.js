$(document).foundation();

function showGlobalMessage(messagePrimary, messageSecondary, time, type = "i") {
  let cls = "";
  if (type == "w") {
    cls = "warning";
  } else if (type == "e") {
    cls = "alert";
  } else if (type == "s") {
    cls = "success";
  }

  $mainGlobalMessageCont = $("#mainGlobalMessageCont");

  $mainGlobalMessageCont.removeClass();
  $mainGlobalMessageCont.addClass("callout");
  $mainGlobalMessageCont.addClass(cls);

  $primary = $($mainGlobalMessageCont.children(".primary")[0]);
  $secondary = $($mainGlobalMessageCont.children(".secondary")[0]);

  $mainGlobalMessageCont.show();
  $primary.html(messagePrimary);
  $secondary.html(messageSecondary);

  setTimeout(() => {
    clearGlobalMesssage();
  }, time);
}

function clearGlobalMesssage() {
  $mainGlobalMessageCont = $("#mainGlobalMessageCont");
  $primary = $($mainGlobalMessageCont.children(".primary")[0]);
  $secondary = $($mainGlobalMessageCont.children(".secondary")[0]);

  $primary.html("");
  $secondary.html("");
  $mainGlobalMessageCont.hide();
}

function onDocumentReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function boldString(str, find) {
  const re = new RegExp(find, "gi");
  return str.replace(re, "<strong>" + find + "</strong>");
}
