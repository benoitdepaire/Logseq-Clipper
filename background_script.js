chrome.commands.onCommand.addListener(function(command) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (command === "activate-extension") {
          chrome.tabs.sendMessage(tabs[0].id, {command: "toggleExtension"});
      } else if (command === "activate-alternate-extension") {
          chrome.tabs.sendMessage(tabs[0].id, {command: "toggleAlternateExtension"});
      } else if (command === "copy-to-clipboard") {
          chrome.tabs.sendMessage(tabs[0].id, {command: "copyToClipboard"}, function(response) {
              copyTextToClipboard(response);
          });
      }
  });
});

function copyTextToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard');
  }).catch(err => {
      console.error('Failed to copy text: ', err);
  });
}
