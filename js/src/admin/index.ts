import app from 'flarum/admin/app';

app.initializers.add('ramon-colored', () => {
  app.registry
    .for('ramon-colored')
    .registerSetting({
      setting: 'colored.border_style',
      label: 'Discussion card border',
      help: 'Show a colored border on discussion list cards.',
      type: 'select',
      options: {
        none: 'None',
        left: 'Left border',
        full: 'Full border',
      },
      default: 'none',
    });
});
