import { extend } from 'flarum/extend';
import app from 'flarum/app';

import WelcomeHero from 'flarum/components/WelcomeHero';
import TagHero from 'flarum/tags/components/TagHero';
import DiscussionHero from 'flarum/components/DiscussionHero';

function removeBodyClasses(hero) {
  if (hero && hero.prototype) {
    extend(hero.prototype, 'view', function() {
      $('body').removeClass(function(index, className) {
        return (className.match(/(^|\s)col\S+/g) || []).join(' ');
      });
    });
  }
}

function updateColors() {
  const heroElement = document.querySelector(".Hero");
  let bgColor = heroElement 
    ? window.getComputedStyle(heroElement).backgroundColor
    : window.getComputedStyle(document.documentElement).getPropertyValue('--link-color');

  if (bgColor === 'rgb(237, 237, 237)') {
    bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--link-color');
  }

  const colorClass = 'col-' + bgColor.replace('rgb(', '').replace(/, /g, '-').replace(')', '');

  $('body')
    .removeClass(function(index, className) {
      return (className.match(/(^|\s)col\S+/g) || []).join(' ');
    })
    .addClass(colorClass);

  document.documentElement.style.setProperty('--link-color', bgColor);
  document.documentElement.style.setProperty('--primary-color', bgColor);
  
  $('.announcementBarContent').css('background-color', bgColor);
  $('.Button--primary').css('background-color', bgColor).hover(
    function() { $(this).css('background-color', lightenDarkenColor(bgColor, 20)); },
    function() { $(this).css('background-color', bgColor); }
  );
  $('.App-header').css('border-top', `3px solid ${bgColor}`);
}

function lightenDarkenColor(color, amount) {
  let usePound = false;
  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }
  let num = parseInt(color, 16);
  let r = (num >> 16) + amount;
  let b = ((num >> 8) & 0x00FF) + amount;
  let g = (num & 0x0000FF) + amount;

  r = Math.min(255, Math.max(0, r));
  b = Math.min(255, Math.max(0, b));
  g = Math.min(255, Math.max(0, g));

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

app.initializers.add('ramon/colored', () => {
  removeBodyClasses(WelcomeHero);
  removeBodyClasses(DiscussionHero);

  if (TagHero && TagHero.prototype) {
    extend(TagHero.prototype, 'view', updateColors);
  }

  if (DiscussionHero && DiscussionHero.prototype) {
    extend(DiscussionHero.prototype, 'view', updateColors);
  }

  $(document).on('change', '.Hero, .TagHero, .App-header, .new .NotificationsDropdown-unread', updateColors);
  
  $('body').css('transition', 'background-color 0.1s ease');
  $('.Button--primary, .Button--tagColored').css('transition', 'background-color 0.1s ease');

  $('body').hide();
  $(window).on('load', () => $('body').show());
});
