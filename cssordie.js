(function () {
  // Remove existing elements and styles from previous executions
  function cleanup() {
    document.querySelectorAll('.css-panel').forEach((el) => el.remove());
    const existingStyle = document.querySelector('#css-styles');
    if (existingStyle) existingStyle.remove();
  }
  cleanup();

  // Initialize core variables
  // Create DocumentFragment for better performance
  const fragment = document.createDocumentFragment();

  // Messages configuration
  const messages = {
    ui: {
      panelTitle: 'CSS or Die',
      tagsTitle: 'Forbidden Tags',
      attributesTitle: 'Forbidden Attributes',
      noTagsTitle: 'No forbidden tags found',
      noAttributesTitle: 'No forbidden attributes found',
      escapeHint: 'Use <kbd>Esc</kbd> to close panel',
    },
    buttons: {
      close: 'Close',
      darkLight: 'Dark/Light',
      screenReaderLabels: {
        panel: ' the panel',
        mode: ' mode toggle',
      },
    },
  };

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
    .css-panel p {
      font-size: 1em;
    }
    .css-footer {
      display: flex;
      flex-direction: column;
    }
    .css-btn {
      margin: 5px;
      padding: 5px 10px;
      border: none;
      border-radius: 3px;
      background: #0d6efd;
      color: #fff;
      font-size: 1em;
      cursor: pointer;
    }
    .css-btn:focus {
      outline: 2px solid #0d6efd;
      outline-offset: 2px;
      box-shadow: 0 0 10px rgba(13, 110, 253, 0.25);
    }
    .css-empty {
      color: green;
      font-weight: bold;
    }
    @media (forced-colors: active) {
      .css-btn:focus {
        outline: 3px solid #000;
        outline-offset: 3px;
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .css-panel {
        animation: fadeIn 0.5s ease-out;
      }
    }
    @media (prefers-color-scheme: dark) {
      .css-panel {
        background: #1e1e1e;
        color: #f0f0f0;
      }
    }
    body.css-dark .css-panel {
      background: #1e1e1e;
      color: #eee;
    }
    .visually-hidden {
      border: 0 !important;
      clip: rect(1px, 1px, 1px, 1px) !important;
      -webkit-clip-path: inset(50%) !important;
        clip-path: inset(50%) !important;
      height: 1px !important;
      margin: -1px !important;
      overflow: hidden !important;
      padding: 0 !important;
      position: absolute !important;
      width: 1px !important;
      white-space: nowrap !important;
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
        <summary><code>&lt;${r.tag}&gt;</code> (${r.elements.length})</summary>
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
    : `<p class="css-empty">${messages.ui.noTagsTitle}</p>`;

  const attrList = attrResults.length
    ? `<ul>${attrResults
      .map(
        (r) =>
          `<li><code>${
            r.attr
          }</code> on <code>&lt;${r.el.tagName.toLowerCase()}&gt;</code></li>`
      )
      .join('')}</ul>`
    : `<p class="css-empty">${messages.ui.noAttributesTitle}</p>`;

  // Display results panel
  const panel = document.createElement('div');
  panel.className = 'css-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'css-panel-title');
  panel.innerHTML = `
    <p id="css-panel-title">${messages.ui.panelTitle}</p>
    <h2>${messages.ui.tagsTitle} (${tagResults.reduce(
    (sum, r) => sum + r.elements.length,
    0
  )})</h2>
    ${tagList}
    <h2>${messages.ui.attributesTitle} (${attrResults.length})</h2>
    ${attrList}
    <div class="css-footer">
      <button class="css-btn" id="css-cleanup">
      ${messages.buttons.close}
      <span class="visually-hidden">${
  messages.buttons.screenReaderLabels.panel
  }</span>
      </button>
      <button class="css-btn" id="css-theme">
      ${messages.buttons.darkLight}
      <span class="visually-hidden">${
  messages.buttons.screenReaderLabels.mode
  }</span>
      </button>
    </div>
    <p>
      <small>${messages.ui.escapeHint}</small>
    </p>
  `;
  fragment.appendChild(panel);

  // Add complete fragment to DOM
  requestAnimationFrame(() => {
    document.body.insertBefore(fragment, document.body.firstChild);

    const panel = document.querySelector('.css-panel');

    // Focus
    if (panel) {
      const firstButton = panel.querySelector('button');
      if (firstButton) {
        firstButton.focus();
      }

      // Escape shortcut
      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          cleanup();
          document.activeElement?.blur();
        }
      });
    }

    // Add event listeners after elements are in DOM
    // Initialize states
    let isDarkMode = false;

    // Handle theme toggle
    const themeButton = document.getElementById('css-theme');
    if (themeButton) {
      themeButton.setAttribute('aria-pressed', 'false'); // Initial state
      themeButton.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        themeButton.setAttribute('aria-pressed', isDarkMode ? 'true' : 'false');

        requestAnimationFrame(() => {
          document.body.classList.toggle('css-dark');
        });
      });
    }

    // Handle cleanup button
    const cleanupButton = document.getElementById('css-cleanup');
    if (cleanupButton) {
      cleanupButton.addEventListener('click', cleanup);
    }
  });
})();
