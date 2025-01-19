import app from 'flarum/admin/app';
import { extend } from 'flarum/extend';
import AdminNav from 'flarum/admin/components/AdminNav';

app.initializers.add('ramon/colored', () => {
  // Configurações dos elementos permitidos
  const enabledElements = {
    header: false,    // Header Border
    button: false,    // Primary Buttons
    composer: false   // Text Editor
  };

  // Registro das configurações da extensão
  const settings = app.extensionData.for('ramon-colored');

  settings.registerSetting({
    setting: 'colored.transitionType',
    label: app.translator.trans('colored.admin.settings.transition_delay_label'),
    help: app.translator.trans('colored.admin.settings.transition_delay_help'),
    type: 'select',
    options: {
      fast: app.translator.trans('colored.admin.settings.transition_speeds.fast'),
      normal: app.translator.trans('colored.admin.settings.transition_speeds.normal'),
      slow: app.translator.trans('colored.admin.settings.transition_speeds.slow')
    },
    default: 'normal'
  });

  // Registrar apenas os elementos permitidos
  Object.keys(enabledElements).forEach(element => {
    settings.registerSetting({
      setting: `colored.elements.${element}`,
      label: app.translator.trans(`colored.admin.settings.elements.${element}_label`),
      help: app.translator.trans(`colored.admin.settings.elements.${element}_description`),
      type: 'boolean',
      default: enabledElements[element]
    });
  });
});
