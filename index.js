// require modules
const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");

// create app
const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

// load apiKey environment variable
dotenv.config();
const apiKey = process.env.API_KEY;

// initialize variables for API waiting
let secondCount = 0;
let interval = 5; // Check every 5 seconds

// render main page
app.get("/", (req, res) => {
  res.render("imageForm"); // actual form page to use
  // res.render("formTest"); // for testing purposes (autofilled and hidden)
});

app.get("/imageView", (req, res) => {
  res.render("imageView", { imageUrl: "https://img.midjourneyapi.xyz/mj/e46e47e3-9456-40b5-9280-a280666a9225.png" });
});

// generate images using GoAPI
app.post("/generate", (req, res) => {
  // set form data to variable
  let submissionData = req.body;

  // changes description in prompt if null
  if (submissionData.description == "") {
    submissionData.description = "with the name of";
  } else {
    submissionData.description = `with the description of ${submissionData.description} and the name of`;
  }

  // set prompt text
  let promptText = `${submissionData.imageLink} ${submissionData.photoStyle} portrait of ${submissionData.age} year-old ${submissionData.ethnicity} ${submissionData.gender}
                in ${parseInt(submissionData.birthYear) + parseInt(submissionData.age)}s attire from ${submissionData.country}
                ${submissionData.description} ${submissionData.firstName} ${submissionData.lastName} --no hats, glasses --ar 1:1 --s 250 --c 3 --iw 2.0`;

  // remove new lines
  promptText = promptText.replace(/\s+/g, " ");

  // set options for request
  const options = {
    headers: {
      "X-API-KEY": apiKey
    },
    data: {
      prompt: promptText,
      aspect_ratio: "1:1",
      process_mode: "fast", // sets speed of generation
      webhook_endpoint: "",
      webhook_secret: ""
    },
    // imagine endpoint
    url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
    method: "post"
  };

  // test prompt output
  console.log(`\nPrompt:\t${options.data.prompt}\n`);

  // make request
  axios(options)
    .then((response) => {
      // test response
      console.log(response.status);
      console.log(`task_id:\t${response.data.task_id}`);
      console.log(`status:\t\t${response.data.status}\n`);

      // initialize second count
      secondCount = 0;

      // check status for image retrieval
      checkStatus(response.data, res);
    })
    .catch((error) => console.error(`Image Generation Request Error: ${error}`));
});

// check status recursively
function checkStatus(taskData, res) {
  axios
    .post("https://api.midjourneyapi.xyz/mj/v2/fetch", taskData)
    .then((response) => {
      const status = response.data.status;

      // image generation finished
      if (status === "finished") {
        console.log(`\nImage generation finished! (${secondCount}s)`);
        console.log(`Image URL: ${response.data.task_result.image_url}`);
        res.render("imageView", { imageUrl: response.data.task_result.image_url });
        // image generation failed
      } else if (status === "failed") {
        throw new Error(`\nImage generation failed. (${secondCount}s)`);
        // image generation pending
      } else {
        console.log(`Image generation ${status}... (${secondCount}s)`);
        secondCount += interval;
        setTimeout(() => {
          checkStatus(taskData, res); // Recursive call after a delay
        }, interval * 1000);
      }
    })
    .catch((error) => {
      console.error(`Image Fetch Error: ${error}`);
    });
}

// start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
