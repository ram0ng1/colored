import { extend } from 'flarum/extend';
import app from 'flarum/app';
import TagHero from 'flarum/tags/components/TagHero';
import DiscussionHero from 'flarum/components/DiscussionHero';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';

const NEUTRAL_COLORS = [
    'rgba(0, 0, 0, 0)',
    'transparent',
    'rgb(237, 237, 237)',
    'rgb(20, 25, 31)'
];

const CSS_PROPERTIES = [
    '--hero-color',
    '--primary-color',
    '--secondary-color',
    '--link-color',
    '--hero-contrast',
    '--overlay-bg',
    '--button-text-color',
    '--color',
    '--contrast-color',
    '--button-primary-bg',
    '--button-primary-bg-hover',
    '--button-primary-bg-active',
    '--button-primary-bg-disabled',
    '--header-color',
    '--control-bg'
];

function getContrastColor(hex) {
    if (!hex) return '#ffffff';

    const isDarkMode = app.forum.attribute('themeDarkMode') === '1' ||
        app.forum.attribute('themeDarkMode') === true ||
        app.forum.attribute('theme_dark_mode') === '1' ||
        app.forum.attribute('theme_dark_mode') === true;

    return isDarkMode ? '#000000' : '#ffffff';
}

function darkenColor(color, percent = 15) {
    const rgb = color.match(/\d+/g);
    if (!rgb) return color;

    const r = Math.max(0, Math.floor(rgb[0] * (1 - percent / 100)));
    const g = Math.max(0, Math.floor(rgb[1] * (1 - percent / 100)));
    const b = Math.max(0, Math.floor(rgb[2] * (1 - percent / 100)));

    return `rgb(${r}, ${g}, ${b})`;
}

function colorToRgba(color, opacity = 0.9) {
    const rgb = color.match(/\d+/g);
    if (!rgb) return color;

    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
}

function setGlobalColor(color) {
    const root = document.documentElement;
    const dynamicStyleId = 'colored-dynamic-styles';

    if (!color) {
        CSS_PROPERTIES.forEach(prop => root.style.removeProperty(prop));

        document.getElementById(dynamicStyleId)?.remove();
        document.body.removeAttribute('data-colored-header');
        document.querySelector('.Scrubber-bar')?.classList.remove('Scrubber-bar--ready');
        return;
    }

    const contrast = getContrastColor(color);
    const darkerColor = darkenColor(color, 15);
    const lighterHover = darkenColor(color, -10);
    const overlayBg = colorToRgba(color, 0.9);
    const controlBg = colorToRgba(color, 0.1);

    root.style.setProperty('--color', color);
    root.style.setProperty('--contrast-color', contrast);
    root.style.setProperty('--hero-color', color);
    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--secondary-color', color);
    root.style.setProperty('--link-color', color);
    root.style.setProperty('--hero-contrast', contrast);
    root.style.setProperty('--button-text-color', contrast);
    root.style.setProperty('--overlay-bg', overlayBg);
    root.style.setProperty('--control-bg', controlBg);
    root.style.setProperty('--header-color', color);

    root.style.setProperty('--button-primary-bg', color);
    root.style.setProperty('--button-primary-bg-hover', lighterHover);
    root.style.setProperty('--button-primary-bg-active', darkerColor);
    root.style.setProperty('--button-primary-bg-disabled', color);

    document.getElementById(dynamicStyleId)?.remove();

    const newStyle = document.createElement('style');
    newStyle.id = dynamicStyleId;
    newStyle.textContent = `
        .Button--primary {
            background-color: ${color} !important;
            color: ${contrast} !important;
        }
        .Button--primary:hover {
            background-color: ${lighterHover} !important;
            color: ${contrast} !important;
        }
        .Button--primary:active,
        .Button--primary.active {
            background-color: ${darkerColor} !important;
            color: ${contrast} !important;
        }
        .Button--primary:disabled {
            background-color: ${color} !important;
            opacity: 0.6;
        }
    `;
    document.head.appendChild(newStyle);

    if (app.forum.attribute('colored.elements.header')) {
        document.body.setAttribute('data-colored-header', 'true');
    }

    setTimeout(() => {
        document.querySelector('.Scrubber-bar')?.classList.add('Scrubber-bar--ready');
    }, 500);
}

function updateColors() {
    const hero = document.querySelector(".Hero");
    const route = app.current.get('routeName');

    if (!route || !(route.startsWith('discussion') || route.startsWith('tag'))) {
        setGlobalColor(null);
        return;
    }

    if (!hero) {
        setGlobalColor(null);
        return;
    }

    const style = window.getComputedStyle(hero);
    const bgColor = style.backgroundColor;

    if (NEUTRAL_COLORS.includes(bgColor)) {
        setGlobalColor(null);
        return;
    }

    const currentTag = app.current.get('tag');
    if (currentTag && !currentTag.color()) {
        setGlobalColor(null);
        return;
    }

    const currentDiscussion = app.current.get('discussion');
    if (currentDiscussion) {
        const tags = currentDiscussion.tags();
        if (!tags || !tags[0] || !tags[0].color()) {
            setGlobalColor(null);
            return;
        }
    }

    setGlobalColor(bgColor);
}

app.initializers.add('ramon/colored', () => {
    extend(app, 'route', updateColors);

    if (TagHero?.prototype) extend(TagHero.prototype, 'oncreate', updateColors);
    if (DiscussionHero?.prototype) extend(DiscussionHero.prototype, 'oncreate', updateColors);

    extend(DiscussionListItem.prototype, 'view', function(vnode) {
        const tags = this.attrs.discussion.tags();
        if (tags && tags[0] && tags[0].color()) {
            vnode.attrs.style = {
                '--tag-color': tags[0].color(),
                ...(vnode.attrs.style || {})
            };
        }
    });

    const observer = new MutationObserver(() => {
        if (document.querySelector(".Hero")) {
            updateColors();
        }
    });

    const appElement = document.getElementById('app');
    if (appElement) {
        observer.observe(appElement, {
            childList: true,
            subtree: false
        });
    }

    $(window).on('load', updateColors);
});
