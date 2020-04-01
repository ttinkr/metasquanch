const download = () => {
  window.open('/download');
}

const show = () => {
  const xhr = new XMLHttpRequest;
  xhr.open('GET', '/logs');
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 0 || (200 >= xhr.status && xhr.status < 400)) {
        var response = JSON.parse(xhr.responseText);
        document.getElementById("log-content").textContent = JSON.stringify(response, undefined, 2);
      }
    }
  }
  xhr.send();
}

Dropzone.options.uploadWidget = {
  paramName: 'files[]',
  maxFileSize: 20,
  maxFiles: 20,
  dictDefaultMessage: 'Drag a file here to squanch or click to squanch one',
  acceptedFiles: 'image/*, application/pdf, application/msword, application/vnd.openxmlformats-*, application/vnd.ms-*',
  createImageThumbnails: false,
  uploadMultiple: true,
  parallelUploads: 2000,
  successmultiple: function () {
    let showButton = document.getElementById("show-button"),
      downloadButton = document.getElementById("download-button");
    showButton.style.visibility = "visible";
    downloadButton.style.visibility = "visible";
    showButton.addEventListener("click", show);
    downloadButton.addEventListener("click", download);
  }
}