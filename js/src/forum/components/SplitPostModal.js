import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';

export default class SplitPostModal extends Modal {
    oninit(vnode) {
        super.oninit(vnode);

        this.newDiscussionTitle = Stream('');
    }

    className() {
        return 'SplitPostModal Modal--small';
    }

    title() {
        return app.translator.trans('fof-split.forum.modal.title');
    }

    content() {
        return [
            m('div', { className: 'Modal-body' }, [
                m('div', { className: 'Form Form--centered' }, [
                    m('div', { className: 'Form-group' }, [
                        m('label', {}, app.translator.trans('fof-split.forum.modal.new_discussion_label')),
                        m('input', {
                            className: 'FormControl',
                            name: 'new_discussion_title',
                            bidi: this.newDiscussionTitle,
                        }),
                    ]),
                    m('div', { className: 'Form-group' }, [
                        m(
                            Button,
                            {
                                className: 'Button Button--primary Button--block',
                                type: 'submit',
                                loading: this.loading,
                                disabled: !this.newDiscussionTitle(),
                            },
                            app.translator.trans('fof-split.forum.modal.submit_button')
                        ),
                    ]),
                ]),
            ]),
        ];
    }

    onsubmit(e) {
        e.preventDefault();

        this.loading = true;

        const data = new FormData();

        data.append('title', this.newDiscussionTitle());
        data.append('start_post_id', app.__fof_split.splitController.startPostId);
        data.append('end_post_number', this.attrs.post.number());

        app.request({
            method: 'POST',
            url: app.forum.attribute('apiUrl') + '/split',
            serialize: (raw) => raw,
            body: data,
        }).then((data) => {
            let discussion = {};

            discussion.id = Stream(data.data.id);
            discussion.slug = Stream(data.data.attributes.slug);
            discussion.startUser = Stream(data.data.attributes.startUser);
            discussion.isUnread = Stream(data.data.attributes.isUnread);

            app.__fof_split.splitController.reset();

            this.hide();
            m.route.set(app.route.discussion(discussion));
        }, this.loaded.bind(this));
    }
}
