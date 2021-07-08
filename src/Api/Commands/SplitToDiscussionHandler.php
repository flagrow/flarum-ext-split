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

use Flarum\Discussion\Discussion;
use Flarum\Post\Post;
use Flarum\Post\PostRepository;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Exception\PermissionDeniedException;
use Flarum\User\UserRepository;
use FoF\Split\Events\DiscussionWasSplit;
use FoF\Split\Validators\SplitToDiscussionValidator;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class SplitToDiscussionHandler
{
    /**
     * @var UserRepository
     */
    protected UserRepository $users;

    /**
     * @var PostRepository
     */
    protected PostRepository $posts;

    /**
     * @var SettingsRepositoryInterface
     */
    protected SettingsRepositoryInterface $settings;

    /**
     * @var SplitToDiscussionValidator
     */
    protected SplitToDiscussionValidator $validator;

    /**
     * @var Dispatcher
     */
    protected Dispatcher $events;

    /**
     * @param UserRepository              $users
     * @param PostRepository              $posts
     * @param SettingsRepositoryInterface $settings
     * @param Dispatcher                  $events
     * @param SplitToDiscussionValidator  $validator
     */
    public function __construct(
        UserRepository $users,
        PostRepository $posts,
        SettingsRepositoryInterface $settings,
        Dispatcher $events,
        SplitToDiscussionValidator $validator
    ) {
        $this->users = $users;
        $this->posts = $posts;
        $this->settings = $settings;
        $this->events = $events;
        $this->validator = $validator;
    }

    /**
     * @param SplitToDiscussion $command
     *
     * @throws PermissionDeniedException
     * @throws ValidationException
     *
     * @return Discussion
     */
    public function handle(SplitToDiscussion $command): Discussion
    {
        $this->validator->assertValid([
            'start_post_id'   => $command->start_post_id,
            'end_post_number' => $command->end_post_number,
            'discussion_id'   => $command->discussion_id,
        ]);

        // load the first selected post to split.
        $startPost = $this->posts->findOrFail($command->start_post_id, $command->actor);

        $command->actor->assertCan('split', $startPost->discussion);

        /** @var Discussion $originalDiscussion */
        $originalDiscussion = $startPost->discussion;

        $discussion = Discussion::find($command->discussion_id);

        // update all posts that are split.
        $affectedPosts = $this->assignPostsToDiscussion(
            $originalDiscussion,
            $discussion,
            $startPost->number,
            $command->end_post_number
        );

        $this->renumberDiscussion($originalDiscussion);
        $originalDiscussion = $this->refreshDiscussion($originalDiscussion);

        $this->renumberDiscussion($discussion);
        $discussion = $this->refreshDiscussion($discussion);

        $this->events->dispatch(
            new DiscussionWasSplit($command->actor, $affectedPosts, $originalDiscussion, $discussion)
        );

        return $discussion;
    }

    /**
     * Assign the specific range to a new Discussion without resetting post numbers.
     *
     * @param Discussion $originalDiscussion
     * @param Discussion $discussion
     * @param            $startPostNumber
     * @param            $endPostNumber
     *
     * @return Collection
     */
    protected function assignPostsToDiscussion(
        Discussion $originalDiscussion,
        Discussion $discussion,
        $startPostNumber,
        $endPostNumber
    ): Collection {
        $lastPostNumber = $this->posts
            ->query()
            ->where('discussion_id', $discussion->id)
            ->max('number');

        $this->posts
            ->query()
            ->where('discussion_id', $originalDiscussion->id)
            ->whereBetween('number', [$startPostNumber, $endPostNumber])
            ->each(function (Post $post) use (&$lastPostNumber, $discussion) {
                $lastPostNumber++;
                $post->discussion_id = $discussion->id;
                $post->number = $lastPostNumber;
                $post->save();
            });

        // Update relationship posts on new discussion.
        $discussion->load('posts');

        $discussion->post_number_index = $lastPostNumber;
        $discussion->save();

        return $discussion->posts;
    }

    /**
     * Re-assign numbers starting from one to a discussion.
     *
     * @param Discussion $discussion
     */
    protected function renumberDiscussion(Discussion $discussion)
    {
        $db = resolve('db');

        $db->statement('SET @maxNumber = (SELECT MAX(number) FROM posts WHERE discussion_id = ?);', [$discussion->id]);
        $db->statement('SET @rank = @maxNumber;');
        $db->statement('UPDATE posts SET number=@rank:=@rank+1 WHERE discussion_id = ? ORDER BY created_at;', [$discussion->id]);
        $db->statement('UPDATE posts SET number=number-@maxNumber WHERE discussion_id = ?;', [$discussion->id]);
    }

    /**
     * Refreshes count and last Post for the discussion.
     *
     * @param Discussion $discussion
     *
     * @return mixed
     */
    protected function refreshDiscussion(Discussion $discussion)
    {
        $discussion->refreshLastPost();
        $discussion->refreshCommentCount();
        $discussion->refreshParticipantCount();

        // Persist the new statistics.
        $discussion->save();

        return Discussion::find($discussion->id);
    }
}
