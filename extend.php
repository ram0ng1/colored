<?php

/*
 * This file is part of ramon/colored.
 *
 * Copyright (c) 2025 Ramon Guilherme.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Ramon\Colored;

use Flarum\Extend;
use Flarum\Settings\SettingsRepositoryInterface;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less'),
    
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/resources/less/admin.less'),
    
    new Extend\Locales(__DIR__ . '/resources/locale'),

    // Registrar configurações individuais para o frontend
    (new Extend\Settings())
        ->serializeToForum('colored.elements.header', 'colored.elements.header')
        ->serializeToForum('colored.elements.button', 'colored.elements.button')
        ->serializeToForum('colored.elements.composer', 'colored.elements.composer')
        ->serializeToForum('colored.transitionType', 'colored.transitionType')
];
