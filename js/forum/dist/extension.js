System.register('flagrow/split/addSplitControl', ['flarum/extend', 'flarum/app', 'flarum/utils/PostControls', 'flarum/components/Button', 'flarum/components/CommentPost', 'flarum/components/DiscussionPage', 'flagrow/split/components/SplitPostModal'], function (_export) {
    'use strict';

    var extend, app, PostControls, Button, CommentPost, DiscussionPage, SplitPostModal;
    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumApp) {
            app = _flarumApp['default'];
        }, function (_flarumUtilsPostControls) {
            PostControls = _flarumUtilsPostControls['default'];
        }, function (_flarumComponentsButton) {
            Button = _flarumComponentsButton['default'];
        }, function (_flarumComponentsCommentPost) {
            CommentPost = _flarumComponentsCommentPost['default'];
        }, function (_flarumComponentsDiscussionPage) {
            DiscussionPage = _flarumComponentsDiscussionPage['default'];
        }, function (_flagrowSplitComponentsSplitPostModal) {
            SplitPostModal = _flagrowSplitComponentsSplitPostModal['default'];
        }],
        execute: function () {
            _export('default', function () {

                extend(PostControls, 'moderationControls', function (items, post) {
                    var discussion = post.discussion();

                    if (post.isHidden() || post.contentType() !== 'comment' || !discussion.canSplit()) return;

                    items.add('splitFrom', [m(Button, {
                        icon: 'code-fork',
                        // i'm not sure whether setting this attribute on app.current is the correct way,
                        // there is a discussion property on this object though
                        // luceos on feb 7 2016
                        onclick: function onclick() {
                            app.current.splitting = true;m.redraw();
                        },
                        className: 'flagrow-split-startSplitButton'
                    }, app.translator.trans('flagrow-split.forum.post_controls.split_button'))]);
                });

                extend(CommentPost.prototype, 'footerItems', function (items) {
                    var post = this.props.post;
                    var discussion = post.discussion();

                    if (post.isHidden() || post.contentType() !== 'comment' || !discussion.canSplit()) return;

                    var isSplitting = function isSplitting() {
                        return app.current.splitting;
                    };

                    // even after app.current.splitting is set to true, we never get at this point after page load..
                    // the m.redraw does not trigger a redraw of this element or change the value of isSplitting, maybe
                    // because it's a var?
                    // luceos @ feb 7 2016

                    items.add('splitTo', [m(Button, {
                        icon: 'code-fork',
                        className: 'flagrow-split-endSplitButton Button Button--link',
                        onclick: function onclick() {
                            app.current.splitting = false;
                        },
                        // @todo the above is a temporary test solution, we need to implement the modal
                        //onclick: () => app.modal.show(new SplitPostModal(post)),
                        style: { display: isSplitting() ? "block" : "none" }
                    }, app.translator.trans('flagrow-split.forum.post_footer.split_button'))]);
                });
            });
        }
    };
});;
System.register('flagrow/split/components/SplitPostModal', ['flarum/components/Modal', 'flarum/components/Button'], function (_export) {
    'use strict';

    var Modal, Button, SplitPostModal;
    return {
        setters: [function (_flarumComponentsModal) {
            Modal = _flarumComponentsModal['default'];
        }, function (_flarumComponentsButton) {
            Button = _flarumComponentsButton['default'];
        }],
        execute: function () {
            SplitPostModal = (function (_Modal) {
                babelHelpers.inherits(SplitPostModal, _Modal);

                function SplitPostModal() {
                    babelHelpers.classCallCheck(this, SplitPostModal);
                    babelHelpers.get(Object.getPrototypeOf(SplitPostModal.prototype), 'constructor', this).apply(this, arguments);
                }

                babelHelpers.createClass(SplitPostModal, [{
                    key: 'init',
                    value: function init() {
                        babelHelpers.get(Object.getPrototypeOf(SplitPostModal.prototype), 'init', this).call(this);

                        this.success = false;

                        this.gotError = false;

                        this.newDiscussionTitle = m.prop('');
                    }
                }, {
                    key: 'className',
                    value: function className() {
                        return 'SplitPostModal Modal--small';
                    }
                }, {
                    key: 'title',
                    value: function title() {
                        return app.translator.trans('flagrow-split.forum.split_post.title');
                    }
                }, {
                    key: 'content',
                    value: function content() {
                        if (this.success && !this.gotError) {
                            return [m('div', { className: 'Modal-body' }, [m('div', { className: 'Form Form--centered' }, [m('p', { className: 'helpText' }, app.translator.trans('flagrow-split.forum.split_post.confirmation_message')), m('div', { className: 'Form-group' }, [m(Button, {
                                className: 'Button Button--primary Button--block',
                                onclick: this.hide.bind(this)
                            }, app.translator.trans('flagrow-split.forum.split_post.dismiss_button'))])])])];
                        }

                        return [m('div', { className: 'Modal-body' }, [m('div', { className: 'Form Form--centered' }, [m('div', { className: 'Form-group' }, [m('label', {}, app.translator.trans('flagrow-split.forum.split_post.new_discussion_label')), m('input', {
                            name: 'new_discussion_title',
                            value: this.newDiscussionTitle(),
                            oninput: m.withAttr('value', this.newDiscussionTitle)
                        })]), m('div', { className: 'Form-group' }, [m(Button, {
                            className: 'Button Button--primary Button--block',
                            type: 'submit',
                            loading: this.loading,
                            disabled: !this.newDiscussionTitle()
                        }, app.translator.trans('flagrow-split.forum.split_post.submit_button'))])])])];
                    }
                }, {
                    key: 'onsubmit',
                    value: function onsubmit(e) {
                        var _this = this;

                        e.preventDefault();

                        this.loading = true;

                        var data = new FormData();
                        data.append('new_discussion_title', this.newDiscussionTitle());
                        data.append('actor', app.session.user);
                        data.append('post', this.props.post);

                        app.request({
                            method: 'POST',
                            url: app.forum.attribute('apiUrl') + '/split',
                            serialize: function serialize(raw) {
                                return raw;
                            },
                            data: data
                        }).then(function () {
                            return _this.success = true;
                        })['finally'](this.loaded.bind(this));

                        // app.store.createRecord('flags').save({
                        //     reason: this.reason() === 'other' ? null : this.reason(),
                        //     reasonDetail: this.reasonDetail(),
                        //     relationships: {
                        //         user: app.session.user,
                        //         post: this.props.post
                        //     }
                        // })
                        // .then(() => this.success = true)
                        // .finally(this.loaded.bind(this));
                    }
                }]);
                return SplitPostModal;
            })(Modal);

            _export('default', SplitPostModal);
        }
    };
});;
System.register('flagrow/split/extendDiscussionPage', ['flarum/extend', 'flarum/components/DiscussionPage'], function (_export) {
    'use strict';

    var extend, DiscussionPage;
    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumComponentsDiscussionPage) {
            DiscussionPage = _flarumComponentsDiscussionPage['default'];
        }],
        execute: function () {
            _export('default', function () {
                extend(DiscussionPage.prototype, 'init', function () {
                    this.splitting = false;
                });
            });
        }
    };
});;
System.register('flagrow/split/main', ['flarum/extend', 'flarum/Model', 'flarum/models/Discussion', 'flagrow/split/addSplitControl', 'flagrow/split/extendDiscussionPage'], function (_export) {
    'use strict';

    var extend, Model, Discussion, addSplitControl, extendDiscussionPage;
    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumModel) {
            Model = _flarumModel['default'];
        }, function (_flarumModelsDiscussion) {
            Discussion = _flarumModelsDiscussion['default'];
        }, function (_flagrowSplitAddSplitControl) {
            addSplitControl = _flagrowSplitAddSplitControl['default'];
        }, function (_flagrowSplitExtendDiscussionPage) {
            extendDiscussionPage = _flagrowSplitExtendDiscussionPage['default'];
        }],
        execute: function () {

            app.initializers.add('flagrow-split', function (app) {

                app.store.models.discussions.prototype.canSplit = Model.attribute('canSplit');

                extendDiscussionPage();

                addSplitControl();
            });
        }
    };
});