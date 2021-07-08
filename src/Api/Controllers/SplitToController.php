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

namespace FoF\Split\Api\Controllers;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Http\RequestUtil;
use FoF\Split\Api\Commands\SplitToDiscussion;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class SplitToController extends AbstractShowController
{
    /**
     * The serializer instance for this request.
     *
     * @var string
     */
    public $serializer = DiscussionSerializer::class;

    /**
     * @va Dispatcher
     */
    protected Dispatcher $bus;

    /**
     * @param Dispatcher $bus
     */
    public function __construct(Dispatcher $bus)
    {
        $this->bus = $bus;
    }

    /**
     * Get the data to be serialized and assigned to the response document.
     *
     * @param ServerRequestInterface $request
     * @param Document               $document
     *
     * @return mixed
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $discussion_id = Arr::get($request->getParsedBody(), 'discussion_id');
        $start_post_id = Arr::get($request->getParsedBody(), 'start_post_id');
        $end_post_number = Arr::get($request->getParsedBody(), 'end_post_number');
        $actor = RequestUtil::getActor($request);

        return $this->bus->dispatch(
            new SplitToDiscussion($discussion_id, $start_post_id, $end_post_number, $actor)
        );
    }
}
