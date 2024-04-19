// hide form and show loading screen
function showLoading() {
  document.getElementById("imageSubmissionForm").style.display = "none";
  document.getElementById("loadingIconContainer").style.display = "flex";
}

// hide loading screen and show form
function showForm() {
  document.getElementById("imageSubmissionForm").style.display = "flex";
  document.getElementById("loadingIconContainer").style.display = "none";
}

// download image from image clicked on
function saveImage(imageNum) {
  // get image from page
  const sourceImage = document.getElementById("generatedImage");
  const image = new Image();
  image.src = sourceImage.src;

  // create canvas to draw image onto
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = image.naturalWidth / 2;
  canvas.height = image.naturalHeight / 2;

  // calculate coordinates for selected image
  let x, y;
  if (imageNum === 1) {
    x = 0;
    y = 0;
  } else if (imageNum === 2) {
    x = -image.naturalWidth / 2;
    y = 0;
  } else if (imageNum === 3) {
    x = 0;
    y = -image.naturalHeight / 2;
  } else if (imageNum === 4) {
    x = -image.naturalWidth / 2;
    y = -image.naturalHeight / 2;
  }

  // draw selected image only
  ctx.drawImage(sourceImage, x, y);

  // create a temporary link and trigger download
  const link = document.createElement("a");
  link.download = "generated_image_" + imageNum + ".png";
  link.href = canvas.toDataURL();
  link.click();
}
