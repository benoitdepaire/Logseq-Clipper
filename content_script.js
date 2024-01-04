function getPageInfo() {
  const url = window.location.href;
  const title = document.title;
  const selectedText = window.getSelection().toString();
  return { url, title, selectedText };
}

function updatePopup(newContent, isInitial, useAlternateTemplate) {
  let popup = document.getElementById('info-popup');
  if (!popup) {
      popup = document.createElement('textarea');
      popup.id = 'info-popup';
      popup.style.position = 'fixed';
      popup.style.bottom = '10px';
      popup.style.right = '10px';
      popup.style.width = '300px';
      popup.style.height= '200px';
      popup.style.backgroundColor = 'white';
      popup.style.border = '1px solid #ddd';
      popup.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.5)';
      popup.style.padding = '15px';
      popup.style.zIndex = '10000';
      popup.style.fontSize = '14px';
      popup.style.overflowY = 'auto';
      popup.style.whiteSpace = 'pre-wrap';

      // Append the popup to the body
      document.body.appendChild(popup);
  }

  if (isInitial) {
    popup.value = newContent;

    let titleStart = 2
    if(!useAlternateTemplate){
      titleStart = 7
    }
    const titleEnd = newContent.indexOf('\n', titleStart);
    //Pre-select the title
    popup.setSelectionRange(titleStart, titleEnd);
  } else if (newContent) {
      popup.value += (popup.value ? '\n' : '') + `${newContent}`;
  }

  popup.style.display = 'block';
  popup.focus();
}

function removePopup() {
  let popup = document.getElementById('info-popup');
  if (popup) {
      //popup.style.display = 'none';
      // Or, if you prefer to remove it completely:
      popup.parentNode.removeChild(popup);
  }
}

function formatSelectedText(text) {
  return text.split('\n')
             .map(line => {
                 // Remove leading dash if present
                 const trimmedLine = line.trimStart();
                 return `  - ${trimmedLine.startsWith('-') ? trimmedLine.substring(1).trimStart() : trimmedLine}`;
             })
             .join('\n');
}

function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.command === "toggleExtension" || request.command === "toggleAlternateExtension") {
      let popup = document.getElementById('info-popup');
      const useAlternateTemplate = request.command === "toggleAlternateExtension";
      if (popup) {
          // Popup exists, format and add selected text
          const selectedText = window.getSelection().toString();
          if (selectedText) {
              const formattedText = formatSelectedText(selectedText);
              updatePopup(formattedText, false, useAlternateTemplate);
          }
      } else {
          // Popup doesn't exist, create with initial content
          const pageInfo = getPageInfo();
          let initialContent;
          if (useAlternateTemplate) {
              initialContent = `- ${pageInfo.title}\n  created:: [[${getCurrentDate()}]]\n  ref:: [web-source](${pageInfo.url})`;
          } else {
              initialContent = `- TODO ${pageInfo.title}\n  created:: [[${getCurrentDate()}]]\n  related-to:: \n  deadline:: \n  ref:: [web-source](${pageInfo.url})`;
          }
          if (pageInfo.selectedText) {
              const formattedText = formatSelectedText(pageInfo.selectedText);
              initialContent += `\n${formattedText}`;
          }
          updatePopup(initialContent, true, useAlternateTemplate);
      }
  } else if (request.command === "copyToClipboard") {
    let popup = document.getElementById('info-popup');
    if (popup) {
        sendResponse(popup.value);
        removePopup(); // Remove the popup after copying
    }
  }
});