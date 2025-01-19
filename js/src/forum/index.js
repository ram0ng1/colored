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

function getActiveElements() {
  const elements = [
    'header', 'hero', 'navigation', 'button', 'usercard', 'post', 'alerts', 'dropdown', 'composer'
  ];
  
  if (!app.forum || typeof app.forum.attribute !== 'function') {
    return [];
  }

  return elements.filter(element => {
    const value = app.forum.attribute(`colored.elements.${element}`);
    return value === '1' || value === true || value === 1;
  });
}

function getTransitionDelay() {
  const type = app.forum.attribute('colored.transitionType') || 'normal';
  const delays = {
    fast: 0.1,
    normal: 0.5,
    slow: 1
  };
  return delays[type];
}

function clearStyles(defaultColor = null) {
  // Limpar todos os estilos
  const styles = {
    'App-header': { 'border-top': '' },
    'Hero': { 'background-color': '' },
    'App-navigation': { 'border-bottom': '' },
    'Button--primary': { 'background-color': defaultColor || '' },
    'UserCard': { 'border-top': '' },
    'Post-header': { 'border-left': '' },
    'Alert': { 'border-left': '' },
    'Dropdown-menu': { 'background-color': '' },
    'Composer': {
      '--primary-color': '',
      'box-shadow': ''
    }
  };

  Object.entries(styles).forEach(([selector, properties]) => {
    Object.entries(properties).forEach(([prop, value]) => {
      $(`.${selector}`).css(prop, value);
    });
  });
}

function clearAllColors() {
  const defaultColor = app.forum.attribute('theme_primary_color') || '#536f90';
  document.documentElement.style.setProperty('--primary-color', defaultColor);
  document.documentElement.style.setProperty('--link-color', defaultColor);
  clearStyles(defaultColor);
}

function updateColors() {
  const elements = getActiveElements();
  if (elements.length === 0) return;

  // Verificar se estamos em uma página de discussão
  const currentRoute = app.current.get('routeName');
  const isDiscussionRoute = currentRoute && currentRoute.startsWith('discussion');

  if (!isDiscussionRoute) {
    clearAllColors();
    return;
  }

  const delay = getTransitionDelay();
  
  // Aplicar transições com o delay configurado
  $('.Button--primary, .Button--tagColored').css('transition', `background-color ${delay}s ease`);
  $('.Hero, .App-navigation, .UserCard, .Post-header, .Alert, .Dropdown-menu').css('transition', `all ${delay}s ease`);

  // Buscar a cor padrão das configurações do Flarum
  const defaultColor = app.forum.attribute('theme_primary_color') 
    || app.forum.attribute('themePrimaryColor') 
    || '#d42a5b';

  const heroElement = document.querySelector(".Hero");
  let bgColor = heroElement 
    ? window.getComputedStyle(heroElement).backgroundColor
    : window.getComputedStyle(document.documentElement).getPropertyValue('--link-color');

  // Verificar se a cor é a cor padrão do Flarum ou cinza claro
  if (bgColor === 'rgb(237, 237, 237)' || bgColor === '#e8ecf3' || bgColor === 'rgb(232, 236, 243)') {
    document.documentElement.style.setProperty('--primary-color', defaultColor);
    document.documentElement.style.setProperty('--link-color', defaultColor);
    clearStyles(defaultColor);
    return;
  }

  if (bgColor === 'rgb(237, 237, 237)') {
    bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--link-color');
  }

  // Limpar estilos antes de aplicar novos
  clearStyles();
  
  // Aplicar novos estilos baseados nas configurações ativas
  if (elements.includes('header')) {
    $('.App-header').css('border-top', `3px solid ${bgColor}`);
  }

  if (elements.includes('hero')) {
    $('.Hero').css('background-color', bgColor);
  }

  if (elements.includes('navigation')) {
    $('.FormControl').css({
      'background-color': bgColor,
    });
  }

  if (elements.includes('button')) {
    // Aplicar cor aos elementos primários do Flarum
    $('.Button--primary, .Button--link').css({
      'background-color': bgColor,
      '--primary-color': bgColor
    }).hover(
      function() { 
        $(this).css({
          'background-color': lightenDarkenColor(bgColor, 20),
          '--primary-color': lightenDarkenColor(bgColor, 20)
        }); 
      },
      function() { 
        $(this).css({
          'background-color': bgColor,
          '--primary-color': bgColor
        }); 
      }
    );
  }

  if (elements.includes('usercard')) {
    $('.UserCard').css('border-top', `3px solid ${bgColor}`);
  }

  if (elements.includes('post')) {
    $('.Post-header').css('border-left', `3px solid ${bgColor}`);
  }

  if (elements.includes('alerts')) {
    $('.Alert').css('border-left', `3px solid ${bgColor}`);
  }

  if (elements.includes('dropdown')) {
    $('.Dropdown-menu').css('background-color', `${bgColor}`);
  }

  if (elements.includes('composer')) {
    $('.Composer').css({
      '--primary-color': bgColor,
    }).hover(
      function() { $(this).css({
        '--primary-color': lightenDarkenColor(bgColor, 20),
      }); },
      function() { $(this).css({
        '--primary-color': bgColor,
         'box-shadow': `0 0 0 2px ${bgColor}, 0 2px 6px ${bgColor}`
      }); }
    );
  }

  // Atualizar variáveis CSS globais apenas se necessário
  if (elements.includes('button')) {
    document.documentElement.style.setProperty('--primary-color', bgColor);
    document.documentElement.style.setProperty('--link-color', bgColor);
  } else {
    document.documentElement.style.setProperty('--primary-color', '');
    document.documentElement.style.setProperty('--link-color', '');
  }
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

  // Usar forma correta de detectar mudanças de rota no Flarum
  extend(app, 'route', () => {
    const currentRoute = app.current.get('routeName');
    if (!currentRoute || !currentRoute.startsWith('discussion')) {
      clearAllColors();
    } else {
      updateColors();
    }
  });

  $(document).on('change', '.Hero, .TagHero, .App-header, .new .NotificationsDropdown-unread', updateColors);
  
  $('body').hide();
  $(window).on('load', () => {
    updateColors();
    $('body').show();
  });
});
