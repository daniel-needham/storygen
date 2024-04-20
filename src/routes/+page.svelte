<script lang="ts">
  // @ts-nocheck

  import { base } from "$app/paths";

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
    document.getElementById("premise").value = "";
    for (let i = 1; i <= 9; i++) {
      document.getElementById(`input_${i}`).value = "";
    }
  }

  async function callApi(payload) {
    // Define the API endpoint
    const apiEndpoint = "https://as6xb.apps.beam.cloud/generate";

    // Define the authorization token
    const headers = {
      Authorization:
        "Basic NzAyMmQyOTRkMjhiZjc2MmQzOGE0YzU2ODNkY2UzMjI6OThhM2E5NDFmMGNmZGU2NWM5MjMyOWExYWZkZjZmNjI=",
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

      let prompt = `[INST]You are a helpful assistant to a writer. You have been asked to update a numbered list of key plot points taken place in the story so far. Please take the newest text passage and add the most important key points to the key plot points so far. Here are the key plot points so far: ${this.overallPlotSummary} Here is the text: ${text}[/INST]`;
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
    }

    async generatePlotPoints() {
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
      .then(() => console.log(storyGenerator.plotPoints));
  }
  let storyGenerator = new StoryGenerator(true);
</script>

<head>
  <title>StoryGen</title>
</head>
<body>
  <div class="container">
    <form on:submit={generateStoryButton} on:reset={resetForm}>
    <!-- Setup -->
    <div class="box">
      <div class="labels">
        <p id="label_1">
          <b>Exposition</b><br />The status quo or ‘ordinary world’ is
          established.
        </p>
        <p id="label_2">
          <b>Inciting Incident</b><br />An event that sets the story in motion.
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
    <div class="box">
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
          <b>Plot Point B</b><br />In the wake of the disorienting midpoint, the
          protagonist is tested — and fails. Their ability to succeed is now in
          doubt.
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
    <div class="box">
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

          <p>
            <label for="premise"
              >Story Premise
            </label>
            <textarea id="premise" name="premise"></textarea>
          </p>
          <p>
            <label for="genre">Genre</label>
            <select name="genre" id="genre">
              <option value="science_fiction"> Science Fiction </option>
              <option value="love_stories"> Love Stories </option>
              <option value="ghost_stories"> Ghost Stories </option>
            </select>
          </p>
          <div>
          <button type="submit">Generate Story!</button>
          <button type="reset">Reset</button>
        </div>
        <div id="loading_spinner" class="hide"></div>

      </div>

     
    </form>
    <div id="story" class="hide">
      <div id="buttonContainer">
        <button type="button" id="close" on:click={toggleStoryGen}>Close</button
        >
        <button type="button" id="download">Download</button>
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
    line-height: 1.6;
    margin: 0;
    padding: 0;
  }

  .container {
    max-width: 85%;
    margin: 0 auto;
    padding: 20px;
  }

  :global(.active) {
    border: 2px solid #1e236d !important;
    }

  .labels {
    display: flex;
  }

  .labels p {
    flex: 1;
    border-radius: 10px;
    padding: 10px;
    padding-bottom: 10px;
    border: 2px solid #bd213100;
  }

  .group {
    display: flex;
  }

  textarea {
    flex: 1;
    min-width: 100px;
    resize: none; /* Disable resizing via drag */
    min-height: 100px;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    transition: all 0.3s ease; /* Add transition for smooth size changes */
  }

  /* Increase size when focused */
  textarea:focus {
    flex: 2;
    min-width: 200px;
  }

  textarea:not(:focus) {
    flex: 1;
  }

  textarea + textarea {
    margin-left: 10px;
  }

  button {
    background-color: #007bff;
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
    background-color: #0056b3;
  }

  button[type="reset"] {
    background-color: #dc3545;
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
    background-color: white;
    border: 2px solid black;
    padding: 20px;
    overflow-y: auto;
    z-index: 9999;
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
    width: 85%;
    min-height: 150px;
    height:10%;

  }

  #loading_spinner {
    display: none;
    width: 100px;
    height: 100px;
    background-color: #333;
    border-radius: 50%;
    border: 16px solid #f3f3f3;
    border-top: 16px solid #3498db;
    width: 120px;
    height: 120px;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
  }
</style>
