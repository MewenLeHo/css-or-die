(function () {
  // Remove existing elements and styles from previous executions
  document
    .querySelectorAll('.css-panel, #css-or-die-style')
    .forEach((el) => el.remove());

  // Initialize core variables
  // Create DocumentFragment for better performance
  const fragment = document.createDocumentFragment();

  // Styles
  const style = document.createElement('style');
  style.id = 'css-or-die-style';
  style.textContent = `
    .css-panel {
      position: fixed;
      top: 10px;
      left: 10px;
      background: #fff;
      color: #000;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, .2);
      z-index: 99999;
      max-width: 400px;
      max-height: 70vh;
      overflow: auto;
      font-family: -apple-system, system-ui, sans-serif;
      font-size: 14px;
    }
    #css-panel-title {
      font-size: 1.2em;
      font-weight: bold;
      margin: 0 0 0.5em 0;
    }
    .css-panel h2 {
      font-size: 1em;
      margin-top: 1em;
      margin-bottom: 0.3em;
    }
    .css-panel code {
      background: #f5f5f5;
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
    }
    .css-panel details {
      margin-bottom: 0.5em;
    }
    .css-close {
      float: right;
      cursor: pointer;
      font-size: 1.2em;
      border: none;
      background: transparent;
    }
    .css-empty {
      color: green;
      font-weight: bold;
    }
  `;
  fragment.appendChild(style);

  // Define forbidden tags
  const forbiddenTags = [
    'basefont',
    'big',
    'blink',
    'center',
    'font',
    'marquee',
    's',
    'strike',
    'tt',
  ];
  if (document.doctype?.name?.toLowerCase() !== 'html') {
    forbiddenTags.push('u');
  }

  // Define forbidden attributes
  const forbiddenAttrs = [
    'align',
    'alink',
    'background',
    'bgcolor',
    'border',
    'cellpadding',
    'cellspacing',
    'char',
    'charoff',
    'clear',
    'compact',
    'color',
    'frameborder',
    'hspace',
    'link',
    'marginheight',
    'marginwidth',
    'text',
    'valign',
    'vlink',
    'vspace',
  ];

  // Check for forbidden tags
  const tagResults = forbiddenTags
    .map((tag) => ({
      tag,
      elements: Array.from(document.getElementsByTagName(tag)),
    }))
    .filter((r) => r.elements.length > 0);

  // Check for forbidden attributes
  const attrResults = [];
  document.querySelectorAll('*').forEach((el) => {
    forbiddenAttrs.forEach((attr) => {
      if (el.hasAttribute(attr)) {
        attrResults.push({ el, attr });
      }
    });
    // width/height attributes restricted
    if (el.hasAttribute('width') || el.hasAttribute('height')) {
      const allowedTags = [
        'img',
        'object',
        'embed',
        'video',
        'canvas',
        'svg',
        'iframe',
      ];
      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        if (el.hasAttribute('width')) attrResults.push({ el, attr: 'width' });
        if (el.hasAttribute('height')) attrResults.push({ el, attr: 'height' });
      }
    }
  });

  // Build results content
  const tagList = tagResults.length
    ? tagResults
      .map(
        (r) => `
        <details open>
          <summary><code>&lt;${r.tag}&gt;</code> (${
    r.elements.length
  })</summary>
          <ul>
            ${r.elements
    .map(
      (el) =>
        `<li><code>${el.outerHTML
          .replace(/</g, '&lt;')
          .slice(0, 80)}...</code></li>`
    )
    .join('')}
          </ul>
        </details>
      `
      )
      .join('')
    : '<p class="css-empty">✅ No forbidden tags found</p>';

  const attrList = attrResults.length
    ? `<ul>${attrResults
      .map(
        (r) =>
          `<li><code>${
            r.attr
          }</code> on <code>&lt;${r.el.tagName.toLowerCase()}&gt;</code></li>`
      )
      .join('')}</ul>`
    : '<p class="css-empty">✅ No forbidden attributes found</p>';

  // Display results panel
  const panel = document.createElement('div');
  panel.className = 'css-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'css-panel-title');
  panel.innerHTML = `
    <button class="css-close" aria-label="Close">&times;</button>
    <p id="css-panel-title">CSS or Die</p>
    <h2>Forbidden Tags (${tagResults.reduce(
    (sum, r) => sum + r.elements.length,
    0
  )})</h2>
    ${tagList}
    <h2>Forbidden Attributes (${attrResults.length})</h2>
    ${attrList}
  `;
  fragment.appendChild(panel);

  // Add close button behavior
  panel.querySelector('.css-close').addEventListener('click', () => {
    panel.remove();
    style.remove();
  });

  // Add complete fragment to DOM
  requestAnimationFrame(() => {
    document.body.insertBefore(fragment, document.body.firstChild);
  });
})();
