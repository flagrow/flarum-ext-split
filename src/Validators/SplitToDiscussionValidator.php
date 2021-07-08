<?php

/*
 * This file is part of fof/split.
 *
 * Copyright (c) Flagrow.
 * Copyright (c) 2021 FriendsOfFlarum
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace FoF\Split\Validators;

use Flarum\Foundation\AbstractValidator;

class SplitToDiscussionValidator extends AbstractValidator
{
    /**
     * @return array
     */
    protected function getRules()
    {
        return [
            'start_post_id' => [
                'required',
                'int',
                'exists:posts,id',
            ],
            'end_post_id'   => [
                'required',
                'int',
                'exists:posts,id',
            ],
            'discussion_id' => [
                'required',
                'int',
                'exists:discussions,id',
            ],
        ];
    }
}
