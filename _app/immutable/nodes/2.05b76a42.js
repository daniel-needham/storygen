import{s as w,n as P}from"../chunks/scheduler.e108d1fd.js";import{S,i as N,g as d,s as T,h as f,y as b,c as v,j as I,f as g,a as y,x as _,z as O}from"../chunks/index.c1d64499.js";import"../chunks/paths.d1b6eb6e.js";function E(p){let i,m="<title>StoryGen</title>",h,s,t,n="Story Structure Input",o,e,r=`<h2>Premise</h2> <p><label for="premise">Premise: A brief summary of the story. </label><br/> <input type="text" id="premise" name="premise" class="svelte-5pnh54"/><br/></p> <h2>Setup</h2> <p><label for="exposition">1.1 Exposition: The status quo or ‘ordinary world’ is established.
      </label><br/> <input type="text" id="input_1" name="input_1" ,="" class=" svelte-5pnh54"/><br/></p> <p><label for="incitingIncident">1.2 Inciting Incident: An event that sets the story in motion.
      </label><br/> <input type="text" id="input_2" name="input_2" class="svelte-5pnh54"/><br/></p> <p><label for="plotPointA">1.3 Plot Point A: The protagonist decides to tackle the challenge
        head-on. They ‘cross the threshold,’ and the story is now truly moving.
      </label><br/> <input type="text" id="input_3" name="input_3" class="svelte-5pnh54"/><br/></p> <h2>Confrontation</h2> <p><label for="risingAction">2.1 Rising Action: The story&#39;s true stakes become clear; our hero grows
        familiar with their ‘new world’ and has their first encounters with some
        enemies and allies.
      </label><br/> <input type="text" id="input_4" name="input_4" class="svelte-5pnh54"/><br/></p> <p><label for="midpoint">2.2 Midpoint: An event that upends the protagonist’s mission.
      </label><br/> <input type="text" id="input_5" name="input_5" class="svelte-5pnh54"/><br/></p> <p><label for="plotPointB">2.3 Plot Point B: In the wake of the disorienting midpoint, the
        protagonist is tested — and fails. Their ability to succeed is now in
        doubt.
      </label><br/> <input type="text" id="input_6" name="input_6" class="svelte-5pnh54"/><br/></p> <h2>Resolution</h2> <p><label for="preClimax">3.1 Pre Climax: The night is darkest before dawn. The protagonist must
        pull themselves together and choose between decisive action and failure.
      </label><br/> <input type="text" id="input_7" name="input_7" class="svelte-5pnh54"/><br/></p> <p><label for="climax">3.2 Climax: They faces off against her antagonist one last time. Will
        they prevail?
      </label><br/> <input type="text" id="input_8" name="input_8" class="svelte-5pnh54"/><br/></p> <p><label for="denouement">3.3 Denouement: All loose ends are tied up. The reader discovers the
        consequences of the climax. A new status quo is established.
      </label><br/> <input type="text" id="input_9" name="input_9" class="svelte-5pnh54"/><br/></p> <button type="submit">Submit</button>`,a,c;return{c(){i=d("head"),i.innerHTML=m,h=T(),s=d("body"),t=d("h1"),t.textContent=n,o=T(),e=d("form"),e.innerHTML=r},l(l){i=f(l,"HEAD",{"data-svelte-h":!0}),b(i)!=="svelte-4z3owu"&&(i.innerHTML=m),h=v(l),s=f(l,"BODY",{});var u=I(s);t=f(u,"H1",{"data-svelte-h":!0}),b(t)!=="svelte-13au5mm"&&(t.textContent=n),o=v(u),e=f(u,"FORM",{"data-svelte-h":!0}),b(e)!=="svelte-1ebprxy"&&(e.innerHTML=r),u.forEach(g)},m(l,u){y(l,i,u),y(l,h,u),y(l,s,u),_(s,t),_(s,o),_(s,e),a||(c=O(e,"submit",p[0]),a=!0)},p:P,i:P,o:P,d(l){l&&(g(i),g(h),g(s)),a=!1,c()}}}function $(p){var i=/[\x00]/g;return p.replace(i,"")}async function x(p){const i="https://as6xb.apps.beam.cloud/generate",m={Authorization:"Basic NzAyMmQyOTRkMjhiZjc2MmQzOGE0YzU2ODNkY2UzMjI6OThhM2E5NDFmMGNmZGU2NWM5MjMyOWExYWZkZjZmNjI=","Content-Type":"application/json"},h=p.stream||!1;let s=null;if(p.domElement&&(s=p.domElement,delete p.domElement),h){const t=await fetch(i,{method:"POST",headers:m,body:JSON.stringify(p),compress:!1,follow:20,size:0,timeout:0});if(t.ok){const n=t.body.getReader();let o=!1,e="";for(;!o;){const{value:r,done:a}=await n.read();e=new TextDecoder("utf-8").decode(r),e=$(e);try{e=JSON.parse(e),s&&(s.value=e.text[0])}catch(c){console.error(c),console.log(e)}a&&(o=!0,console.log("Streaming response:",e))}}else console.log("Error:",t.status,t.statusText)}else{const t=await fetch(i,{method:"POST",headers:m,body:JSON.stringify(p)});if(t.ok)return(await t.json()).text[0].trim();console.log("Error:",t.status,t.statusText)}}function M(p){class i{constructor(t=!1){this.structureTemplate=`## Story Structure
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
`,this.PLOT_POINTS_AMT=9,this.PLOT_POINTS_NUMBERING=[["1.1","Exposition"],["1.2","Inciting Incident"],["1.3","Plot Point A"],["2.1","Rising Action"],["2.2","Midpoint"],["2.3","Plot Point B"],["3.1","Pre Climax"],["3.2","Climax"],["3.3","Denouement"]],this.id=null,this.premise=null,this.genre=null,this.premise=null,this.plotPoints=null,this.overallPlotSummary=null,this.debug=t}ingestPlotPointsPremiseFromForm(){let t={};for(let n=0;n<this.PLOT_POINTS_AMT;n++){let e=document.getElementById(`input_${n+1}`).value;e!==""&&(t[this.PLOT_POINTS_NUMBERING[n][0]]={description:e})}this.plotPoints=t,this.premise=document.getElementById("premise").value}plotPointsToPrompt(){const t=[];for(const[o,e]of this.PLOT_POINTS_NUMBERING)o in this.plotPoints?t.push(this.plotPoints[o].description):t.push("");return`
## Story Events
Setup

1.1 ${t[0]}
1.2 ${t[1]}
1.3 ${t[2]}

Confrontation

2.1 ${t[3]}
2.2 ${t[4]}
2.3 ${t[5]}

Resolution

3.1 ${t[6]}
3.2 ${t[7]}
3.3 ${t[8]}
`}constructDraftPrompt(t){const n=this.PLOT_POINTS_NUMBERING.map(([l,u])=>l),o=n.indexOf(t),e=o>0,r=o<n.length-1,a=e?`
Here is the previous plot summary:
`+this.plotPoints[n[o-1]].get("summary",this.summarisePlotPoint(n[o-1]))+`
`:"";return r&&""+this.plotPoints[n[o+1]].get("description"),`[INST] You are a renowned creative writer specialising in the genre of ${this.genre}. ${a}
Using the provided summary for the previous plot point and the overall plot summary, write a narrative section for the current plot point. Be creative, explore interesting characters and unusual settings. Do NOT use foreshadowing and ensure that the narrative section ONLY relates to the current prompt. Do not incorporate future plot points.
Here is the current plot prompt:
${this.plotPoints[t].description}[/INST]`}summarisePlotPoint(t){const n={max_tokens:4096,temperature:.3,repetition_penalty:1.15,top_p:1,min_p:.1};let e=`[INST]You are a helpful assistant to a writer. You have been asked to summarise the following narrative section into a few sentences. Here is the plot: ${this.plotPoints[t].text}[/INST]`,r="";try{const a=x({prompt:e,stream:!1,sampling_params:n});this.plotPoints[t].summary=a,r=a}catch{r=this.plotPoints[t].description}return this.debug&&console.log(`Summarised plot point ${t} as
-----------------------------
${r}`),r}getPromptReadyPremise(){return"Premise: "+this.premise}async generatePlotPoints(){this.ingestPlotPointsPremiseFromForm();const t={max_tokens:4096,temperature:.6,stop:[`
`],repetition_penalty:1.15,top_p:1,min_p:.1};for(let n=0;n<this.PLOT_POINTS_AMT;n++){const o=this.PLOT_POINTS_NUMBERING[n][0],e=this.PLOT_POINTS_NUMBERING[n][1];if(console.log(o,this.plotPoints),o in this.plotPoints)continue;const r=document.getElementById(`input_${n+1}`),a=this.plotPointsToPrompt();let l={prompt:`[INST]You are a renowned writer specialising in the genre of ${this.genre}. You are able to create engaging narratives following a three act structure. Using the Story Structure guide, fill the Story Events suitable for the story as outlined in the premise.
${this.structureTemplate}${this.getPromptReadyPremise()}${a}
Create a single event for the plot point ${o}, keep it concise and avoid repeating previous plot points.[/INST] ${o} ${e}:`,stream:!0,sampling_params:t,domElement:r};await x(l).catch(u=>console.error(u)),this.ingestPlotPointsPremiseFromForm()}this.debug&&console.log(`Generated plot points: ${this.plotPointsToPrompt()}`)}}function m(s){s.preventDefault(),h.generatePlotPoints()}let h=new i(!0);return[m]}class k extends S{constructor(i){super(),N(this,i,M,E,w,{})}}export{k as component};