<script>
    export let textContent = "";
  
    function downloadTextFile() {
      if (textContent.trim() !== "") {
        const element = document.createElement("a");
        const file = new Blob([textContent], { type: "text/plain" });
  
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
  </script>
  
  <button type="button" id="download" on:click={downloadTextFile} aria-label="Download Text">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l3 3m0 0l3-3m-3 3v10m-4-4h8"/>
    </svg>
  </button>