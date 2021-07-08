import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import GlobalSearchState from 'flarum/forum/states/GlobalSearchState';
import DiscussionSearch from './DiscussionSearch';

export default class SplitPostModal extends Modal {
    oninit(vnode) {
        super.oninit(vnode);

        this.discussion = this.attrs.post.discussion();

        this.splitTypes = ['new', 'existing'];
        this.selectedType = Stream(this.splitTypes[0]);

        this.newDiscussionTitle = Stream('');
        this.targetDiscussion = Stream(null);

        this.search = new GlobalSearchState();
    }

    className() {
        return 'SplitPostModal Modal--large';
    }

    title() {
        return app.translator.trans('fof-split.forum.modal.title');
    }

    content() {
        return [
            <div className="Modal-body">
                <div className="Form">
                    <div className="Form-group">
                        {this.splitTypes.map((key) => (
                            <div>
                                <input type="radio" id={`type_${key}`} checked={this.selectedType() === key} onclick={() => this.selectedType(key)} />
                                &nbsp;
                                <label htmlFor={`type_${key}`}>{app.translator.trans(`fof-split.forum.modal.type_${key}_label`)}</label>
                            </div>
                        ))}
                    </div>

                    <div className="Form-group">
                        {this.selectedType() === this.splitTypes[0] ? (
                            <label>
                                {app.translator.trans('fof-split.forum.modal.new_discussion_label')}
                                <input type="text" className="FormControl" bidi={this.newDiscussionTitle} />
                            </label>
                        ) : (
                            <label>
                                {app.translator.trans('fof-split.forum.modal.search_discussion_label')}
                                <DiscussionSearch state={this.search} onSelect={this.select} ignore={this.discussion.id()} />
                            </label>
                        )}
                    </div>

                    {this.selectedType() === this.splitTypes[1] && this.targetDiscussion() && (
                        <p>
                            {app.translator.trans('fof-split.forum.modal.split_to_discussion_help', {
                                title: this.targetDiscussion().title(),
                            })}
                        </p>
                    )}

                    <div className="Form-group">
                        <Button className="Button Button--primary Button--block" loading={this.loading} type="submit" disabled={this.disabled()}>
                            {app.translator.trans('fof-split.forum.modal.submit_button')}
                        </Button>
                    </div>
                </div>
            </div>,
        ];
    }

    disabled = () => {
        if (this.selectedType() === this.splitTypes[0] && this.newDiscussionTitle()) {
            return false;
        }

        return !(this.selectedType() === this.splitTypes[1] && this.targetDiscussion() && this.targetDiscussion().id());
    };

    select = (discussion) => {
        if (discussion && discussion.id() === this.discussion.id()) return;

        this.targetDiscussion(discussion);
    };

    onsubmit(e) {
        e.preventDefault();

        this.loading = true;

        const data = new FormData();

        data.append('start_post_id', this.attrs.split.startPostId);
        data.append('end_post_number', this.attrs.post.number());

        let url = app.forum.attribute('apiUrl') + '/split';
        if (this.selectedType() === this.splitTypes[0]) {
            data.append('title', this.newDiscussionTitle());
        } else {
            data.append('discussion_id', this.targetDiscussion().id());
            url += '_to';
        }

        app.request({
            method: 'POST',
            url,
            serialize: (raw) => raw,
            body: data,
        }).then((data) => {
            let discussion = {};
            discussion.id = Stream(data.data.id);
            discussion.slug = Stream(data.data.attributes.slug);
            discussion.startUser = Stream(data.data.attributes.startUser);
            discussion.isUnread = Stream(data.data.attributes.isUnread);
            this.hide();
            m.route.set(app.route.discussion(discussion));
        }, this.loaded.bind(this));
    }
}
