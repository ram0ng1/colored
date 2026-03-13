import { extend } from 'flarum/common/extend';
import app from 'flarum/common/app';
import DiscussionHero from 'flarum/forum/components/DiscussionHero';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import sortTags from 'ext:flarum/tags/common/utils/sortTags';
import isDark from 'flarum/common/utils/isDark';

// Disable CSS transitions for 2 frames so color vars snap instantly.
function suppressTransitions(): void {
  document.documentElement.classList.add('colored--instant');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.classList.remove('colored--instant');
  }));
}

function applyColor(color: string | null | undefined): void {
  suppressTransitions();
  if (color) {
    const contrast = isDark(color) ? 'var(--text-on-dark)' : 'var(--text-on-light)';
    document.body.style.setProperty('--colored-color', color);
    document.body.style.setProperty('--colored-contrast', contrast);
    document.body.classList.add('colored--active');
  } else {
    clearColor();
  }
}

function clearColor(): void {
  suppressTransitions();
  document.body.style.removeProperty('--colored-color');
  document.body.style.removeProperty('--colored-contrast');
  document.body.classList.remove('colored--active');
}

app.initializers.add('ramon-colored', () => {
  // NOTE: app.forum is NOT yet set during initialize() — it's set after in boot().
  // Use app.beforeMount() for one-time setup that needs app.forum.

  app.beforeMount(() => {
    const borderStyle = app.forum.attribute<string>('colored.borderStyle') || 'none';
    document.documentElement.setAttribute('data-colored-border', borderStyle);
  });

  // Patch DiscussionListItem.view:
  //   1. inject --item-tag-color for border LESS rules
  //   2. call applyColor on click so colors swap before the discussion page loads
  extend(DiscussionListItem.prototype, 'view', function (vdom) {
    const tags = sortTags((this.attrs.discussion?.tags() as any[]) || []);
    const color: string | null = tags.length ? (tags[0] as any).color() : null;
    if (!color || !vdom?.attrs) return;

    vdom.attrs.style = { ...(vdom.attrs.style || {}), '--item-tag-color': color };

    const prev = vdom.attrs.onclick;
    vdom.attrs.onclick = (e: MouseEvent) => {
      applyColor(color);
      if (typeof prev === 'function') (prev as Function).call(this, e);
    };
  });

  // Apply color before the first DOM paint of the discussion hero
  extend(DiscussionHero.prototype, ['oninit', 'onupdate'], function () {
    const tags = sortTags((this.attrs.discussion?.tags() as any[]) || []);
    applyColor(tags.length ? (tags[0] as any).color() : null);
  });

  // Restore default colors when leaving the discussion page
  extend(DiscussionHero.prototype, 'onremove', function () {
    clearColor();
  });
});
