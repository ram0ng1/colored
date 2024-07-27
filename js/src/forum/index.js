import {extend, override} from 'flarum/extend';
import app from 'flarum/app';

import WelcomeHero from 'flarum/components/WelcomeHero';
import UserPage from 'flarum/components/UserPage';

import TagHero from 'flarum/tags/components/TagHero';
import DiscussionHero from 'flarum/components/DiscussionHero';

function removeBodyClasses(hero) {
  if (hero && hero.prototype) {
    extend(hero.prototype, 'view', function(view) {
      $('body').removeClass (function (index, className) {
        return (className.match (/(^|\s)col\S+/g) || []).join(' ');
      });
    });
  }
}

function updateColors(hero) {
  if (hero) {
    var heroElement = document.querySelector(".Hero");
    if (heroElement) {
      var bgColor = window.getComputedStyle(heroElement).backgroundColor;
      var colorClass = 'col-' + bgColor.replace('rgb(', '').replace(', ', '-').replace(', ', '-').replace(')', '');

      if (bgColor === '#ededed') {
        var heroElement = document.querySelector(".NotificationsDropdown .Dropdown-toggle.new .Button-icon");
        // Change to default Flarum color if the found color is '#ededed'
        bgColor = window.getComputedStyle(heroElement).backgroundColor;
        var colorClass = 'col-' + bgColor.replace('rgb(', '').replace(', ', '-').replace(', ', '-').replace(')', '');
      }

      $('body')
        .removeClass(function (index, className) {
          return (className.match(/(^|\s)col\S+/g) || []).join(' ');
        })
        .addClass(colorClass);

      document.documentElement.style.setProperty('--link-color', bgColor);
      document.documentElement.style.setProperty('--primary-color', bgColor); // Update primary color
      $('.announcementBarContent').css('background-color', bgColor);
      $('.Button--primary').css('background-color', bgColor); // Update primary button color
      $('.App-header').css('border-top', '3px solid ' + bgColor); // Update header border color
    } else {
      // Use default Flarum color if no background color is defined
      var defaultColor = window.getComputedStyle(document.documentElement).getPropertyValue('--link-color');
      var defaultColorClass = 'col-' + defaultColor.replace('rgb(', '').replace(', ', '-').replace(', ', '-').replace(')', '');

      $('body')
        .removeClass(function (index, className) {
          return (className.match(/(^|\s)col\S+/g) || []).join(' ');
        })
        .addClass(defaultColorClass);

      document.documentElement.style.setProperty('--link-color', defaultColor);
      document.documentElement.style.setProperty('--primary-color', defaultColor); // Update primary color
      $('.announcementBarContent ').css('background-color', defaultColor);
      $('.Button--primary').css('background-color', defaultColor); // Update primary button color
    }
  }
}

app.initializers.add('ramon/colored', () => {
  console.log('[ramon/colored] Hello, forum!');

  // Update the class of the <body> element with the first tag to enable restyling page elements
  removeBodyClasses(WelcomeHero);
  removeBodyClasses(UserPage);

  if (TagHero && TagHero.prototype) {
    extend(TagHero.prototype, 'view', function(vdom) {
      updateColors(TagHero);
    });
  }

  if (DiscussionHero && DiscussionHero.prototype) {
    extend(DiscussionHero.prototype, 'view', function(view) {
      updateColors(DiscussionHero);
    });
  }

  // Automatically update colors when changing elements
  $(document).on('change', '.Hero, .TagHero','.App-header, .new .NotificationsDropdown-unread', function() {
    updateColors(this);
  });
});

// Add smooth transition effect between colors
$('body').css('transition', 'background-color 0.1s ease');
$('.Button--primary').css('transition', 'background-color 0.1s ease');
$('.Button--tagColored').css('transition', 'background-color 0.1s ease');

// Prevent default color from being loaded before the new color
$('body').hide();
$(window).on('load', function() {
  $('body').show();
});