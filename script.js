async function loadMarkdownWithShortcodes(id, file) {
  // Fetch the markdown content
  const response = await fetch(file);
  let markdownContent = await response.text();

  // Regex to match {{shortcode.html key1="value1" key2="value2"}}
  const shortcodeRegex = /{{\s*([\w\-\.]+)(.*?)\s*}}/g;
  let match;

  while ((match = shortcodeRegex.exec(markdownContent)) !== null) {
    const [fullMatch, shortcodeFile, params] = match;

    // Fetch the shortcode HTML template
    const shortcodeResponse = await fetch(`shortcodes/${shortcodeFile}.html`);
    let shortcodeContent = await shortcodeResponse.text();

    // Parse parameters
    const paramRegex = /(\w+)="([^"]+)"/g;
    let paramMatch;
    const variablesObject = {};

    while ((paramMatch = paramRegex.exec(params)) !== null) {
      variablesObject[paramMatch[1]] = paramMatch[2];
    }

    // Replace placeholders in the shortcode template
    for (const [key, value] of Object.entries(variablesObject)) {
      const placeholderRegex = new RegExp(`\\{${key}\\}`, "g");
      shortcodeContent = shortcodeContent.replace(placeholderRegex, value);
    }

    // Replace the {{shortcode}} syntax in the markdown with the rendered HTML
    markdownContent = markdownContent.replace(fullMatch, shortcodeContent);
  }

  // Convert the final Markdown to HTML
  const converter = new showdown.Converter();
  let htmlContent = converter.makeHtml(markdownContent);

  // Create a temporary DOM element to manipulate the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Select all anchor tags and set target="_blank" for external links
  const links = tempDiv.querySelectorAll('a');
  links.forEach(link => {
    if (link.hostname !== window.location.hostname) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer'); // For security reasons
    }
  });

  // Set the processed HTML back to the target element
  document.getElementById(id).innerHTML = tempDiv.innerHTML;
}

// Load Markdown files dynamically
loadMarkdownWithShortcodes("about-content", "markdown/about.md");
loadMarkdownWithShortcodes("projects-content", "markdown/projects.md");
loadMarkdownWithShortcodes("links-content", "markdown/links.md");
loadMarkdownWithShortcodes("notes-content", "markdown/notes.md");
loadMarkdownWithShortcodes("vitae-content", "markdown/vitae.md");
