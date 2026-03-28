(function () {
  'use strict';

  var BLOCK_ELEMENTS = [
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DD', 'DETAILS', 'DIALOG',
    'DIV', 'DL', 'DT', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI',
    'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'UL'
  ];

  var DEFAULTS = {
    root: 'main',
    label: 'Copy Markdown',
    buttonClass: '',
    position: 'prepend',
    skipSelectors: 'script,style,noscript,template,svg,[aria-hidden="true"],.copy-md-btn',
    onCopy: null
  };

  function isBlock(tag) {
    return BLOCK_ELEMENTS.indexOf(tag) !== -1;
  }

  function collapseWhitespace(text) {
    return text.replace(/\s+/g, ' ');
  }

  function extractLang(codeEl) {
    if (!codeEl) return '';
    var cls = codeEl.className || '';
    var match = cls.match(/(?:^|\s)lang(?:uage)?-(\S+)/);
    return match ? match[1] : '';
  }

  function convertChildren(node, ctx) {
    var result = '';
    for (var i = 0; i < node.childNodes.length; i++) {
      result += convert(node.childNodes[i], ctx);
    }
    return result;
  }

  function convertList(listNode, type, ctx) {
    var result = '';
    var index = 1;
    for (var i = 0; i < listNode.children.length; i++) {
      var li = listNode.children[i];
      if (li.tagName !== 'LI') continue;

      var indent = '  '.repeat(ctx.listDepth);
      var prefix = type === 'ol' ? (index++ + '. ') : '- ';

      var liCtx = {
        listDepth: ctx.listDepth,
        inPre: ctx.inPre,
        skipSelectors: ctx.skipSelectors
      };

      var parts = [];
      var nestedList = '';

      for (var j = 0; j < li.childNodes.length; j++) {
        var child = li.childNodes[j];
        if (child.nodeType === 1 && (child.tagName === 'UL' || child.tagName === 'OL')) {
          nestedList += convert(child, {
            listDepth: ctx.listDepth + 1,
            inPre: ctx.inPre,
            skipSelectors: ctx.skipSelectors
          });
        } else {
          parts.push(convert(child, liCtx));
        }
      }

      var lineText = parts.join('').replace(/\n+$/, '').trim();
      result += indent + prefix + lineText + '\n';
      if (nestedList) {
        result += nestedList;
      }
    }
    return result + '\n';
  }

  function convertTable(tableNode) {
    var rows = [];
    var trElements = tableNode.querySelectorAll('tr');

    for (var i = 0; i < trElements.length; i++) {
      var tr = trElements[i];
      var cells = [];
      var cellEls = tr.querySelectorAll('th, td');
      for (var j = 0; j < cellEls.length; j++) {
        cells.push(cellEls[j].textContent.trim().replace(/\|/g, '\\|'));
      }
      rows.push(cells);
    }

    if (rows.length === 0) return '';

    var result = '| ' + rows[0].join(' | ') + ' |\n';
    result += '| ' + rows[0].map(function () { return '---'; }).join(' | ') + ' |\n';
    for (var r = 1; r < rows.length; r++) {
      result += '| ' + rows[r].join(' | ') + ' |\n';
    }
    return result;
  }

  function convert(node, ctx) {
    if (node.nodeType === 3) {
      if (ctx.inPre) return node.textContent;
      return collapseWhitespace(node.textContent);
    }

    if (node.nodeType !== 1) return '';

    var tag = node.tagName;

    if (ctx.skipSelectors && node.matches && node.matches(ctx.skipSelectors)) {
      return '';
    }

    if (node.offsetParent === null && tag !== 'BODY' && tag !== 'HTML' &&
        node.style && node.style.display === 'none') {
      return '';
    }

    var children = function () { return convertChildren(node, ctx); };

    var headingLevel = /^H([1-6])$/.exec(tag);
    if (headingLevel) {
      var hashes = '#'.repeat(parseInt(headingLevel[1], 10));
      return hashes + ' ' + children().trim() + '\n\n';
    }

    switch (tag) {
      case 'P':
        var pContent = children().trim();
        return pContent ? pContent + '\n\n' : '';

      case 'STRONG':
      case 'B':
        return '**' + children().trim() + '**';

      case 'EM':
      case 'I':
        return '*' + children().trim() + '*';

      case 'DEL':
      case 'S':
        return '~~' + children().trim() + '~~';

      case 'A':
        var href = node.getAttribute('href') || '';
        var linkText = children().trim();
        if (!linkText) linkText = href;
        return '[' + linkText + '](' + href + ')';

      case 'IMG':
        var alt = node.getAttribute('alt') || '';
        var src = node.getAttribute('src') || '';
        return '![' + alt + '](' + src + ')\n\n';

      case 'CODE':
        if (ctx.inPre) return node.textContent;
        return '`' + node.textContent + '`';

      case 'PRE':
        var codeEl = node.querySelector('code');
        var lang = extractLang(codeEl);
        var preText = (codeEl || node).textContent;
        return '```' + lang + '\n' + preText + '\n```\n\n';

      case 'UL':
        return convertList(node, 'ul', ctx);

      case 'OL':
        return convertList(node, 'ol', ctx);

      case 'LI':
        return children();

      case 'BLOCKQUOTE':
        var bqContent = children().trim();
        var quoted = bqContent.split('\n').map(function (line) {
          return '> ' + line;
        }).join('\n');
        return quoted + '\n\n';

      case 'HR':
        return '---\n\n';

      case 'BR':
        return '\n';

      case 'TABLE':
        return convertTable(node) + '\n';

      case 'THEAD':
      case 'TBODY':
      case 'TFOOT':
      case 'TR':
      case 'TH':
      case 'TD':
        return '';

      case 'INPUT':
      case 'SELECT':
      case 'TEXTAREA':
      case 'BUTTON':
      case 'LABEL':
        return '';

      default:
        var content = children();
        if (isBlock(tag)) {
          var trimmed = content.trim();
          return trimmed ? trimmed + '\n\n' : '';
        }
        return content;
    }
  }

  function htmlToMarkdown(element, skipSelectors) {
    var ctx = {
      listDepth: 0,
      inPre: false,
      skipSelectors: skipSelectors || DEFAULTS.skipSelectors
    };
    var raw = convert(element, ctx);
    return raw.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        var ok = document.execCommand('copy');
        ok ? resolve() : reject(new Error('execCommand failed'));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function createButton(opts) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-md-btn' + (opts.buttonClass ? ' ' + opts.buttonClass : '');
    btn.style.cssText = [
      'display:inline-flex', 'align-items:center', 'gap:6px',
      'padding:6px 14px', 'font-size:0.8rem', 'font-family:inherit',
      'border:1px solid currentColor', 'border-radius:4px',
      'background:transparent', 'color:inherit', 'cursor:pointer',
      'opacity:0.5', 'transition:opacity 0.15s ease', 'margin-bottom:1rem'
    ].join(';');

    btn.textContent = opts.label;

    btn.addEventListener('mouseenter', function () { btn.style.opacity = '1'; });
    btn.addEventListener('mouseleave', function () { btn.style.opacity = '0.5'; });

    return btn;
  }

  function showFeedback(btn, originalLabel, success) {
    btn.textContent = success ? '\u2713 Copied!' : 'Copy failed';
    btn.style.opacity = '1';
    setTimeout(function () {
      btn.textContent = originalLabel;
      btn.style.opacity = '0.5';
    }, 1500);
  }

  function injectButton(rootEl, opts) {
    if (rootEl.querySelector('.copy-md-btn')) return;

    var btn = createButton(opts);

    btn.addEventListener('click', function () {
      var markdown = htmlToMarkdown(rootEl, opts.skipSelectors);
      copyToClipboard(markdown).then(function () {
        showFeedback(btn, opts.label, true);
        if (typeof opts.onCopy === 'function') opts.onCopy(markdown);
      }).catch(function () {
        showFeedback(btn, opts.label, false);
      });
    });

    if (opts.position === 'append') {
      rootEl.appendChild(btn);
    } else if (opts.position === 'prepend') {
      rootEl.insertBefore(btn, rootEl.firstChild);
    } else {
      var target = document.querySelector(opts.position);
      if (target) {
        target.appendChild(btn);
      } else {
        rootEl.insertBefore(btn, rootEl.firstChild);
      }
    }
  }

  function init(userOpts) {
    var opts = {};
    for (var key in DEFAULTS) {
      opts[key] = (userOpts && userOpts[key] !== undefined) ? userOpts[key] : DEFAULTS[key];
    }

    function setup() {
      var rootEl = document.querySelector(opts.root);
      if (!rootEl) return;

      if (rootEl.children.length === 0 || rootEl.textContent.trim() === '') {
        var observer = new MutationObserver(function (mutations, obs) {
          if (rootEl.children.length > 0 && rootEl.textContent.trim() !== '') {
            obs.disconnect();
            injectButton(rootEl, opts);
          }
        });
        observer.observe(rootEl, { childList: true, subtree: true });
      } else {
        injectButton(rootEl, opts);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  // Auto-init from script data attributes
  var currentScript = document.currentScript;
  if (currentScript) {
    var autoRoot = currentScript.getAttribute('data-copy-md-root');
    var autoLabel = currentScript.getAttribute('data-copy-md-label');
    var autoPosition = currentScript.getAttribute('data-copy-md-position');
    var autoClass = currentScript.getAttribute('data-copy-md-class');

    if (autoRoot || autoLabel || autoPosition || autoClass) {
      var autoOpts = {};
      if (autoRoot) autoOpts.root = autoRoot;
      if (autoLabel) autoOpts.label = autoLabel;
      if (autoPosition) autoOpts.position = autoPosition;
      if (autoClass) autoOpts.buttonClass = autoClass;
      init(autoOpts);
    }
  }

  // Expose public API
  window.CopyMarkdown = {
    init: init,
    convert: htmlToMarkdown
  };

})();
