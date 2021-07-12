import { extend } from 'flarum/common/extend';
import app from 'flarum/common/app';
import PostControls from 'flarum/common/utils/PostControls';
import Button from 'flarum/common/components/Button';
import CommentPost from 'flarum/common/components/CommentPost';
import SplitPostModal from './components/SplitPostModal';

export default function () {
    extend(PostControls, 'moderationControls', function (items, post) {
        const discussion = post.discussion();

        if (post.contentType() !== 'comment' || !discussion.canSplit() || post.number() == 1) return;

        if (!app.__fof_split.splitting) {
            items.add('splitFrom', [
                m(
                    Button,
                    {
                        icon: 'fas fa-code-branch',
                        className: 'flagrow-split-startSplitButton',
                        onclick: () => {
                            app.__fof_split.splitController.start(post.id(), post.number());
                        },
                    },
                    app.translator.trans('fof-split.forum.split.from')
                ),
            ]);
        }
    });

    extend(CommentPost.prototype, 'footerItems', function (items) {
        const post = this.attrs.post;
        const discussion = post.discussion();

        if (post.contentType() !== 'comment' || !discussion.canSplit() || post.number() === 1) return;

        if (app.__fof_split.splitting && post.number() >= app.__fof_split.splittingFrom) {
            items.add('splitTo', [
                <Button
                    icon="fas fa-code-branch"
                    className="flagrow-split-endSplitButton Button Button--link"
                    onclick={() => {
                        app.modal.show(SplitPostModal, {
                            post: post,
                        });
                    }}
                >
                    {app.translator.trans('fof-split.forum.split.to')}
                </Button>,
                <Button
                    icon="fas fa-times"
                    className="flagrow-split-cancelSplitButton Button Button--link"
                    onclick={() => {
                        app.__fof_split.splitController.reset();
                        m.redraw();
                    }}
                >
                    {app.translator.trans('fof-split.forum.split.cancel')}
                </Button>,
            ]);
        }
    });
}
