<script lang="ts">
  // @ts-nocheck

  import { base } from "$app/paths";

  let id = "";
  $: href = `${base}/gen/${id}`;

  function removeNonValidCharacters(inputString) {
    // Define a regular expression to match non-valid characters
    var nonValidRegex = /[\x00]/g;

    // Replace non-valid characters with an empty string
    return inputString.replace(nonValidRegex, "");
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
    let domElement = null;

    if (payload.domElement) {
      domElement = payload.domElement;
      delete payload.domElement;
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
          result = new TextDecoder("utf-8").decode(value);
          result = removeNonValidCharacters(result);
          try {
            result = JSON.parse(result);
            if (domElement) {
              domElement.value = result["text"][0]
            }
          } catch (error) {
            // Handle the error later
          }
          if (isDone) {
            done = true;
            console.log("Streaming response:", result);
          }
        }
      } else {
        console.log("Error:", response.status, response.statusText);
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
1.1 Exposition. The status quo or ‘ordinary world’ is established.
1.2 Inciting Incident. An event that sets the story in motion.
1.3 Plot Point A. The protagonist decides to tackle the challenge head-on. They ‘cross the threshold,’ and the story is now truly moving.

Confrontation
2.1 Rising Action. The story's true stakes become clear; our hero grows familiar with their ‘new world’ and has their first encounters with some enemies and allies.
2.2 Midpoint. An event that upends the protagonist’s mission.
2.3 Plot Point B. In the wake of the disorienting midpoint, the protagonist is tested — and fails. Their ability to succeed is now in doubt.

Resolution
3.1 Pre Climax. The night is darkest before dawn. The protagonist must pull themselves together and choose between decisive action and failure.
3.2 Climax. They faces off against her antagonist one last time. Will they prevail?
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
      this.overallPlotSummary = null;
      this.debug = debug;
    }

    ingestPlotPointsPremiseFromForm() {
      // Get the plot points from the form
      let plotPoints = {};
      for (let i = 0; i < this.PLOT_POINTS_AMT; i++) {
        const inputElement = document.getElementById(`input_${i + 1}`);
        // get the input value if it exists
        let inputValue = inputElement.value;
        if (inputValue === "") {
          continue;
        }
        plotPoints[this.PLOT_POINTS_NUMBERING[i][0]] = {
          description: inputValue,
        };
      }
      this.plotPoints = plotPoints;
      this.premise = document.getElementById("premise").value;
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

    constructDraftPrompt(plotPointIdx) {
      const pp = this.PLOT_POINTS_NUMBERING.map(([ppIdx, _]) => ppIdx);
      const ppTrueIndex = pp.indexOf(plotPointIdx);
      const prev = ppTrueIndex > 0;
      const next = ppTrueIndex < pp.length - 1;

      const prevText = prev
        ? "\nHere is the previous plot summary:\n" +
          this.plotPoints[pp[ppTrueIndex - 1]].get(
            "summary",
            this.summarisePlotPoint(pp[ppTrueIndex - 1]),
          ) +
          "\n"
        : "";
      const nextText = next
        ? "\nIn the upcoming plot point:\n" +
          this.plotPoints[pp[ppTrueIndex + 1]].get("description") +
          "\n"
        : "";

      let prompt = `[INST] You are a renowned creative writer specialising in the genre of ${this.genre}. ${prevText}
Using the provided summary for the previous plot point and the overall plot summary, write a narrative section for the current plot point. Be creative, explore interesting characters and unusual settings. Do NOT use foreshadowing and ensure that the narrative section ONLY relates to the current prompt. Do not incorporate future plot points.
Here is the current plot prompt:
${this.plotPoints[plotPointIdx]["description"]}[/INST]`;

      return prompt;
    }

    summarisePlotPoint(plotPointIdx) {
      const samplingParams = {
        max_tokens: 4096,
        temperature: 0.3,
        repetition_penalty: 1.15,
        top_p: 1,
        min_p: 0.1,
      };

      const text = this.plotPoints[plotPointIdx]["text"];

      let prompt = `[INST]You are a helpful assistant to a writer. You have been asked to summarise the following narrative section into a few sentences. Here is the plot: ${text}[/INST]`;
      let summary = "";
      try {
        const output = callApi({
          prompt: prompt,
          stream: false,
          sampling_params: samplingParams,
        });
        this.plotPoints[plotPointIdx]["summary"] = output;
        summary = output;
      } catch (error) {
        summary = this.plotPoints[plotPointIdx]["description"];
      }

      if (this.debug) {
        console.log(
          `Summarised plot point ${plotPointIdx} as\n-----------------------------\n${summary}`,
        );
      }

      return summary;
    }

    getPromptReadyPremise() {
      return "Premise: " + this.premise;
    }

    async generatePlotPoints() {
      this.ingestPlotPointsPremiseFromForm();
      const samplingParams = {
        max_tokens: 4096,
        temperature: 0.6,
        stop: ["\n"],
        repetition_penalty: 1.15,
        top_p: 1,
        min_p: 0.1,
      };

      for (let i = 0; i < this.PLOT_POINTS_AMT; i++) {
        const plotPointIdx = this.PLOT_POINTS_NUMBERING[i][0];
        const plotPointDesc = this.PLOT_POINTS_NUMBERING[i][1];
        console.log(plotPointIdx, this.plotPoints);
        if (plotPointIdx in this.plotPoints) {
          continue;
        }

        const inputElement = document.getElementById(`input_${i + 1}`);
        const currentPlotPrompt = this.plotPointsToPrompt();
        let plotPointPrompt = `[INST]You are a renowned writer specialising in the genre of ${this.genre}. You are able to create engaging narratives following a three act structure. Using the Story Structure guide, fill the Story Events suitable for the story as outlined in the premise.
${this.structureTemplate}${this.getPromptReadyPremise()}${currentPlotPrompt}\nCreate a single event for the plot point ${plotPointIdx}, keep it concise and avoid repeating previous plot points.[/INST] ${plotPointIdx} ${plotPointDesc}:`;

        // Call the API
        let payload = {
          prompt: plotPointPrompt,
          stream: true,
          sampling_params: samplingParams,
          domElement: inputElement,
        };

        await callApi(payload).catch((error) => console.error(error));
        this.ingestPlotPointsPremiseFromForm();
      }

      if (this.debug) {
        console.log(`Generated plot points: ${this.plotPointsToPrompt()}`);
      }
    }
  }

  function plotPointsSubmit(event) {
    event.preventDefault();
    storyGenerator.generatePlotPoints();
  }

  let storyGenerator = new StoryGenerator(true);
</script>

<head>
  <title>StoryGen</title>
</head>
<body>
  <h1>Story Structure Input</h1>
  <form on:submit={plotPointsSubmit}>
    <h2>Premise</h2>
    <p>
      <label for="premise">Premise: A brief summary of the story. </label><br />
      <input type="text" id="premise" name="premise" /><br />
    </p>
    <h2>Setup</h2>
    <p>
      <label for="exposition"
        >1.1 Exposition: The status quo or ‘ordinary world’ is established.
      </label><br />
      <input type="text" id="input_1" name="input_1" , class="" /><br />
    </p>
    <p>
      <label for="incitingIncident"
        >1.2 Inciting Incident: An event that sets the story in motion.
      </label><br />
      <input type="text" id="input_2" name="input_2" /><br />
    </p>
    <p>
      <label for="plotPointA"
        >1.3 Plot Point A: The protagonist decides to tackle the challenge
        head-on. They ‘cross the threshold,’ and the story is now truly moving.
      </label><br />
      <input type="text" id="input_3" name="input_3" /><br />
    </p>

    <h2>Confrontation</h2>
    <p>
      <label for="risingAction"
        >2.1 Rising Action: The story's true stakes become clear; our hero grows
        familiar with their ‘new world’ and has their first encounters with some
        enemies and allies.
      </label><br />
      <input type="text" id="input_4" name="input_4" /><br />
    </p>
    <p>
      <label for="midpoint"
        >2.2 Midpoint: An event that upends the protagonist’s mission.
      </label><br />
      <input type="text" id="input_5" name="input_5" /><br />
    </p>
    <p>
      <label for="plotPointB"
        >2.3 Plot Point B: In the wake of the disorienting midpoint, the
        protagonist is tested — and fails. Their ability to succeed is now in
        doubt.
      </label><br />
      <input type="text" id="input_6" name="input_6" /><br />
    </p>

    <h2>Resolution</h2>
    <p>
      <label for="preClimax"
        >3.1 Pre Climax: The night is darkest before dawn. The protagonist must
        pull themselves together and choose between decisive action and failure.
      </label><br />
      <input type="text" id="input_7" name="input_7" /><br />
    </p>
    <p>
      <label for="climax"
        >3.2 Climax: They faces off against her antagonist one last time. Will
        they prevail?
      </label><br />
      <input type="text" id="input_8" name="input_8" /><br />
    </p>
    <p>
      <label for="denouement"
        >3.3 Denouement: All loose ends are tied up. The reader discovers the
        consequences of the climax. A new status quo is established.
      </label><br />
      <input type="text" id="input_9" name="input_9" /><br />
    </p>
    <button type="submit">Submit</button>
  </form>
</body>

<!-- <p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<input type="text" bind:value={id} placeholder="Choose an ID to go to." />

<p>Visit <a {href}>this dynamic route ({href})</a></p> -->

<style>
  /* make the input boxes large */
  input {
    width: 100%;
    height: 100px;
  }
</style>
