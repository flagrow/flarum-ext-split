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

namespace FoF\Split\Api\Commands;

use Flarum\User\User;

class SplitToDiscussion
{
    /**
     * The post to start splitting from.
     *
     * @var int
     */
    public int $start_post_id;

    /**
     * The post to end splitting on.
     *
     * @var int
     */
    public int $end_post_number;

    /**
     * The id of the target discussion.
     *
     * @var string
     */
    public $discussion_id;

    /**
     * The user performing the action.
     *
     * @var User
     */
    public User $actor;

    /**
     * SplitDiscussion constructor.
     *
     * @param int  $discussion_id
     * @param int  $start_post_id
     * @param int  $end_post_number
     * @param User $actor
     */
    public function __construct(int $discussion_id, int $start_post_id, int $end_post_number, User $actor)
    {
        $this->discussion_id = $discussion_id;
        $this->start_post_id = $start_post_id;
        $this->end_post_number = $end_post_number;
        $this->actor = $actor;
    }
}
