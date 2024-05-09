<script lang="ts">
  // @ts-nocheck
  import { base } from "$app/paths";
  import DownloadButton from "./DownloadButton.svelte";
  import LoadingSpinner from "./LoadingSpinner.svelte";

  //todo:
  // 1. handle bad request from api (error handling)
  // 2. add loading spinner
  // 3. add download button

  import { onMount, afterUpdate } from "svelte";

  let scrollDiv;

  onMount(() => {
    scrollToBottom();
  });

  afterUpdate(() => {
    scrollToBottom();
  });

  function scrollToBottom() {
    if (scrollDiv) {
      scrollDiv.scrollTop = scrollDiv.scrollHeight;
    }
  }

  let plotPointsLoading = false;
  let domPlotPoints = {
    "1": "",
    "2": "",
    "3": "",
    "4": "",
    "5": "",
    "6": "",
    "7": "",
    "8": "",
    "9": "",
  };

  let showStoryGen = false;
  let domStory = [];
  let downloadableStory = "";

  function downloadTextFile() {
    if (downloadableStory.trim() !== "") {
      const element = document.createElement("a");
      const file = new Blob([downloadableStory], { type: "text/plain" });

      element.href = URL.createObjectURL(file);
      element.download = "downloaded-text.txt";

      // Accessibility attributes for screen readers
      element.setAttribute("aria-hidden", "true");
      element.style.display = "none";

      document.body.appendChild(element);
      element.click();

      // Clean up
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href); // Revoke the object URL
    }
  }

  function togglePlotPointsLoading() {
    plotPointsLoading = !plotPointsLoading;
  }

  function addStorySection() {
    //add an empty string to the end of the story array
    domStory.push("");
  }

  function updateStory(str) {
    // get last element of story array
    // append the new string to the last element
    domStory[domStory.length - 1] = str;
  }

  function updatePlotPoint(str, index) {
    domPlotPoints[index.toString()] = str;
  }

  function toggleStoryGen() {
    if (showStoryGen) {
      showStoryGen = false;
      domStory = [];
      downloadableStory = "";
      storyGenerator.clearStory();
      document.getElementById("story").classList.add("hide");
      document.getElementById("story").classList.remove("show");
    } else {
      showStoryGen = true;
      document.getElementById("story").classList.add("show");
      document.getElementById("story").classList.remove("hide");
    }
  }

  let focusedPlotPoint = null; // Initialize index as null

  function focusPlotPoint() {
    console.log(focusedPlotPoint);
    const labels = document.querySelectorAll(".labels p");
    const textareas = document.querySelectorAll(".group textarea");

    labels.forEach((label, i) => {
      if (i === focusedPlotPoint) {
        console.log("focused", i);
        label.classList.add("active");
        console.log(label.classList);
        textareas[i].focus(); // Focus the corresponding textarea
      } else {
        label.classList.remove("active");
      }
    });
  }

  function focus(fe) {
    const index = parseInt(fe.target.id.split("_")[1]) - 1;
    focusedPlotPoint = index;
    focusPlotPoint();
  }

  function focusIndex(index) {
    focusedPlotPoint = index;
    focusPlotPoint();
  }

  function removeFocus() {
    focusedPlotPoint = null;
    focusPlotPoint();
  }

  function removeNonValidCharacters(inputString) {
    // Define a regular expression to match non-valid characters
    var nonValidRegex = /[\x00]/g;

    // Replace non-valid characters with an empty string
    return inputString.replace(nonValidRegex, "");
  }

  function resetForm(event) {
    event.preventDefault();
    storyGenerator.clearStory();
    document.getElementById("premise").value = "";
    for(let i = 1; i <= 9; i++) {
      updatePlotPoint("", i);
    }
  }

  function updateDownloadableStory() {
    downloadableStory = domStory.join("\n");
  }

  async function callApi(payload) {
    // Define the API endpoint
    const apiEndpoint = "https://as6xb.apps.beam.cloud/generate";
    const API_KEY = import.meta.env.VITE_BEAM_API_KEY 
    console.log(API_KEY)

    // Define the authorization token
    const headers = {
      Authorization:
        API_KEY,
      "Content-Type": "application/json",
      // Add any other headers if required
    };

    const stream = payload.stream || false;
    let index = null;

    if (payload.index) {
      index = payload.index;
      delete payload.index;
    }

    if (stream) {
      // Make a POST request to the API endpoint
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
        compress: false,
        follow: 20,
        size: 0,
        timeout: 0,
      });

      // Handle the streaming response
      if (response.ok) {
        const reader = response.body.getReader();
        let done = false;
        let result = "";
        while (!done) {
          const { value, done: isDone } = await reader.read();
          let temp_result = new TextDecoder("utf-8").decode(value);
          temp_result = removeNonValidCharacters(temp_result);
          try {
            result = JSON.parse(temp_result);
            if (index) {
              updatePlotPoint(result.text[0].trim(), index);
            } else {
              if (!showStoryGen) {
                done = true;
              }
              updateStory(result.text[0].trim());
            }
          } catch (error) {
            // Handle the error later
            console.error(error);
          }
          if (isDone) {
            done = true;
          }
        }
      } else {
        throw new Error("Error:", response.status, response.statusText);
      }
    } else {
      // Make a POST request to the API endpoint
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      // Handle the non-streaming response
      if (response.ok) {
        const jsonData = await response.json();
        return jsonData.text[0].trim(); // Return the response text
      } else {
        console.log("Error:", response.status, response.statusText);
      }
    }
  }

  class StoryGenerator {
    constructor(debug = false) {
      this.structureTemplate = `## Story Structure
Setup
1.1 Exposition. The status quo or "ordinary world" is established.
1.2 Inciting Incident. An event that sets the story in motion.
1.3 Plot Point A. The protagonist decides to tackle the challenge head-on. They "cross the threshold" and the story is now truly moving.

Confrontation
2.1 Rising Action. The story's true stakes become clear; our hero grows familiar with their "new world" and has their first encounters with some enemies and allies.
2.2 Midpoint. An event that upends the protagonist's mission.
2.3 Plot Point B. In the wake of the disorienting midpoint, the protagonist is tested — and fails. Their ability to succeed is now in doubt.

Resolution
3.1 Pre Climax. The night is darkest before dawn. The protagonist must pull themselves together and choose between decisive action and failure.
3.2 Climax. They face off against their antagonist one last time. Will they prevail?
3.3 Denouement. All loose ends are tied up. The reader discovers the consequences of the climax. A new status quo is established.
`;
      this.PLOT_POINTS_AMT = 9;
      this.PLOT_POINTS_NUMBERING = [
        ["1.1", "Exposition"],
        ["1.2", "Inciting Incident"],
        ["1.3", "Plot Point A"],
        ["2.1", "Rising Action"],
        ["2.2", "Midpoint"],
        ["2.3", "Plot Point B"],
        ["3.1", "Pre Climax"],
        ["3.2", "Climax"],
        ["3.3", "Denouement"],
      ];
      this.id = null;
      this.premise = null;
      this.genre = null;
      this.premise = null;
      this.plotPoints = null;
      this.overallPlotSummary = "1.";
      this.debug = debug;
    }

    getPromptReadyGenre() {
      if (this.genre) {
        return this.genre.replace("_", " ");
      } else {
        return "science fiction";
      }
    }

    extractFromForm() {
      // Get the plot points from the form
      let plotPoints = {};
      for (let i = 0; i < this.PLOT_POINTS_AMT; i++) {
        const inputValue = domPlotPoints[i + 1];
        if (inputValue === "") {
          continue;
        }
        plotPoints[this.PLOT_POINTS_NUMBERING[i][0]] = {
          description: inputValue,
        };
      }
      this.plotPoints = plotPoints;
      this.premise = document.getElementById("premise").value;
      this.genre = document.getElementById("genre").value;
    }

    plotPointsToPrompt() {
      const values = [];

      for (const [plotPointIdx, _] of this.PLOT_POINTS_NUMBERING) {
        if (plotPointIdx in this.plotPoints) {
          values.push(this.plotPoints[plotPointIdx]["description"]);
        } else {
          values.push("");
        }
      }

      let prompt = `
## Story Events
Setup

1.1 ${values[0]}
1.2 ${values[1]}
1.3 ${values[2]}

Confrontation

2.1 ${values[3]}
2.2 ${values[4]}
2.3 ${values[5]}

Resolution

3.1 ${values[6]}
3.2 ${values[7]}
3.3 ${values[8]}
`;

      return prompt;
    }

    getPreviousSectionContext(plotPointIndex, contextCharacterLength) {
      let text = this.plotPoints[plotPointIndex]["text"];

      // split the text by new line
      let textArray = text.split("\n");
      let contextArray = [];

      while (
        contextArray.join("").length < contextCharacterLength &&
        textArray.length > 0
      ) {
        contextArray.push(textArray.pop());
      }

      return contextArray.reverse().join("\n");
    }

    async constructDraftPrompt(plotPointIdx) {
      const pp = this.PLOT_POINTS_NUMBERING.map(([ppIdx, _]) => ppIdx);
      const ppTrueIndex = pp.indexOf(plotPointIdx);
      const prev = ppTrueIndex > 0;
      const final = ppTrueIndex === pp.length - 1;
      let prevText = "";
      let finalText = "";
      let promptSeed = "";

      if (prev) {
        prevText =
          this.plotPoints[pp[ppTrueIndex - 1]]["summary"] ??
          (await this.summariseStory(pp[ppTrueIndex - 1]));
        prevText =
          "\nHere is a summary of the plot so far:\n" +
          prevText +
          "\n" +
          "Using the provided summary for the plot so far, write a narrative section for the current plot point to continue the plot.";
        promptSeed = this.getPreviousSectionContext(pp[ppTrueIndex - 1], 200);
      } else {
        prevText =
          "Write a narrative section for the current plot point which will kick off the plot and establish the world.";
      }

      if (final) {
        finalText =
          " This is the final plot point and should resolve the story in a satisfying way.";
      }

      let prompt = `[INST] You are a renowned creative writer specialising in the genre of ${this.getPromptReadyGenre()}. ${prevText} Be creative, explore interesting characters and unusual settings.${finalText}
Here is the current plot prompt:
${this.plotPoints[plotPointIdx]["description"]}[/INST]${promptSeed}`;

      return prompt;
    }

    async summariseStory(plotPointIdx) {
      const samplingParams = {
        max_tokens: 4096,
        temperature: 0.3,
        repetition_penalty: 1.15,
        top_p: 1,
        min_p: 0.1,
      };

      let text = this.plotPoints[plotPointIdx]["text"];

      let prompt = `[INST]You are a helpful assistant to a writer. You have been asked to update an extremely concise story summary. Please take the newest text passage and add the most important key points to summary so far. Keep it brief! Here is the summary so far: ${this.overallPlotSummary} Here is the text: ${text}[/INST]`;
      let summary = "";

      console.log("summarise prompt", prompt);

      try {
        const output = await callApi({
          prompt: prompt,
          stream: false,
          sampling_params: samplingParams,
        });
        summary = output;
      } catch (error) {
        summary = this.overallPlotSummary;
      }

      this.plotPoints[plotPointIdx]["summary"] = summary;
      this.overallPlotSummary = summary;

      if (this.debug) {
        console.log(
          `Summarised plot up to ${plotPointIdx} as\n-----------------------------\n${summary}`,
        );
      }

      return summary;
    }

    getPromptReadyPremise() {
      return "Premise: " + this.premise;
    }

    clearStory() {
      this.plotPoints = null;
      this.overallPlotSummary = "1.";
    }

    async generatePlotPoints() {
      togglePlotPointsLoading();
      this.extractFromForm();
      const samplingParams = {
        max_tokens: 4096,
        temperature: 0.6,
        stop: ["\n"],
        repetition_penalty: 1.15,
        top_p: 1,
        min_p: 0.1,
      };

      for (let i = 0; i < this.PLOT_POINTS_AMT; i++) {
        //text area focus
        focusIndex(i);

        const plotPointIdx = this.PLOT_POINTS_NUMBERING[i][0];
        const plotPointDesc = this.PLOT_POINTS_NUMBERING[i][1];
        console.log(plotPointIdx, this.plotPoints);
        if (plotPointIdx in this.plotPoints) {
          continue;
        }

        const currentPlotPrompt = this.plotPointsToPrompt();
        let plotPointPrompt = `[INST]You are a renowned writer specialising in the genre of ${this.getPromptReadyGenre()}. You are able to create engaging narratives following a three act structure. Using the Story Structure guide, fill the Story Events suitable for the story as outlined in the premise.
${this.structureTemplate}${this.getPromptReadyPremise()}${currentPlotPrompt}\nCreate a single event for the plot point ${plotPointIdx}, keep it concise and avoid repeating previous plot points.[/INST] ${plotPointIdx} ${plotPointDesc}:`;

        // Call the API
        let payload = {
          prompt: plotPointPrompt,
          stream: true,
          sampling_params: samplingParams,
          index: i + 1,
        };

        await callApi(payload).catch((error) => console.error(error));
        this.extractFromForm();
        removeFocus();
      }

      if (this.debug) {
        console.log(`Generated plot points: ${this.plotPointsToPrompt()}`);
      }

      togglePlotPointsLoading();
    }

    async generateStory() {
      const samplingParams = {
        max_tokens: 4096,
        temperature: 0.8,
        repetition_penalty: 1.15,
        top_p: 1,
        min_p: 0.1,
      };

      for (let i = 0; i < this.PLOT_POINTS_AMT; i++) {
        if (!showStoryGen) {
          break;
        }

        const plotPointIdx = this.PLOT_POINTS_NUMBERING[i][0];
        const draftPrompt = await this.constructDraftPrompt(plotPointIdx);
        this.plotPoints[plotPointIdx]["draft_prompt"] = draftPrompt;

        addStorySection();

        // Call the API
        let payload = {
          prompt: draftPrompt,
          stream: true,
          sampling_params: samplingParams,
          lora: this.genre,
        };

        if (this.debug) {
          console.log(`Payload for plot point ${plotPointIdx}:`);
          console.log(payload);
        }

        await callApi(payload).catch((error) => console.error(error));

        this.plotPoints[plotPointIdx]["text"] = domStory[i];

        if (this.debug) {
          console.log(`Generated plot point ${plotPointIdx}`);
        }
      }
    }
  }

  function generateStoryButton(event) {
    event.preventDefault();
    storyGenerator
      .generatePlotPoints()
      .then(() => toggleStoryGen())
      .then(() => storyGenerator.generateStory())
      .then(() => console.log(storyGenerator.plotPoints))
      .then(() => updateDownloadableStory());
  }
  let storyGenerator = new StoryGenerator(false);
</script>

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>StoryGen</title>
  <style>
    html {
      background-color: #374259; /* Change this to the color you want */
      scrollbar-color: #5c8984 #192235;
    }
  </style>
</head>
<body>
  <div class="container">
    <form on:submit={generateStoryButton} on:reset={resetForm}>
      <!-- Setup -->
      <div class="box" id="topBox">
        <div class="labels">
          <p id="label_1">
            <b>Exposition</b><br />The status quo or ‘ordinary world’ is
            established.
          </p>
          <p id="label_2">
            <b>Inciting Incident</b><br />An event that sets the story in
            motion.
          </p>
          <p id="label_3">
            <b>Plot Point A</b><br />The protagonist decides to tackle the
            challenge head-on. They ‘cross the threshold,’ and the story is now
            truly moving.
          </p>
        </div>
        <div class="group">
          <textarea
            id="input_1"
            name="input_1"
            bind:value={domPlotPoints["1"]}
            on:focus={focus}
            on:blur={removeFocus}
          ></textarea>

          <textarea
            id="input_2"
            name="input_2"
            bind:value={domPlotPoints["2"]}
            on:focus={focus}
            on:blur={removeFocus}
          ></textarea>

          <textarea
            id="input_3"
            name="input_3"
            bind:value={domPlotPoints["3"]}
            on:focus={focus}
            on:blur={removeFocus}
          ></textarea>
        </div>
      </div>
      <!-- Confrontation -->
      <div class="box" id="middleBox">
        <div class="labels">
          <p id="label_4">
            <b>Rising Action</b><br />The story's true stakes become clear; our
            hero grows familiar with their ‘new world’ and has their first
            encounters with some enemies and allies.
          </p>
          <p id="label_5">
            <b>Midpoint</b><br />An event that upends the protagonist’s mission.
          </p>
          <p id="label_6">
            <b>Plot Point B</b><br />In the wake of the disorienting midpoint,
            the protagonist is tested — and fails. Their ability to succeed is
            now in doubt.
          </p>
        </div>
        <div class="group">
          <textarea
            id="input_4"
            name="input_4"
            bind:value={domPlotPoints["4"]}
            on:focus={focus}
            on:blur={removeFocus}
          ></textarea>

          <textarea
            id="input_5"
            name="input_5"
            bind:value={domPlotPoints["5"]}
            on:focus={focus}
            on:blur={removeFocus}
          ></textarea>

          <textarea
            id="input_6"
            name="input_6"
            bind:value={domPlotPoints["6"]}
            on:focus={focus}
            on:blur={removeFocus}
          ></textarea>
        </div>
      </div>
      <!-- Resolution -->
      <div class="box" id="bottomBox">
        <div class="labels">
          <p id="label_7">
            <b>Pre Climax</b><br />Night is darkest before dawn. The protagonist
            must pull themselves together and choose between decisive action and
            failure.
          </p>
          <p id="label_8">
            <b>Climax</b><br />They face off against their antagonist one last
            time. Will they prevail?
          </p>
          <p id="label_9">
            <b>Denouement</b><br />All loose ends are tied up. The reader
            discovers the consequences of the climax. A new status quo is
            established.
          </p>
        </div>
        <div class="group">
          <textarea
            id="input_7"
            name="input_7"
            bind:value={domPlotPoints["7"]}
            on:focus={focus}
            on:blur={removeFocus}
          ></textarea>

          <textarea
            id="input_8"
            name="input_8"
            bind:value={domPlotPoints["8"]}
            on:focus={focus}
            on:blur={removeFocus}
          ></textarea>

          <textarea
            id="input_9"
            name="input_9"
            bind:value={domPlotPoints["9"]}
            on:focus={focus}
            on:blur={removeFocus}
          ></textarea>
        </div>
      </div>

      <!-- Premise -->
      <div class="box" id="bottom">
        <div id="premiseBox">
          <label for="premise">Enter your story premise here:</label>
          <textarea id="premise" name="premise"></textarea>
        </div>
        <div id="genreBox">
          <label for="genre">Genre</label>
          <select name="genre" id="genre">
            <option value="science_fiction"> Science Fiction </option>
            <option value="ghost_stories"> Ghost Stories </option>
          </select>
        </div>
        <div id="buttonBox">
          <button type="submit">Generate Story!</button>
          <button type="reset">Reset</button>
        </div>
        <div id="loadingSpinnerContainer">
          {#if plotPointsLoading}
            <LoadingSpinner />
          {:else}
            <div style="width: 50px;"></div>
          {/if}
        </div>
      </div>
    </form>
    <div id="story" class="hide">
      <div id="buttonContainer">
        <button
          type="button"
          id="download"
          on:click={downloadTextFile}
          aria-label="Download Text"
        >
          <svg
            class="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"
            />
          </svg>
        </button>
        <button type="button" id="close" on:click={toggleStoryGen}>
          <svg
            class="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </button>
      </div>
      <div bind:this={scrollDiv} id="scrollDiv">
        {#each domStory as section}
          <p>{@html section}</p>
        {/each}
      </div>
    </div>
  </div>
</body>

<style>

  body {
    font-family: Arial, sans-serif;
    color: #f2d8d8;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    height: 70%;
    width: 100vw;
    background-color: #374259;
    
  }

  hr {
    border: 0;
    border-top: 4px solid #5c8984;
    margin-top: 20px;
  }

  .container {
    max-width: 85%;
    margin: 0 auto;
  }

  #topBox {
    background-image: linear-gradient(
      to top,
      #192235,
      #202a3e,
      #283247,
      #2f3a50,
      #374259
    );
  }

  #middleBox {
    background-color: #192235;
  }

  #bottomBox {
    background-image: linear-gradient(
      to bottom,
      #192235,
      #202a3e,
      #283247,
      #2f3a50,
      #374259
    );
  }

  :global(.active) {
    border: 2px solid #5c8984 !important;
  }

  .labels {
    display: flex;
  }

  .labels p {
    flex: 1;
    border-radius: 10px;
    padding: 5px;
    border: 2px solid #fffcfc00;
  }

  .group {
    display: flex;
  }

  textarea {
    flex: 1;
    background-color: #374259;
    color: #f2d8d8;
    min-width: 100px;
    resize: none; /* Disable resizing via drag */
    min-height: 100px;
    padding: 10px;
    box-sizing: border-box;
    border: 2px solid #5c8984;
    border-radius: 4px;
    font-size: 16px;
    transition: all 0.3s ease; /* Add transition for smooth size changes */
    scrollbar-color: #5c8984 #192235;
  }

  /* Increase size when focused */
  textarea:focus {
    flex: 2;
    min-width: 200px;
    border: 2px solid #5c8984;
  }

  textarea:not(:focus) {
    flex: 1;
  }

  textarea + textarea {
    margin-left: 10px;
  }

  button {
    background-color: #1a4675;
    color: white;
    font-size: 16px;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 20px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  button:hover {
    background-color: #2263a8;
  }

  button[type="reset"] {
    background-color: #5c181e;
    margin-right: 10px;
  }

  button[type="reset"]:hover {
    background-color: #bd2130;
  }

  #story {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    background-color: #192235;
    border: 2px solid black;
    padding: 20px;
    padding-top: 50px;
    overflow-y: auto;
    z-index: 9999;
    color: #f2d8d8;
    scrollbar-color: #5c8984 #192235;
  }

  #scrollDiv {
    height: 100%;
    width: 100%;
    overflow-y: auto;
  }

  #story p {
    white-space: pre-line;
  }

  #buttonContainer {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    padding: 0px;
  }

  #close {
    background-color: #5c181e;
    margin-top: 0px;
  }

  #close:hover {
    background-color: #bd2130;
  }

  #download {
    background-color: #1a4675;
    margin-top: 0px;
  }

  #download:hover {
    background-color: #2263a8;
  }



  .show {
    display: block;
  }

  .hide {
    display: none;
  }

  #bottom {
    /* keep stuck to the bottom of the screen */
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    min-height: 100px;
    height: 20vh;
    background-color: #192235;
  }

  #premiseBox {
    padding: 20px;
    flex: 3;
    display: flex;
    flex-direction: column;
  }

  #premiseBox label {
    margin-bottom: 10px;
    font-size: larger;
  }

  #genreBox {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  #loadingSpinnerContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50x;
    height: 100%;
    padding: 20px;
  }

  #genreBox {
    margin-bottom: 20px; /* Add space below the genre box */

    color: #f2d8d8;
    content: flex;
    flex-direction: column;
    align-items: left;
    width: fit-content;
  }

  /* Styling for the label */
  label {
    margin-bottom: 10px;
    font-size: larger;
  }

  /* Styling for the select dropdown */
  select {
    width: 200px; /* Set width of the dropdown */
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #374259;
    color: #f2d8d8;
  }

  /* Styling for the options in the dropdown */
  option {
    font-size: 14px;
    background-color: #374259;
  }

  #buttonBox {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
